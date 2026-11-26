const oracledb = require('oracledb');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER || 'ES3',
  password: process.env.DB_PASSWORD || 'Admin1234',
  connectString: process.env.DB_CONNECT_STRING || '192.168.56.1:1522/XEPDB1',
};

let pool;

async function initPool() {
  if (!pool) {
    pool = await oracledb.createPool(dbConfig);
  }
  return pool;
}

async function getConnection() {
  const activePool = await initPool();
  return activePool.getConnection();
}

async function closePool() {
  if (pool) {
    try {
      await pool.close(10);
    } finally {
      pool = null;
    }
  }
}

module.exports = {
  oracledb,
  initPool,
  getConnection,
  closePool,
};
```[cite: 7, 9]

---

### 2. `src/utils/oracleHelper.js` — Ejecución de PL/SQL, cursores y normalización

**Qué es y qué hace:**
* **`executePlsql`:** Pide una conexión del pool, ejecuta un bloque `BEGIN ... END;` (un procedimiento o función en Oracle) con sus parámetros (`binds`) y **siempre** devuelve la conexión al pool en `finally` (`await conn.close()`) para no dejar conexiones colgadas si algo falla[cite: 12].
* **Normalización a minúsculas (`normalizeRow` / `normalizeRows`):** Con `OUT_FORMAT_OBJECT`, Oracle devuelve las columnas como `{ ID_USUARIO: 1, NOMBRE_ROL: 'ADMIN' }`. Convertir las claves a minúsculas evita errores cuando JavaScript/React lee `user.id_usuario` o `user.nombre_rol`[cite: 12].
* **`readCursor`:** Cuando Oracle devuelve un `SYS_REFCURSOR` (un cursor con filas), este helper lee los registros, normaliza sus nombres de campo y cierra el cursor[cite: 12].
* **`mapOracleError`:** Traduce errores propios de Oracle (`ORA-20000` a `ORA-20999` son errores de negocio lanzados por su PL/SQL, `ORA-00001` es duplicado) a códigos HTTP comprensibles (`400`, `409`, `404`, `500`)[cite: 12].

```javascript
const { oracledb, getConnection } = require('../config/db');

function normalizeRow(row) {
  if (!row || typeof row !== 'object') return row;
  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}

function normalizeRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(normalizeRow);
}

function mapOracleError(err) {
  const message = err && err.message ? err.message : 'Error inesperado en la base de datos';
  const oraMatch = message.match(/ORA-(\d{5}):\s*([^\n]+)/);
  const code = oraMatch ? Number(oraMatch[1]) : null;
  const cleanMsg = oraMatch ? oraMatch[2].trim() : message;

  let statusCode = 500;
  if (code >= 20000 && code <= 20999) {
    statusCode = 400;
  } else if (code === 1 || code === 2290) {
    statusCode = 409;
  } else if (code === 1403) {
    statusCode = 404;
  }

  return { statusCode, message: cleanMsg };
}

async function readCursor(cursor) {
  if (!cursor) return [];
  try {
    const rows = await cursor.getRows(500);
    return normalizeRows(rows || []);
  } finally {
    try {
      await cursor.close();
    } catch (_) {
      // Ignorar error si el cursor ya estaba cerrado
    }
  }
}

async function executePlsql(plsqlBlock, binds = {}, options = {}) {
  const conn = await getConnection();
  try {
    const result = await conn.execute(plsqlBlock, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: options.autoCommit !== undefined ? options.autoCommit : true,
    });

    const outBinds = result.outBinds || {};
    const parsedData = {};

    for (const [key, val] of Object.entries(outBinds)) {
      if (val && typeof val.getRows === 'function') {
        parsedData[key] = await readCursor(val);
      } else if (Array.isArray(val)) {
        parsedData[key] = normalizeRows(val);
      } else if (val && typeof val === 'object' && !(val instanceof Date) && !Buffer.isBuffer(val)) {
        parsedData[key] = normalizeRow(val);
      } else {
        parsedData[key] = val;
      }
    }

    if (outBinds.o_mensaje && typeof outBinds.o_mensaje === 'string') {
      const msg = outBinds.o_mensaje.trim();
      if (msg.toUpperCase().startsWith('ERROR')) {
        const err = new Error(msg.replace(/^ERROR:\s*/i, ''));
        err.statusCode = 400;
        throw err;
      }
    }

    return parsedData;
  } catch (err) {
    if (err.statusCode) {
      throw err;
    }
    const mapped = mapOracleError(err);
    const wrapped = new Error(mapped.message);
    wrapped.statusCode = mapped.statusCode;
    throw wrapped;
  } finally {
    try {
      await conn.close();
    } catch (_) {
      // Ignorar error si la conexión ya se cerró
    }
  }
}

module.exports = {
  oracledb,
  executePlsql,
  normalizeRow,
  normalizeRows,
};
```[cite: 12]

---

### 3. `src/controllers/authController.js` — Login contra PL/SQL

**Qué es y qué hace:**
Recibe lo que manda el cliente (`nombre_usuario` o `nombreUsuario`, y `clave`, `clave_hash` o `password`), valida que vengan ambos datos, llama al procedimiento `PROC_VALIDAR_LOGIN` en Oracle para verificar credenciales, y luego llama a `FUNC_LOGIN_USUARIO` para traer los datos del usuario ya normalizados en minúsculas[cite: 10].

```javascript
const { oracledb, executePlsql, normalizeRow } = require('../utils/oracleHelper');

async function login(req, res, next) {
  try {
    const { nombre_usuario, nombreUsuario, clave, clave_hash, password } = req.body || {};
    const usuario = (nombre_usuario || nombreUsuario || '').trim();
    const credencial = clave || clave_hash || password || '';

    if (!usuario || !credencial) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Debes ingresar nombre de usuario y clave',
      });
    }

    const validation = await executePlsql(
      `BEGIN
         PROC_VALIDAR_LOGIN(
           :p_nombre_usuario,
           :p_clave_hash,
           :o_id_usuario,
           :o_nombre_rol,
           :o_mensaje
         );
       END;`,
      {
        p_nombre_usuario: usuario,
        p_clave_hash: credencial,
        o_id_usuario: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_nombre_rol: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    if (!validation.o_id_usuario) {
      return res.status(401).json({
        success: false,
        data: null,
        message: validation.o_mensaje || 'Credenciales inválidas',
      });
    }

    const userData = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_LOGIN_USUARIO(:p_nombre_usuario);
       END;`,
      {
        p_nombre_usuario: usuario,
        o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    const rows = userData.o_cursor || [];
    const perfil = normalizeRow(
      rows[0] || {
        id_usuario: validation.o_id_usuario,
        nombre_usuario: usuario,
        nombre_rol: validation.o_nombre_rol,
      }
    );

    return res.status(200).json({
      success: true,
      data: perfil,
      message: validation.o_mensaje || 'Inicio de sesión exitoso',
    });
  } catch (err) {
    if (err.statusCode === 400 || err.statusCode === 401) {
      return res.status(err.statusCode).json({
        success: false,
        data: null,
        message: err.message,
      });
    }
    next(err);
  }
}

module.exports = { login };

const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const { oracledb, executePlsql } = require('../utils/oracleHelper');

const deriveKey = promisify(scrypt);

async function login(req, res, next) {
  try {
    const { nombre_usuario, nombreUsuario, clave, clave_hash, password } = req.body || {};
    const nombre = nombre_usuario ?? nombreUsuario;
    const credencial = clave ?? clave_hash ?? password;
    if (typeof nombre !== 'string' || !nombre.trim() ||
        typeof credencial !== 'string' || !credencial || credencial.length > 255) {
      return res.status(400).json({ success: false, data: null, message: 'Debes ingresar usuario y clave válidos' });
    }

    const { o_cursor: perfiles } = await executePlsql(
      'BEGIN :o_cursor := FUNC_LOGIN_USUARIO(:p_nombre_usuario); END;',
      {
        p_nombre_usuario: nombre.trim(),
        o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    const { clave_hash: almacenada, ...perfil } = perfiles?.[0] || {};
    let claveValida = false;
    if (almacenada?.startsWith('scrypt:')) {
      const formato = /^scrypt:([0-9a-f]{32}):([0-9a-f]{128})$/.exec(almacenada);
      if (formato) {
        const [, salt, hash] = formato;
        const calculado = await deriveKey(credencial, salt, 64);
        claveValida = timingSafeEqual(Buffer.from(hash, 'hex'), calculado);
      }
    } else {
      claveValida = credencial === almacenada;
    }

    if (!claveValida || perfil.activo !== 1) {
      return res.status(401).json({ success: false, data: null, message: 'Credenciales inválidas o cuenta inactiva' });
    }

    return res.json({ success: true, data: perfil, message: 'Inicio de sesión exitoso' });
  } catch (err) {
    next(err);
  }
}

async function registrar(req, res, next) {
  try {
    const { nombre_usuario, nombres, apellidos, clave } = req.body || {};
    const campos = [[nombre_usuario, 50], [nombres, 80], [apellidos, 100]];
    if (campos.some(([campo, max]) => typeof campo !== 'string' || !campo.trim() || campo.trim().length > max) ||
        typeof clave !== 'string' || !clave.trim() || clave.length < 8 || clave.length > 128) {
      return res.status(400).json({
        success: false, data: null, message: 'Completa todos los campos y usa una contraseña de 8 a 128 caracteres.',
      });
    }

    const salt = randomBytes(16).toString('hex');
    const hash = await deriveKey(clave, salt, 64);
    const result = await executePlsql(
      'BEGIN PROC_SOLICITAR_USUARIO(:p_nombre_usuario, :p_clave_hash, :p_nombres, :p_apellidos, :o_mensaje); END;',
      {
        p_nombre_usuario: nombre_usuario.trim(),
        p_nombres: nombres.trim(),
        p_apellidos: apellidos.trim(),
        p_clave_hash: `scrypt:${salt}:${hash.toString('hex')}`,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );
    return res.status(201).json({ success: true, data: null, message: result.o_mensaje });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, registrar };

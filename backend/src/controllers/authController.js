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
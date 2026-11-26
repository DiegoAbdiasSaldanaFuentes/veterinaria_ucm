const { oracledb, executePlsql } = require('../utils/oracleHelper');

function toNumberOrNull(val) {
  if (val === undefined || val === null || val === '') return null;
  const num = Number(val);
  return Number.isNaN(num) ? null : num;
}

function toDateOrNull(val) {
  if (!val) return null;
  const d = val instanceof Date ? val : new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ============================================================================
// 1. ROLES
// ============================================================================
async function listarRoles(req, res, next) {
  try {
    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_GET_ROLES();
       END;`,
      {
        o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    return res.status(200).json({ success: true, data: result.o_cursor || [] });
  } catch (err) {
    next(err);
  }
}

async function crearRol(req, res, next) {
  try {
    const nombreRol = (req.body?.nombre_rol || req.body?.nombreRol || '').trim();
    if (!nombreRol) {
      return res.status(400).json({ success: false, data: null, message: 'El nombre del rol es obligatorio' });
    }
    const result = await executePlsql(
      `BEGIN
         PROC_CREAR_ROL(:p_nombre_rol, :o_id_rol, :o_mensaje);
       END;`,
      {
        p_nombre_rol: nombreRol,
        o_id_rol: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );
    return res.status(201).json({
      success: true,
      data: { id_rol: result.o_id_rol },
      message: result.o_mensaje || 'Rol creado',
    });
  } catch (err) {
    next(err);
  }
}

async function actualizarRol(req, res, next) {
  try {
    const idRol = toNumberOrNull(req.params.id);
    const nombreRol = (req.body?.nombre_rol || req.body?.nombreRol || '').trim();
    if (!idRol || !nombreRol) {
      return res.status(400).json({ success: false, data: null, message: 'ID de rol y nombre son obligatorios' });
    }
    const result = await executePlsql(
      `BEGIN
         PROC_ACTUALIZAR_ROL(:p_id_rol, :p_nombre_rol, :o_mensaje);
       END;`,
      {
        p_id_rol: idRol,
        p_nombre_rol: nombreRol,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );
    return res.status(200).json({ success: true, data: null, message: result.o_mensaje || 'Rol actualizado' });
  } catch (err) {
    next(err);
  }
}

async function eliminarRol(req, res, next) {
  try {
    const idRol = toNumberOrNull(req.params.id);
    if (!idRol) {
      return res.status(400).json({ success: false, data: null, message: 'ID de rol inválido' });
    }
    const result = await executePlsql(
      `BEGIN
         PROC_ELIMINAR_ROL(:p_id_rol, :o_mensaje);
       END;`,
      {
        p_id_rol: idRol,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );
    return res.status(200).json({ success: true, data: null, message: result.o_mensaje || 'Rol eliminado' });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// 2. USUARIOS
// ============================================================================
async function listarUsuarios(req, res, next) {
  try {
    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_GET_USUARIOS();
       END;`,
      {
        o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    return res.status(200).json({ success: true, data: result.o_cursor || [] });
  } catch (err) {
    next(err);
  }
}

async function crearUsuario(req, res, next) {
  try {
    const body = req.body || {};
    const idRol = toNumberOrNull(body.id_rol ?? body.idRol);
    const nombreUsuario = (body.nombre_usuario || body.nombreUsuario || '').trim();
    const claveHash = body.clave_hash || body.clave || body.password || '';
    const nombres = (body.nombres || '').trim();
    const apellidos = (body.apellidos || '').trim();

    if (!idRol || !nombreUsuario || !claveHash || !nombres || !apellidos) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Faltan campos obligatorios para crear usuario',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_CREAR_USUARIO(
           :p_id_rol, :p_nombre_usuario, :p_clave_hash,
           :p_nombres, :p_apellidos, :o_id_usuario, :o_mensaje
         );
       END;`,
      {
        p_id_rol: idRol,
        p_nombre_usuario: nombreUsuario,
        p_clave_hash: claveHash,
        p_nombres: nombres,
        p_apellidos: apellidos,
        o_id_usuario: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(201).json({
      success: true,
      data: { id_usuario: result.o_id_usuario },
      message: result.o_mensaje || 'Usuario creado',
    });
  } catch (err) {
    next(err);
  }
}

async function actualizarUsuario(req, res, next) {
  try {
    const idUsuario = toNumberOrNull(req.params.id);
    const body = req.body || {};
    const idRol = toNumberOrNull(body.id_rol ?? body.idRol);
    const nombres = (body.nombres || '').trim();
    const apellidos = (body.apellidos || '').trim();
    const activo = toNumberOrNull(body.activo ?? 1);
    const claveHash = body.clave_hash || body.clave || body.password || null;

    if (!idUsuario || !idRol || !nombres || !apellidos || activo === null) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Faltan campos obligatorios para actualizar usuario',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ACTUALIZAR_USUARIO(
           :p_id_usuario, :p_id_rol, :p_nombres,
           :p_apellidos, :p_activo, :o_mensaje, :p_clave_hash
         );
       END;`,
      {
        p_id_usuario: idUsuario,
        p_id_rol: idRol,
        p_nombres: nombres,
        p_apellidos: apellidos,
        p_activo: activo,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
        p_clave_hash: claveHash,
      }
    );

    return res.status(200).json({ success: true, data: null, message: result.o_mensaje || 'Usuario actualizado' });
  } catch (err) {
    next(err);
  }
}

async function eliminarUsuario(req, res, next) {
  try {
    const idUsuario = toNumberOrNull(req.params.id);
    if (!idUsuario) {
      return res.status(400).json({ success: false, data: null, message: 'ID de usuario inválido' });
    }
    const result = await executePlsql(
      `BEGIN
         PROC_ELIMINAR_USUARIO(:p_id_usuario, :o_mensaje);
       END;`,
      {
        p_id_usuario: idUsuario,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );
    return res.status(200).json({ success: true, data: null, message: result.o_mensaje || 'Usuario eliminado' });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// 3. CLIENTES
// ============================================================================
async function listarClientes(req, res, next) {
  try {
    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_GET_CLIENTES();
       END;`,
      {
        o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    return res.status(200).json({ success: true, data: result.o_cursor || [] });
  } catch (err) {
    next(err);
  }
}

async function crearCliente(req, res, next) {
  try {
    const body = req.body || {};
    const rut = (body.rut || '').trim() || null;
    const nombres = (body.nombres || '').trim();
    const apellidos = (body.apellidos || '').trim();
    const telefono = (body.telefono || '').trim() || null;
    const correo = (body.correo || '').trim() || null;

    if (!nombres || !apellidos) {
      return res.status(400).json({ success: false, data: null, message: 'Nombres y apellidos son obligatorios' });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_CREAR_CLIENTE(
           :p_rut, :p_nombres, :p_apellidos,
           :p_telefono, :p_correo, :o_id_cliente, :o_mensaje
         );
       END;`,
      {
        p_rut: rut,
        p_nombres: nombres,
        p_apellidos: apellidos,
        p_telefono: telefono,
        p_correo: correo,
        o_id_cliente: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(201).json({
      success: true,
      data: { id_cliente: result.o_id_cliente },
      message: result.o_mensaje || 'Cliente creado',
    });
  } catch (err) {
    next(err);
  }
}

async function actualizarCliente(req, res, next) {
  try {
    const idCliente = toNumberOrNull(req.params.id);
    const body = req.body || {};
    if (!idCliente) {
      return res.status(400).json({ success: false, data: null, message: 'ID de cliente inválido' });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ACTUALIZAR_CLIENTE(
           :p_id_cliente, :p_telefono, :p_correo,
           :o_mensaje, :p_nombres, :p_apellidos
         );
       END;`,
      {
        p_id_cliente: idCliente,
        p_telefono: (body.telefono || '').trim() || null,
        p_correo: (body.correo || '').trim() || null,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
        p_nombres: body.nombres ? String(body.nombres).trim() : null,
        p_apellidos: body.apellidos ? String(body.apellidos).trim() : null,
      }
    );

    return res.status(200).json({ success: true, data: null, message: result.o_mensaje || 'Cliente actualizado' });
  } catch (err) {
    next(err);
  }
}

async function eliminarCliente(req, res, next) {
  try {
    const idCliente = toNumberOrNull(req.params.id);
    if (!idCliente) {
      return res.status(400).json({ success: false, data: null, message: 'ID de cliente inválido' });
    }
    const result = await executePlsql(
      `BEGIN
         PROC_ELIMINAR_CLIENTE(:p_id_cliente, :o_mensaje);
       END;`,
      {
        p_id_cliente: idCliente,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );
    return res.status(200).json({ success: true, data: null, message: result.o_mensaje || 'Cliente eliminado' });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// 4. ESPECIES
// ============================================================================
async function listarEspecies(req, res, next) {
  try {
    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_GET_ESPECIES();
       END;`,
      {
        o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    return res.status(200).json({ success: true, data: result.o_cursor || [] });
  } catch (err) {
    next(err);
  }
}

async function crearEspecie(req, res, next) {
  try {
    const nombreEspecie = (req.body?.nombre_especie || req.body?.nombreEspecie || '').trim();
    if (!nombreEspecie) {
      return res.status(400).json({ success: false, data: null, message: 'El nombre de especie es obligatorio' });
    }
    const result = await executePlsql(
      `BEGIN
         PROC_CREAR_ESPECIE(:p_nombre_especie, :o_id_especie, :o_mensaje);
       END;`,
      {
        p_nombre_especie: nombreEspecie,
        o_id_especie: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );
    return res.status(201).json({
      success: true,
      data: { id_especie: result.o_id_especie },
      message: result.o_mensaje || 'Especie creada',
    });
  } catch (err) {
    next(err);
  }
}

async function actualizarEspecie(req, res, next) {
  try {
    const idEspecie = toNumberOrNull(req.params.id);
    const nombreEspecie = (req.body?.nombre_especie || req.body?.nombreEspecie || '').trim();
    if (!idEspecie || !nombreEspecie) {
      return res.status(400).json({ success: false, data: null, message: 'ID y nombre de especie son obligatorios' });
    }
    const result = await executePlsql(
      `BEGIN
         PROC_ACTUALIZAR_ESPECIE(:p_id_especie, :p_nombre_especie, :o_mensaje);
       END;`,
      {
        p_id_especie: idEspecie,
        p_nombre_especie: nombreEspecie,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );
    return res.status(200).json({ success: true, data: null, message: result.o_mensaje || 'Especie actualizada' });
  } catch (err) {
    next(err);
  }
}

async function eliminarEspecie(req, res, next) {
  try {
    const idEspecie = toNumberOrNull(req.params.id);
    if (!idEspecie) {
      return res.status(400).json({ success: false, data: null, message: 'ID de especie inválido' });
    }
    const result = await executePlsql(
      `BEGIN
         PROC_ELIMINAR_ESPECIE(:p_id_especie, :o_mensaje);
       END;`,
      {
        p_id_especie: idEspecie,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );
    return res.status(200).json({ success: true, data: null, message: result.o_mensaje || 'Especie eliminada' });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// 5. PACIENTES
// ============================================================================
async function listarPacientes(req, res, next) {
  try {
    const idCliente = toNumberOrNull(req.query?.id_cliente ?? req.query?.idCliente);
    const result = idCliente
      ? await executePlsql(
          `BEGIN
             :o_cursor := FUNC_GET_PACIENTES_POR_CLIENTE(:p_id_cliente);
           END;`,
          {
            p_id_cliente: idCliente,
            o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          }
        )
      : await executePlsql(
          `BEGIN
             :o_cursor := FUNC_GET_PACIENTES();
           END;`,
          {
            o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          }
        );

    return res.status(200).json({ success: true, data: result.o_cursor || [] });
  } catch (err) {
    next(err);
  }
}

async function crearPaciente(req, res, next) {
  try {
    const body = req.body || {};
    const idCliente = toNumberOrNull(body.id_cliente ?? body.idCliente);
    const idEspecie = toNumberOrNull(body.id_especie ?? body.idEspecie);
    const nombrePaciente = (body.nombre_paciente || body.nombrePaciente || '').trim();
    const fechaNacimiento = toDateOrNull(body.fecha_nacimiento || body.fechaNacimiento);

    if (!idCliente || !idEspecie || !nombrePaciente) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Cliente, especie y nombre del paciente son obligatorios',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_CREAR_PACIENTE(
           :p_id_cliente, :p_id_especie, :p_nombre_paciente,
           :p_fecha_nacimiento, :o_id_paciente, :o_mensaje
         );
       END;`,
      {
        p_id_cliente: idCliente,
        p_id_especie: idEspecie,
        p_nombre_paciente: nombrePaciente,
        p_fecha_nacimiento: fechaNacimiento,
        o_id_paciente: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(201).json({
      success: true,
      data: { id_paciente: result.o_id_paciente },
      message: result.o_mensaje || 'Paciente creado',
    });
  } catch (err) {
    next(err);
  }
}

async function actualizarPaciente(req, res, next) {
  try {
    const idPaciente = toNumberOrNull(req.params.id);
    const body = req.body || {};
    const idCliente = toNumberOrNull(body.id_cliente ?? body.idCliente);
    const idEspecie = toNumberOrNull(body.id_especie ?? body.idEspecie);
    const nombrePaciente = (body.nombre_paciente || body.nombrePaciente || '').trim();
    const fechaNacimiento = toDateOrNull(body.fecha_nacimiento || body.fechaNacimiento);

    if (!idPaciente || !idCliente || !idEspecie || !nombrePaciente) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID, cliente, especie y nombre del paciente son obligatorios',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ACTUALIZAR_PACIENTE(
           :p_id_paciente, :p_id_cliente, :p_id_especie,
           :p_nombre_paciente, :p_fecha_nacimiento, :o_mensaje
         );
       END;`,
      {
        p_id_paciente: idPaciente,
        p_id_cliente: idCliente,
        p_id_especie: idEspecie,
        p_nombre_paciente: nombrePaciente,
        p_fecha_nacimiento: fechaNacimiento,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({ success: true, data: null, message: result.o_mensaje || 'Paciente actualizado' });
  } catch (err) {
    next(err);
  }
}

async function eliminarPaciente(req, res, next) {
  try {
    const idPaciente = toNumberOrNull(req.params.id);
    if (!idPaciente) {
      return res.status(400).json({ success: false, data: null, message: 'ID de paciente inválido' });
    }
    const result = await executePlsql(
      `BEGIN
         PROC_ELIMINAR_PACIENTE(:p_id_paciente, :o_mensaje);
       END;`,
      {
        p_id_paciente: idPaciente,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );
    return res.status(200).json({ success: true, data: null, message: result.o_mensaje || 'Paciente eliminado' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarRoles,
  crearRol,
  actualizarRol,
  eliminarRol,
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  listarClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  listarEspecies,
  crearEspecie,
  actualizarEspecie,
  eliminarEspecie,
  listarPacientes,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente,
};

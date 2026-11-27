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
// GESTOR 1: PUNTO DE VENTA (VENTAS Y DETALLE_VENTAS)
// ============================================================================
async function listarVentas(req, res, next) {
  try {
    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_GET_VENTAS();
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

async function obtenerDetalleVenta(req, res, next) {
  try {
    const idVenta = toNumberOrNull(req.params.id);
    if (!idVenta) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de venta inválido',
      });
    }

    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_GET_DETALLE_VENTA(:p_id_venta);
       END;`,
      {
        p_id_venta: idVenta,
        o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    return res.status(200).json({ success: true, data: result.o_cursor || [] });
  } catch (err) {
    next(err);
  }
}

async function crearVenta(req, res, next) {
  try {
    const body = req.body || {};
    const idCliente = toNumberOrNull(body.id_cliente ?? body.idCliente);
    const idUsuario = toNumberOrNull(body.id_usuario ?? body.idUsuario);

    if (!idUsuario) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'El ID de usuario vendedor es obligatorio',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_CREAR_VENTA(:p_id_cliente, :p_id_usuario, :o_id_venta, :o_mensaje);
       END;`,
      {
        p_id_cliente: idCliente,
        p_id_usuario: idUsuario,
        o_id_venta: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(201).json({
      success: true,
      data: { id_venta: result.o_id_venta },
      message: result.o_mensaje || 'Venta registrada',
    });
  } catch (err) {
    next(err);
  }
}

async function agregarDetalleVenta(req, res, next) {
  try {
    const idVenta = toNumberOrNull(req.params.id ?? req.body?.id_venta ?? req.body?.idVenta);
    const body = req.body || {};
    const idProducto = toNumberOrNull(body.id_producto ?? body.idProducto);
    const cantidad = toNumberOrNull(body.cantidad);

    if (!idVenta || !idProducto || !cantidad || cantidad <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Venta, producto y cantidad mayor a cero son obligatorios',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ADD_DETALLE_VENTA(:p_id_venta, :p_id_producto, :p_cantidad, :o_mensaje);
       END;`,
      {
        p_id_venta: idVenta,
        p_id_producto: idProducto,
        p_cantidad: cantidad,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(201).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Detalle agregado',
    });
  } catch (err) {
    next(err);
  }
}

async function anularVenta(req, res, next) {
  try {
    const idVenta = toNumberOrNull(req.params.id);
    if (!idVenta) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de venta inválido',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ANULAR_VENTA(:p_id_venta, :o_mensaje);
       END;`,
      {
        p_id_venta: idVenta,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Venta anulada',
    });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// GESTOR 2: AGENDA Y CITAS MEDICAS
// ============================================================================
async function listarCitas(req, res, next) {
  try {
    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_GET_CITAS();
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

async function listarBloquesDisponibles(req, res, next) {
  try {
    const fecha = toDateOrNull(req.query?.fecha);
    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_GET_BLOQUES_DISPONIBLES(:p_fecha);
       END;`,
      {
        p_fecha: fecha,
        o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    return res.status(200).json({ success: true, data: result.o_cursor || [] });
  } catch (err) {
    next(err);
  }
}

async function reservarCita(req, res, next) {
  try {
    const body = req.body || {};
    const idBloque = toNumberOrNull(body.id_bloque ?? body.idBloque);
    const idPaciente = toNumberOrNull(body.id_paciente ?? body.idPaciente);
    const idServicio = toNumberOrNull(body.id_servicio ?? body.idServicio);
    const motivo = body.motivo ? String(body.motivo).trim() : null;

    if (!idBloque || !idPaciente || !idServicio) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Bloque de agenda, paciente y servicio son obligatorios',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_RESERVAR_CITA(
           :p_id_bloque, :p_id_paciente, :p_id_servicio,
           :p_motivo, :o_id_cita, :o_mensaje
         );
       END;`,
      {
        p_id_bloque: idBloque,
        p_id_paciente: idPaciente,
        p_id_servicio: idServicio,
        p_motivo: motivo,
        o_id_cita: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(201).json({
      success: true,
      data: { id_cita: result.o_id_cita },
      message: result.o_mensaje || 'Cita reservada',
    });
  } catch (err) {
    next(err);
  }
}

async function actualizarEstadoCita(req, res, next) {
  try {
    const idCita = toNumberOrNull(req.params.id);
    const estado = (req.body?.estado || '').trim();

    if (!idCita || !estado) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de cita y estado son obligatorios',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ACTUALIZAR_ESTADO_CITA(:p_id_cita, :p_estado, :o_mensaje);
       END;`,
      {
        p_id_cita: idCita,
        p_estado: estado,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Estado de cita actualizado',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarVentas,
  obtenerDetalleVenta,
  crearVenta,
  agregarDetalleVenta,
  anularVenta,
  listarCitas,
  listarBloquesDisponibles,
  reservarCita,
  actualizarEstadoCita,
};

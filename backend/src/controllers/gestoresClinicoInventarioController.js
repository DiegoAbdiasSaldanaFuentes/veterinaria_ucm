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
// GESTOR 3: INVENTARIO (INGRESO Y AJUSTE DE STOCK)
// ============================================================================
async function ingresarStock(req, res, next) {
  try {
    const body = req.body || {};
    const idProducto = toNumberOrNull(body.id_producto ?? body.idProducto);
    const cantidad = toNumberOrNull(body.cantidad);

    if (!idProducto || !cantidad || cantidad <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de producto y cantidad mayor a cero son obligatorios',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_INGRESAR_STOCK(:p_id_producto, :p_cantidad, :o_mensaje);
       END;`,
      {
        p_id_producto: idProducto,
        p_cantidad: cantidad,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Stock ingresado correctamente',
    });
  } catch (err) {
    next(err);
  }
}

async function ajustarStock(req, res, next) {
  try {
    const body = req.body || {};
    const idProducto = toNumberOrNull(body.id_producto ?? body.idProducto);
    const nuevoStock = toNumberOrNull(body.nuevo_stock ?? body.nuevoStock);
    const nuevoStockMinimo = toNumberOrNull(
      body.nuevo_stock_minimo ?? body.nuevoStockMinimo ?? body.stock_minimo ?? 0
    );

    if (!idProducto || nuevoStock === null || nuevoStock < 0 || nuevoStockMinimo === null || nuevoStockMinimo < 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de producto, nuevo stock y stock mínimo válidos son obligatorios',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_AJUSTAR_STOCK(:p_id_producto, :p_nuevo_stock, :p_nuevo_stock_minimo, :o_mensaje);
       END;`,
      {
        p_id_producto: idProducto,
        p_nuevo_stock: nuevoStock,
        p_nuevo_stock_minimo: nuevoStockMinimo,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Stock ajustado correctamente',
    });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// GESTOR 4: GESTION CLINICA (FICHAS CLINICAS, RECETAS E HISTORIAL)
// ============================================================================
async function crearFichaClinica(req, res, next) {
  try {
    const body = req.body || {};
    const idCita = toNumberOrNull(body.id_cita ?? body.idCita);
    const diagnostico = body.diagnostico !== undefined ? String(body.diagnostico).trim() : null;
    const observaciones = body.observaciones !== undefined ? String(body.observaciones).trim() : null;

    if (!idCita) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'El ID de cita es obligatorio para crear la ficha clínica',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_CREAR_FICHA_CLINICA(
           :p_id_cita, :p_diagnostico, :p_observaciones, :o_id_ficha, :o_mensaje
         );
       END;`,
      {
        p_id_cita: idCita,
        p_diagnostico: diagnostico,
        p_observaciones: observaciones,
        o_id_ficha: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(201).json({
      success: true,
      data: { id_ficha: result.o_id_ficha },
      message: result.o_mensaje || 'Ficha clínica registrada',
    });
  } catch (err) {
    next(err);
  }
}

async function agregarReceta(req, res, next) {
  try {
    const idFicha = toNumberOrNull(req.params.idFicha ?? req.body?.id_ficha ?? req.body?.idFicha);
    const body = req.body || {};
    const idProducto = toNumberOrNull(body.id_producto ?? body.idProducto);
    const indicaciones = (body.indicaciones || '').trim();

    if (!idFicha || !idProducto || !indicaciones) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Ficha clínica, producto e indicaciones son obligatorios',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_AGREGAR_RECETA(
           :p_id_ficha, :p_id_producto, :p_indicaciones, :o_id_receta, :o_mensaje
         );
       END;`,
      {
        p_id_ficha: idFicha,
        p_id_producto: idProducto,
        p_indicaciones: indicaciones,
        o_id_receta: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(201).json({
      success: true,
      data: { id_receta: result.o_id_receta },
      message: result.o_mensaje || 'Receta agregada',
    });
  } catch (err) {
    next(err);
  }
}

async function obtenerHistorialPaciente(req, res, next) {
  try {
    const idPaciente = toNumberOrNull(req.params.idPaciente ?? req.params.id);
    if (!idPaciente) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de paciente inválido',
      });
    }

    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_GET_HISTORIAL_PACIENTE(:p_id_paciente);
       END;`,
      {
        p_id_paciente: idPaciente,
        o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    return res.status(200).json({ success: true, data: result.o_cursor || [] });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// GESTOR 5: VACUNACIONES Y REFUERZOS
// ============================================================================
async function verificarVeterinario(req, res, next) {
  try {
    const idUsuario = toNumberOrNull(req.params.idUsuario ?? req.params.id ?? req.query?.id_usuario);
    if (!idUsuario) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de usuario inválido',
      });
    }

    const result = await executePlsql(
      `BEGIN
         :o_es_vet := FUNC_ES_VETERINARIO(:p_id_usuario);
       END;`,
      {
        p_id_usuario: idUsuario,
        o_es_vet: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );

    return res.status(200).json({
      success: true,
      data: { es_veterinario: Number(result.o_es_vet) === 1 },
    });
  } catch (err) {
    next(err);
  }
}

async function listarVacunaciones(req, res, next) {
  try {
    const idPaciente = toNumberOrNull(req.query?.id_paciente ?? req.query?.idPaciente);
    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_GET_VACUNACIONES(:p_id_paciente);
       END;`,
      {
        p_id_paciente: idPaciente,
        o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    return res.status(200).json({ success: true, data: result.o_cursor || [] });
  } catch (err) {
    next(err);
  }
}

async function registrarVacunacion(req, res, next) {
  try {
    const body = req.body || {};
    const idPaciente = toNumberOrNull(body.id_paciente ?? body.idPaciente);
    const idProducto = toNumberOrNull(body.id_producto ?? body.idProducto);
    const idUsuario = toNumberOrNull(body.id_usuario ?? body.idUsuario);
    const fechaAplicacion = toDateOrNull(body.fecha_aplicacion ?? body.fechaAplicacion);
    const fechaProximaDosis = toDateOrNull(body.fecha_proxima_dosis ?? body.fechaProximaDosis);
    const observaciones = body.observaciones ? String(body.observaciones).trim() : null;

    if (!idPaciente || !idProducto || !idUsuario || !fechaAplicacion || !fechaProximaDosis) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Paciente, vacuna, veterinario y ambas fechas son obligatorios',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_REGISTRAR_VACUNACION(
           :p_id_paciente, :p_id_producto, :p_id_usuario,
           :p_fecha_aplicacion, :p_fecha_proxima_dosis, :p_observaciones,
           :o_id_vacunacion, :o_mensaje
         );
       END;`,
      {
        p_id_paciente: idPaciente,
        p_id_producto: idProducto,
        p_id_usuario: idUsuario,
        p_fecha_aplicacion: fechaAplicacion,
        p_fecha_proxima_dosis: fechaProximaDosis,
        p_observaciones: observaciones,
        o_id_vacunacion: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(201).json({
      success: true,
      data: { id_vacunacion: result.o_id_vacunacion },
      message: result.o_mensaje || 'Vacunación registrada',
    });
  } catch (err) {
    next(err);
  }
}

async function aplicarRefuerzoVacuna(req, res, next) {
  try {
    const idVacunacionAnterior = toNumberOrNull(
      req.params.id ?? req.body?.id_vacunacion_anterior ?? req.body?.idVacunacionAnterior
    );
    const body = req.body || {};
    const idUsuario = toNumberOrNull(body.id_usuario ?? body.idUsuario);
    const fechaAplicacion = toDateOrNull(body.fecha_aplicacion ?? body.fechaAplicacion);
    const fechaProximaDosis = toDateOrNull(body.fecha_proxima_dosis ?? body.fechaProximaDosis);
    const observaciones = body.observaciones ? String(body.observaciones).trim() : null;

    if (!idVacunacionAnterior || !idUsuario || !fechaAplicacion || !fechaProximaDosis) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Vacunación anterior, veterinario y ambas fechas son obligatorios',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_APLICAR_REFUERZO_VACUNA(
           :p_id_vacunacion_anterior, :p_id_usuario,
           :p_fecha_aplicacion, :p_fecha_proxima_dosis, :p_observaciones,
           :o_id_vacunacion_nueva, :o_mensaje
         );
       END;`,
      {
        p_id_vacunacion_anterior: idVacunacionAnterior,
        p_id_usuario: idUsuario,
        p_fecha_aplicacion: fechaAplicacion,
        p_fecha_proxima_dosis: fechaProximaDosis,
        p_observaciones: observaciones,
        o_id_vacunacion_nueva: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(201).json({
      success: true,
      data: { id_vacunacion_nueva: result.o_id_vacunacion_nueva },
      message: result.o_mensaje || 'Refuerzo aplicado correctamente',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  ingresarStock,
  ajustarStock,
  crearFichaClinica,
  agregarReceta,
  obtenerHistorialPaciente,
  verificarVeterinario,
  listarVacunaciones,
  registrarVacunacion,
  aplicarRefuerzoVacuna,
};

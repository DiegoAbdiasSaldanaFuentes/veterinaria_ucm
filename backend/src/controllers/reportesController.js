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
// 1. REPORTE DE VENTAS POR MES Y ANIO
// ============================================================================
async function reporteVentasMes(req, res, next) {
  try {
    const mes = toNumberOrNull(req.query?.mes ?? req.query?.p_mes);
    const anio = toNumberOrNull(req.query?.anio ?? req.query?.ano ?? req.query?.p_anio);

    if (!mes || mes < 1 || mes > 12 || !anio) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Debes indicar un mes válido (1-12) y un año',
      });
    }

    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_REPORTE_VENTAS_MES(:p_mes, :p_anio);
       END;`,
      {
        p_mes: mes,
        p_anio: anio,
        o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    return res.status(200).json({ success: true, data: result.o_cursor || [] });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// 2. REPORTE DE STOCK CRITICO
// ============================================================================
async function reporteStockCritico(req, res, next) {
  try {
    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_REPORTE_STOCK_CRITICO();
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

// ============================================================================
// 3. REPORTE DE VACUNAS PENDIENTES
// ============================================================================
async function reporteVacunasPendientes(req, res, next) {
  try {
    const fechaDesde = toDateOrNull(
      req.query?.fecha_desde ?? req.query?.fechaDesde ?? req.query?.desde
    );
    const fechaHasta = toDateOrNull(
      req.query?.fecha_hasta ?? req.query?.fechaHasta ?? req.query?.hasta
    );

    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_REPORTE_VACUNAS_PENDIENTES(:p_fecha_desde, :p_fecha_hasta);
       END;`,
      {
        p_fecha_desde: fechaDesde,
        p_fecha_hasta: fechaHasta,
        o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    return res.status(200).json({ success: true, data: result.o_cursor || [] });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// 4. REPORTE DE RENDIMIENTO DEL STAFF
// ============================================================================
async function reporteRendimientoStaff(req, res, next) {
  try {
    const mes = toNumberOrNull(req.query?.mes ?? req.query?.p_mes);
    const anio = toNumberOrNull(req.query?.anio ?? req.query?.ano ?? req.query?.p_anio);

    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_REPORTE_RENDIMIENTO_STAFF(:p_mes, :p_anio);
       END;`,
      {
        p_mes: mes,
        p_anio: anio,
        o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    return res.status(200).json({ success: true, data: result.o_cursor || [] });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// 5. RESUMEN KPI PARA DASHBOARD
// ============================================================================
async function reporteResumenDashboard(req, res, next) {
  try {
    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_REPORTE_RESUMEN_DASHBOARD();
       END;`,
      {
        o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    const rows = result.o_cursor || [];
    return res.status(200).json({
      success: true,
      data: rows[0] || null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  reporteVentasMes,
  reporteStockCritico,
  reporteVacunasPendientes,
  reporteRendimientoStaff,
  reporteResumenDashboard,
};

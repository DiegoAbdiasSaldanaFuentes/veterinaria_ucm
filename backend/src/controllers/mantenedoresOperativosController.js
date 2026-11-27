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
// 6. PROVEEDORES
// ============================================================================
async function listarProveedores(req, res, next) {
  try {
    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_GET_PROVEEDORES();
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

async function crearProveedor(req, res, next) {
  try {
    const body = req.body || {};
    const razonSocial = (body.razon_social || body.razonSocial || '').trim();
    const rut = (body.rut || '').trim() || null;
    const telefono = (body.telefono || '').trim() || null;
    const correo = (body.correo || '').trim() || null;

    if (!razonSocial) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'La razón social es obligatoria',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_CREAR_PROVEEDOR(
           :p_razon_social, :p_rut, :p_telefono,
           :p_correo, :o_id_proveedor, :o_mensaje
         );
       END;`,
      {
        p_razon_social: razonSocial,
        p_rut: rut,
        p_telefono: telefono,
        p_correo: correo,
        o_id_proveedor: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(201).json({
      success: true,
      data: { id_proveedor: result.o_id_proveedor },
      message: result.o_mensaje || 'Proveedor creado',
    });
  } catch (err) {
    next(err);
  }
}

async function actualizarProveedor(req, res, next) {
  try {
    const idProveedor = toNumberOrNull(req.params.id);
    const body = req.body || {};
    const razonSocial = (body.razon_social || body.razonSocial || '').trim();
    const rut = (body.rut || '').trim() || null;
    const telefono = (body.telefono || '').trim() || null;
    const correo = (body.correo || '').trim() || null;

    if (!idProveedor || !razonSocial) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de proveedor y razón social son obligatorios',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ACTUALIZAR_PROVEEDOR(
           :p_id_proveedor, :p_razon_social, :p_rut,
           :p_telefono, :p_correo, :o_mensaje
         );
       END;`,
      {
        p_id_proveedor: idProveedor,
        p_razon_social: razonSocial,
        p_rut: rut,
        p_telefono: telefono,
        p_correo: correo,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Proveedor actualizado',
    });
  } catch (err) {
    next(err);
  }
}

async function eliminarProveedor(req, res, next) {
  try {
    const idProveedor = toNumberOrNull(req.params.id);
    if (!idProveedor) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de proveedor inválido',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ELIMINAR_PROVEEDOR(:p_id_proveedor, :o_mensaje);
       END;`,
      {
        p_id_proveedor: idProveedor,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Proveedor eliminado',
    });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// 7. PRODUCTOS
// ============================================================================
async function listarProductos(req, res, next) {
  try {
    const esVacuna = req.route.path.startsWith('/vacunas');
    const result = await executePlsql(
      `BEGIN
         :o_cursor := ${esVacuna ? 'FUNC_GET_VACUNAS(:p_incluir_inactivos)' : 'FUNC_GET_PRODUCTOS(0, :p_incluir_inactivos)'};
       END;`,
      {
        p_incluir_inactivos: req.query.incluir_inactivos === '1' ? 1 : 0,
        o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );
    return res.status(200).json({ success: true, data: result.o_cursor || [] });
  } catch (err) {
    next(err);
  }
}

async function crearProducto(req, res, next) {
  try {
    const esVacuna = req.route.path.startsWith('/vacunas');
    const body = req.body || {};
    const idProveedor = toNumberOrNull(body.id_proveedor ?? body.idProveedor);
    const sku = (body.sku || '').trim();
    const nombreProducto = (body.nombre_producto || body.nombreProducto || '').trim();
    const precioUnitario = toNumberOrNull(body.precio_unitario ?? body.precioUnitario);
    const stock = toNumberOrNull(body.stock ?? 0);
    const stockMinimo = toNumberOrNull(body.stock_minimo ?? body.stockMinimo ?? 0);

    if (!sku || !nombreProducto || (!esVacuna && precioUnitario === null)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'SKU, nombre de producto y precio unitario son obligatorios',
      });
    }

    const result = await executePlsql(
      esVacuna ? `BEGIN
         INSERT INTO VACUNAS (ID_PROVEEDOR, SKU, NOMBRE_VACUNA, STOCK, STOCK_MINIMO)
         VALUES (:p_id_proveedor, UPPER(:p_sku), :p_nombre_producto, :p_stock, :p_stock_minimo)
         RETURNING ID_VACUNA INTO :o_id_producto;
         :o_mensaje := 'Vacuna registrada.';
       END;` : `BEGIN
         PROC_CREAR_PRODUCTO(
           :p_id_proveedor, :p_sku, :p_nombre_producto,
           :p_precio_unitario, :p_stock, :p_stock_minimo,
           :o_id_producto, :o_mensaje
         );
       END;`,
      {
        p_id_proveedor: idProveedor,
        p_sku: sku,
        p_nombre_producto: nombreProducto,
        ...(!esVacuna && { p_precio_unitario: precioUnitario }),
        p_stock: stock ?? 0,
        p_stock_minimo: stockMinimo ?? 0,
        o_id_producto: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(201).json({
      success: true,
      data: { id_producto: result.o_id_producto },
      message: result.o_mensaje || 'Producto creado',
    });
  } catch (err) {
    next(err);
  }
}

async function actualizarProducto(req, res, next) {
  try {
    const idProducto = toNumberOrNull(req.params.id);
    const esVacuna = req.route.path.startsWith('/vacunas');
    const body = req.body || {};
    const idProveedor = toNumberOrNull(body.id_proveedor ?? body.idProveedor);
    const sku = (body.sku || '').trim();
    const nombreProducto = (body.nombre_producto || body.nombreProducto || '').trim();
    const precioUnitario = toNumberOrNull(body.precio_unitario ?? body.precioUnitario);
    const stock = toNumberOrNull(body.stock ?? 0);
    const stockMinimo = toNumberOrNull(body.stock_minimo ?? body.stockMinimo ?? 0);
    const activo = toNumberOrNull(body.activo ?? 1);

    if (!idProducto || !sku || !nombreProducto || (!esVacuna && precioUnitario === null) || activo === null) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Faltan campos obligatorios para actualizar producto',
      });
    }

    const result = await executePlsql(
      esVacuna ? `BEGIN
         UPDATE VACUNAS
            SET ID_PROVEEDOR = :p_id_proveedor, SKU = UPPER(:p_sku),
                NOMBRE_VACUNA = :p_nombre_producto, STOCK = :p_stock,
                STOCK_MINIMO = :p_stock_minimo, ACTIVO = :p_activo
          WHERE ID_VACUNA = :p_id_producto;
         IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20009, 'Vacuna no encontrada.'); END IF;
         :o_mensaje := 'Vacuna actualizada.';
       END;` : `BEGIN
         PROC_ACTUALIZAR_PRODUCTO(
           :p_id_producto, :p_id_proveedor, :p_sku,
           :p_nombre_producto, :p_precio_unitario, :p_stock,
           :p_stock_minimo, :p_activo, :o_mensaje
         );
       END;`,
      {
        p_id_producto: idProducto,
        p_id_proveedor: idProveedor,
        p_sku: sku,
        p_nombre_producto: nombreProducto,
        ...(!esVacuna && { p_precio_unitario: precioUnitario }),
        p_stock: stock ?? 0,
        p_stock_minimo: stockMinimo ?? 0,
        p_activo: activo,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Producto actualizado',
    });
  } catch (err) {
    next(err);
  }
}

async function eliminarProducto(req, res, next) {
  try {
    const idProducto = toNumberOrNull(req.params.id);
    if (!idProducto) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de producto inválido',
      });
    }

    const esVacuna = req.route.path.startsWith('/vacunas');
    const result = await executePlsql(
      esVacuna ? `BEGIN
         DELETE FROM VACUNAS WHERE ID_VACUNA = :p_id_producto;
         IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20009, 'Vacuna no encontrada.'); END IF;
         :o_mensaje := 'Vacuna eliminada.';
       EXCEPTION
         WHEN OTHERS THEN
           IF SQLCODE = -2292 THEN
             RAISE_APPLICATION_ERROR(-20009, 'La vacuna tiene aplicaciones registradas. Desactívala para conservar el historial.');
           END IF;
           RAISE;
       END;` : `BEGIN
         PROC_ELIMINAR_PRODUCTO(:p_id_producto, :o_mensaje);
       END;`,
      {
        p_id_producto: idProducto,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Producto eliminado',
    });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// 8. SERVICIOS
// ============================================================================
async function listarServicios(req, res, next) {
  try {
    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_GET_SERVICIOS();
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

async function crearServicio(req, res, next) {
  try {
    const nombreServicio = (req.body?.nombre_servicio || req.body?.nombreServicio || '').trim();
    if (!nombreServicio) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'El nombre del servicio es obligatorio',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_CREAR_SERVICIO(:p_nombre_servicio, :o_id_servicio, :o_mensaje);
       END;`,
      {
        p_nombre_servicio: nombreServicio,
        o_id_servicio: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(201).json({
      success: true,
      data: { id_servicio: result.o_id_servicio },
      message: result.o_mensaje || 'Servicio creado',
    });
  } catch (err) {
    next(err);
  }
}

async function actualizarServicio(req, res, next) {
  try {
    const idServicio = toNumberOrNull(req.params.id);
    const body = req.body || {};
    const nombreServicio = (body.nombre_servicio || body.nombreServicio || '').trim();
    const activo = toNumberOrNull(body.activo ?? 1);

    if (!idServicio || !nombreServicio || activo === null) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID, nombre de servicio y estado activo son obligatorios',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ACTUALIZAR_SERVICIO(:p_id_servicio, :p_nombre_servicio, :p_activo, :o_mensaje);
       END;`,
      {
        p_id_servicio: idServicio,
        p_nombre_servicio: nombreServicio,
        p_activo: activo,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Servicio actualizado',
    });
  } catch (err) {
    next(err);
  }
}

async function eliminarServicio(req, res, next) {
  try {
    const idServicio = toNumberOrNull(req.params.id);
    if (!idServicio) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de servicio inválido',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ELIMINAR_SERVICIO(:p_id_servicio, :o_mensaje);
       END;`,
      {
        p_id_servicio: idServicio,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Servicio eliminado',
    });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// 9. BLOQUES_AGENDA
// ============================================================================
async function listarBloquesAgenda(req, res, next) {
  try {
    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_GET_BLOQUES_AGENDA();
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

async function crearBloqueAgenda(req, res, next) {
  try {
    const body = req.body || {};
    const idVeterinario = toNumberOrNull(body.id_veterinario ?? body.idVeterinario);
    const fechaHora = body.fecha_hora_inicio ?? body.fechaHoraInicio;
    const horaLocal = typeof fechaHora === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fechaHora);
    const fechaHoraInicio = horaLocal ? fechaHora : toDateOrNull(fechaHora);
    const habilitado = toNumberOrNull(body.habilitado ?? 1);

    if (!idVeterinario || !fechaHoraInicio) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Veterinario y fecha/hora de inicio son obligatorios',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_CREAR_BLOQUE_AGENDA(
           :p_id_veterinario, ${horaLocal ? `TO_DATE(:p_fecha_hora_inicio, 'FXYYYY-MM-DD"T"HH24:MI')` : ':p_fecha_hora_inicio'},
           :p_habilitado, :o_id_bloque, :o_mensaje
         );
       END;`,
      {
        p_id_veterinario: idVeterinario,
        p_fecha_hora_inicio: fechaHoraInicio,
        p_habilitado: habilitado ?? 1,
        o_id_bloque: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(201).json({
      success: true,
      data: { id_bloque: result.o_id_bloque },
      message: result.o_mensaje || 'Bloque de agenda creado',
    });
  } catch (err) {
    next(err);
  }
}

async function actualizarBloqueAgenda(req, res, next) {
  try {
    const idBloque = toNumberOrNull(req.params.id);
    const body = req.body || {};
    const fechaHoraInicio = toDateOrNull(body.fecha_hora_inicio ?? body.fechaHoraInicio);
    const habilitado = toNumberOrNull(body.habilitado ?? 1);

    if (!idBloque || !fechaHoraInicio || habilitado === null) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de bloque, fecha/hora de inicio y estado habilitado son obligatorios',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ACTUALIZAR_BLOQUE_AGENDA(
           :p_id_bloque, :p_fecha_hora_inicio, :p_habilitado, :o_mensaje
         );
       END;`,
      {
        p_id_bloque: idBloque,
        p_fecha_hora_inicio: fechaHoraInicio,
        p_habilitado: habilitado,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Bloque de agenda actualizado',
    });
  } catch (err) {
    next(err);
  }
}

async function eliminarBloqueAgenda(req, res, next) {
  try {
    const idBloque = toNumberOrNull(req.params.id);
    if (!idBloque) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de bloque inválido',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ELIMINAR_BLOQUE_AGENDA(:p_id_bloque, :o_mensaje);
       END;`,
      {
        p_id_bloque: idBloque,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Bloque de agenda eliminado',
    });
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// 10. FICHAS_CLINICAS Y RECETAS
// ============================================================================
async function listarFichasClinicas(req, res, next) {
  try {
    const result = await executePlsql(
      `BEGIN
         :o_cursor := FUNC_GET_FICHAS_CLINICAS();
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

async function actualizarFichaClinica(req, res, next) {
  try {
    const idFicha = toNumberOrNull(req.params.id);
    const body = req.body || {};
    const diagnostico = body.diagnostico !== undefined ? String(body.diagnostico).trim() : null;
    const observaciones = body.observaciones !== undefined ? String(body.observaciones).trim() : null;

    if (!idFicha) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de ficha clínica inválido',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ACTUALIZAR_FICHA_CLINICA(:p_id_ficha, :p_diagnostico, :p_observaciones, :o_mensaje);
       END;`,
      {
        p_id_ficha: idFicha,
        p_diagnostico: diagnostico,
        p_observaciones: observaciones,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Ficha clínica actualizada',
    });
  } catch (err) {
    next(err);
  }
}

async function eliminarFichaClinica(req, res, next) {
  try {
    const idFicha = toNumberOrNull(req.params.id);
    if (!idFicha) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de ficha clínica inválido',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ELIMINAR_FICHA_CLINICA(:p_id_ficha, :o_mensaje);
       END;`,
      {
        p_id_ficha: idFicha,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Ficha clínica eliminada',
    });
  } catch (err) {
    next(err);
  }
}

async function listarRecetas(req, res, next) {
  try {
    const idFicha = toNumberOrNull(req.query?.id_ficha ?? req.query?.idFicha);
    const result = idFicha
      ? await executePlsql(
          `BEGIN
             :o_cursor := FUNC_GET_RECETAS_POR_FICHA(:p_id_ficha);
           END;`,
          {
            p_id_ficha: idFicha,
            o_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          }
        )
      : await executePlsql(
          `BEGIN
             :o_cursor := FUNC_GET_RECETAS();
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

async function actualizarReceta(req, res, next) {
  try {
    const idReceta = toNumberOrNull(req.params.id);
    const body = req.body || {};
    const idProducto = toNumberOrNull(body.id_producto ?? body.idProducto);
    const indicaciones = (body.indicaciones || '').trim();

    if (!idReceta || !idProducto || !indicaciones) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de receta, producto e indicaciones son obligatorios',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ACTUALIZAR_RECETA(:p_id_receta, :p_id_producto, :p_indicaciones, :o_mensaje);
       END;`,
      {
        p_id_receta: idReceta,
        p_id_producto: idProducto,
        p_indicaciones: indicaciones,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Receta actualizada',
    });
  } catch (err) {
    next(err);
  }
}

async function eliminarReceta(req, res, next) {
  try {
    const idReceta = toNumberOrNull(req.params.id);
    if (!idReceta) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'ID de receta inválido',
      });
    }

    const result = await executePlsql(
      `BEGIN
         PROC_ELIMINAR_RECETA(:p_id_receta, :o_mensaje);
       END;`,
      {
        p_id_receta: idReceta,
        o_mensaje: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: result.o_mensaje || 'Receta eliminada',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  listarServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  listarBloquesAgenda,
  crearBloqueAgenda,
  actualizarBloqueAgenda,
  eliminarBloqueAgenda,
  listarFichasClinicas,
  actualizarFichaClinica,
  eliminarFichaClinica,
  listarRecetas,
  actualizarReceta,
  eliminarReceta,
};

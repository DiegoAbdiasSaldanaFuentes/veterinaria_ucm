import api, { USE_MOCKS } from './api';

// TODO: PATCH TEMPORAL - datos mock alineados a FUNC_REPORTE_* mientras se integra el backend
export const obtenerResumenInicio = async () => {
  if (USE_MOCKS) {
    return {
      success: true,
      data: {
        kpis: {
          citas_hoy: 6,
          atenciones_hoy: 4,
          vacunas_pendientes: 4,
          productos_criticos: 2,
          ventas_hoy: 185000,
        },
        proximas_citas: [
          { id: 1, hora: '10:30', mascota: 'Max', motivo: 'Vacunación anual', veterinario: 'Dr. Carlos' },
          { id: 2, hora: '11:00', mascota: 'Luna', motivo: 'Control sano', veterinario: 'Dra. Andrea' },
          { id: 3, hora: '12:00', mascota: 'Rocky', motivo: 'Revisión dental', veterinario: 'Dr. Carlos' },
        ],
        recordatorios_vacunas: [
          { id: 1, mascota: 'Luna', vacuna: 'Óctuple', fecha: '2026-11-10', estado: 'Vencida' },
          { id: 2, mascota: 'Max', vacuna: 'Antirrábica', fecha: '2026-11-25', estado: 'Próxima' },
        ],
        stock_critico: [
          { id: 101, producto: 'Meloxicam 5mg', stock: 5 },
          { id: 104, producto: 'Pipeta Antipulgas', stock: 2 },
        ],
      },
      message: 'OK',
    };
  }
  return api.get('/reportes/resumen');
};

export const obtenerStockCritico = async () => {
  if (USE_MOCKS) {
    return {
      success: true,
      data: [
        { id_producto: 101, sku: 'SKU-101', nombre_producto: 'Meloxicam 5mg', stock: 5, stock_minimo: 6, faltante_sugerido: 1, estado_stock: 'CRITICO', proveedor: 'Distribuidora Vet' },
        { id_producto: 104, sku: 'SKU-104', nombre_producto: 'Pipeta Antipulgas', stock: 2, stock_minimo: 5, faltante_sugerido: 3, estado_stock: 'CRITICO', proveedor: 'Distribuidora Vet' },
      ],
      message: 'OK',
    };
  }
  return api.get('/reportes/stock-critico');
};

export const obtenerRendimientoStaff = async (mes = null, anio = null) => {
  if (USE_MOCKS) {
    return {
      success: true,
      data: [
        { id_usuario: 2, staff: 'Carlos Castro', nombre_rol: 'Veterinario', ventas_registradas: 0, monto_vendido: 0, citas_atendidas: 18, vacunas_aplicadas: 9 },
        { id_usuario: 3, staff: 'María López', nombre_rol: 'Recepcionista', ventas_registradas: 24, monto_vendido: 420000, citas_atendidas: 0, vacunas_aplicadas: 0 },
      ],
      message: 'OK',
    };
  }
  return api.get('/reportes/rendimiento-staff', {
    params: { ...(mes ? { mes } : {}), ...(anio ? { anio } : {}) },
  });
};

export const obtenerVentasMes = async (mes, anio) => {
  if (USE_MOCKS) {
    return {
      success: true,
      data: [
        { id_venta: 1, fecha_venta: '2026-11-20', estado: 'REGISTRADA', rut_cliente: '11111111-1', cliente: 'Juan Pérez', vendedor: 'María López', cantidad_items: 2, total_venta: 24000 },
        { id_venta: 2, fecha_venta: '2026-11-24', estado: 'REGISTRADA', rut_cliente: '22222222-2', cliente: 'María Gómez', vendedor: 'María López', cantidad_items: 1, total_venta: 12000 },
      ],
      message: 'OK',
    };
  }
  return api.get('/reportes/ventas-mes', { params: { mes, anio } });
};
import api, { USE_MOCKS } from './api';

// TODO: PATCH TEMPORAL - mocks en memoria para gestores sin backend Node
let mockVentas = [
  {
    id_venta: 1,
    fecha_venta: '2026-11-25 10:15',
    estado: 'REGISTRADA',
    id_cliente: 1,
    rut_cliente: '11111111-1',
    cliente: 'Juan Pérez',
    id_usuario: 1,
    vendedor: 'Admin Sistema',
    cantidad_items: 2,
    total_venta: 24000,
  },
];

let mockBloquesDisponibles = [
  { id_bloque: 10, id_veterinario: 2, veterinario: 'Carlos Castro', fecha_hora_inicio: '2026-11-26 10:00' },
  { id_bloque: 11, id_veterinario: 2, veterinario: 'Carlos Castro', fecha_hora_inicio: '2026-11-26 10:30' },
  { id_bloque: 12, id_veterinario: 2, veterinario: 'Carlos Castro', fecha_hora_inicio: '2026-11-26 11:00' },
];

let mockCitas = [
  {
    id_cita: 1,
    id_bloque: 9,
    fecha_hora_inicio: '2026-11-25 10:30',
    id_veterinario: 2,
    veterinario: 'Carlos Castro',
    id_paciente: 1,
    nombre_paciente: 'Max',
    nombre_especie: 'Canino',
    dueno: 'Juan Pérez',
    id_servicio: 1,
    nombre_servicio: 'Consulta General',
    estado: 'RESERVADA',
    motivo: 'Vacunación anual',
  },
];

let mockHistorialPaciente = [
  {
    id_cita: 1,
    fecha_hora_inicio: '2026-11-25 10:30',
    veterinario: 'Carlos Castro',
    nombre_servicio: 'Consulta General',
    estado_cita: 'RESERVADA',
    motivo: 'Control general',
    id_ficha: 1,
    diagnostico: 'Paciente estable',
    observaciones: 'Control de rutina',
    cantidad_recetas: 1,
  },
];

// --- VENTAS ---
export const getVentas = async () => {
  if (USE_MOCKS) return { success: true, data: [...mockVentas], message: 'OK' };
  return api.get('/gestores/ventas');
};

export const crearVenta = async (payload) => {
  if (USE_MOCKS) {
    const nueva = {
      id_venta: Date.now(),
      fecha_venta: new Date().toISOString().slice(0, 16).replace('T', ' '),
      estado: 'REGISTRADA',
      id_cliente: payload.id_cliente || null,
      cliente: payload.cliente_nombre || 'CONSUMIDOR FINAL',
      id_usuario: payload.id_usuario,
      vendedor: payload.vendedor_nombre || 'Usuario',
      cantidad_items: payload.detalle.length,
      total_venta: payload.total_estimado || 0,
    };
    mockVentas = [nueva, ...mockVentas];
    return { success: true, data: nueva, message: 'OK: Venta registrada correctamente.' };
  }
  return api.post('/gestores/ventas', payload);
};

export const agregarDetalleVenta = async (idVenta, detallePayload) => {
  if (USE_MOCKS) {
    return { success: true, data: null, message: 'OK: Detalle agregado.' };
  }
  return api.post(`/gestores/ventas/${idVenta}/detalle`, detallePayload);
};

export const anularVenta = async (idVenta) => {
  if (USE_MOCKS) {
    mockVentas = mockVentas.map((v) =>
      v.id_venta === idVenta ? { ...v, estado: 'ANULADA' } : v
    );
    return { success: true, data: null, message: 'OK: Venta anulada y stock restaurado correctamente.' };
  }
  return api.put(`/gestores/ventas/${idVenta}/anular`);
};

// --- CITAS ---
export const getCitas = async () => {
  if (USE_MOCKS) return { success: true, data: [...mockCitas], message: 'OK' };
  return api.get('/gestores/citas');
};

export const getBloquesDisponibles = async (fecha = null) => {
  if (USE_MOCKS) {
    const filtrados = fecha
      ? mockBloquesDisponibles.filter((b) => b.fecha_hora_inicio.startsWith(fecha))
      : mockBloquesDisponibles;
    return { success: true, data: [...filtrados], message: 'OK' };
  }
  return api.get('/gestores/bloques-disponibles', { params: fecha ? { fecha } : {} });
};

export const reservarCita = async (payload) => {
  if (USE_MOCKS) {
    const bloque = mockBloquesDisponibles.find((b) => b.id_bloque === Number(payload.id_bloque));
    const nueva = {
      id_cita: Date.now(),
      id_bloque: Number(payload.id_bloque),
      fecha_hora_inicio: bloque ? bloque.fecha_hora_inicio : '',
      id_veterinario: bloque ? bloque.id_veterinario : null,
      veterinario: bloque ? bloque.veterinario : '',
      id_paciente: Number(payload.id_paciente),
      nombre_paciente: payload.paciente_nombre || '',
      dueno: payload.dueno_nombre || '',
      id_servicio: Number(payload.id_servicio),
      nombre_servicio: payload.servicio_nombre || '',
      estado: 'RESERVADA',
      motivo: payload.motivo?.trim() || '',
    };
    mockCitas = [nueva, ...mockCitas];
    mockBloquesDisponibles = mockBloquesDisponibles.filter((b) => b.id_bloque !== Number(payload.id_bloque));
    return { success: true, data: nueva, message: 'OK: Cita reservada correctamente.' };
  }
  return api.post('/gestores/citas', payload);
};

export const actualizarEstadoCita = async (idCita, estado) => {
  if (USE_MOCKS) {
    mockCitas = mockCitas.map((c) => (c.id_cita === idCita ? { ...c, estado } : c));
    return { success: true, data: null, message: 'OK: Estado de cita actualizado correctamente.' };
  }
  return api.put(`/gestores/citas/${idCita}/estado`, { estado });
};

// --- INVENTARIO ---
export const ingresarStock = async (payload) => {
  if (USE_MOCKS) {
    return {
      success: true,
      data: null,
      message: `OK: Ingreso de ${payload.cantidad} unidades enviado para producto #${payload.id_producto}.`,
    };
  }
  return api.post('/gestores/inventario/ingresar', payload);
};

export const ajustarStock = async (payload) => {
  if (USE_MOCKS) {
    return { success: true, data: null, message: 'OK: Ajuste de inventario aplicado correctamente.' };
  }
  return api.put('/gestores/inventario/ajustar', payload);
};

// --- CLINICO ---
export const crearFichaClinica = async (payload) => {
  if (USE_MOCKS) {
    const idFicha = Date.now();
    mockCitas = mockCitas.map((c) =>
      c.id_cita === Number(payload.id_cita) ? { ...c, estado: 'ATENDIDA' } : c
    );
    return {
      success: true,
      data: { id_ficha: idFicha },
      message: 'OK: Ficha clinica registrada y cita marcada como ATENDIDA.',
    };
  }
  return api.post('/gestores/fichas-clinicas', payload);
};

export const agregarRecetaClinica = async (payload) => {
  const idFicha = payload.id_ficha ?? payload.idFicha;
  if (USE_MOCKS) {
    return {
      success: true,
      data: { id_receta: Date.now() },
      message: 'OK: Receta agregada correctamente.',
    };
  }
  return api.post(`/gestores/fichas-clinicas/${idFicha}/recetas`, payload);
};

export const getHistorialPaciente = async (idPaciente) => {
  if (USE_MOCKS) {
    return {
      success: true,
      data: mockHistorialPaciente.filter((h) => h.id_cita),
      message: 'OK',
    };
  }
  return api.get(`/gestores/pacientes/${idPaciente}/historial`);
};
import api, { USE_MOCKS } from './api';

// TODO: PATCH TEMPORAL - mocks en memoria para vacunaciones y recordatorios
let mockVacunaciones = [
  {
    id_vacunacion: 1,
    id_paciente: 1,
    nombre_paciente: 'Max',
    nombre_especie: 'Canino',
    dueno: 'Juan Pérez',
    id_producto: 103,
    vacuna: 'Vacuna Antirrábica',
    id_usuario: 2,
    veterinario: 'Carlos Castro',
    fecha_aplicacion: '2026-10-15',
    fecha_proxima_dosis: '2026-11-25',
    observaciones: 'Sin reacciones adversas',
    estado: 0,
  },
  {
    id_vacunacion: 2,
    id_paciente: 2,
    nombre_paciente: 'Luna',
    nombre_especie: 'Felino',
    dueno: 'María Gómez',
    id_producto: 104,
    vacuna: 'Vacuna Óctuple',
    id_usuario: 2,
    veterinario: 'Carlos Castro',
    fecha_aplicacion: '2026-10-01',
    fecha_proxima_dosis: '2026-11-10',
    observaciones: 'Control pendiente',
    estado: 0,
  },
];

export const obtenerVacunaciones = async (idPaciente = null) => {
  if (USE_MOCKS) {
    const lista = idPaciente
      ? mockVacunaciones.filter((v) => v.id_paciente === Number(idPaciente))
      : mockVacunaciones;
    return { success: true, data: [...lista], message: 'OK' };
  }
  return api.get('/gestores/vacunaciones', {
    params: idPaciente ? { id_paciente: idPaciente } : {},
  });
};

export const registrarVacunacion = async (payload) => {
  if (USE_MOCKS) {
    const nueva = {
      id_vacunacion: Date.now(),
      id_paciente: Number(payload.id_paciente),
      nombre_paciente: payload.paciente_nombre || `Paciente #${payload.id_paciente}`,
      id_producto: Number(payload.id_producto),
      vacuna: payload.vacuna_nombre || `Vacuna #${payload.id_producto}`,
      id_usuario: payload.id_usuario,
      fecha_aplicacion: payload.fecha_aplicacion,
      fecha_proxima_dosis: payload.fecha_proxima_dosis,
      observaciones: payload.observaciones || '',
      estado: 0,
    };
    mockVacunaciones = [nueva, ...mockVacunaciones];
    return { success: true, data: nueva, message: 'OK: Vacunacion registrada correctamente.' };
  }
  return api.post('/gestores/vacunaciones', payload);
};

export const aplicarRefuerzoVacuna = async (idVacunacionAnterior, payload) => {
  if (USE_MOCKS) {
    const anterior = mockVacunaciones.find((v) => v.id_vacunacion === Number(idVacunacionAnterior));
    if (!anterior) {
      return { success: false, data: null, message: 'ERROR: No se encontro el registro de vacunacion anterior.' };
    }
    mockVacunaciones = mockVacunaciones.map((v) =>
      v.id_vacunacion === Number(idVacunacionAnterior) ? { ...v, estado: 1 } : v
    );
    const nueva = {
      ...anterior,
      id_vacunacion: Date.now(),
      id_usuario: payload.id_usuario,
      fecha_aplicacion: payload.fecha_aplicacion,
      fecha_proxima_dosis: payload.fecha_proxima_dosis,
      observaciones: payload.observaciones || '',
      estado: 0,
    };
    mockVacunaciones = [nueva, ...mockVacunaciones];
    return {
      success: true,
      data: nueva,
      message: 'OK: Refuerzo aplicado y nueva dosis programada en la misma transaccion.',
    };
  }
  return api.post(`/gestores/vacunaciones/${idVacunacionAnterior}/refuerzo`, payload);
};

export const obtenerRecordatorios = async (fechaDesde = null, fechaHasta = null) => {
  if (USE_MOCKS) {
    const pendientes = mockVacunaciones
      .filter((v) => v.estado === 0)
      .filter((v) => !fechaDesde || v.fecha_proxima_dosis >= fechaDesde)
      .filter((v) => !fechaHasta || v.fecha_proxima_dosis <= fechaHasta)
      .map((v) => ({
        id_vacunacion: v.id_vacunacion,
        nombre_paciente: v.nombre_paciente,
        nombre_especie: v.nombre_especie,
        vacuna: v.vacuna,
        fecha_aplicacion: v.fecha_aplicacion,
        fecha_proxima_dosis: v.fecha_proxima_dosis,
        estado_alerta: v.fecha_proxima_dosis < '2026-11-25' ? 'Vencida' : 'Proxima',
        dueno: v.dueno,
        telefono: '987654321',
        correo: 'contacto@mail.com',
        observaciones: v.observaciones,
      }));
    return { success: true, data: pendientes, message: 'OK' };
  }
  return api.get('/reportes/vacunas-pendientes', {
    params: {
      ...(fechaDesde ? { fecha_desde: fechaDesde } : {}),
      ...(fechaHasta ? { fecha_hasta: fechaHasta } : {}),
    },
  });
};
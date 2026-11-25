export const obtenerVacunaciones = async () => {
  return {
    success: true,
    data: [
      {
        id: 1,
        paciente_id: 1,
        paciente_nombre: 'Max',
        producto_id: 101,
        vacuna_nombre: 'Vacuna Antirrábica',
        fecha_aplicacion: '2026-10-15',
        fecha_proxima_dosis: '2026-11-25',
        observaciones: 'Sin reacciones adversas'
      }
    ],
    message: 'Historial obtenido'
  };
};

export const registrarVacunacion = async (payload) => {
  return {
    success: true,
    data: { id: Date.now(), ...payload },
    message: 'Vacunación registrada'
  };
};

export const obtenerRecordatorios = async () => {
  return {
    success: true,
    data: [
      {
        id: 1,
        mascota: 'Max',
        vacuna: 'Vacuna Antirrábica',
        fecha_proxima_dosis: '2026-11-25',
        estado: 'Próxima',
        dueno: 'Juan Pérez',
        telefono: '987654321',
        correo: 'juan@mail.com'
      },
      {
        id: 2,
        mascota: 'Luna',
        vacuna: 'Vacuna Óctuple',
        fecha_proxima_dosis: '2026-11-10',
        estado: 'Vencida',
        dueno: 'María Gómez',
        telefono: '912345678',
        correo: 'maria@mail.com'
      }
    ],
    message: 'Recordatorios obtenidos'
  };
};
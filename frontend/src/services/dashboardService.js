export const obtenerResumenInicio = async () => {
  return {
    success: true,
    data: {
      kpis: {
        citas_hoy: 6,
        atenciones_hoy: 4,
        vacunas_pendientes: 4,
        productos_criticos: 2,
        ventas_hoy: 185000
      },
      proximas_citas: [
        { id: 1, hora: '10:30', mascota: 'Max', motivo: 'Vacunación anual', veterinario: 'Dr. Carlos' },
        { id: 2, hora: '11:15', mascota: 'Luna', motivo: 'Control sano', veterinario: 'Dra. Andrea' },
        { id: 3, hora: '12:00', mascota: 'Rocky', motivo: 'Revisión dental', veterinario: 'Dr. Carlos' }
      ],
      recordatorios_vacunas: [
        { id: 1, mascota: 'Luna', vacuna: 'Óctuple', fecha: '2026-11-10', estado: 'Vencida' },
        { id: 2, mascota: 'Max', vacuna: 'Antirrábica', fecha: '2026-11-25', estado: 'Próxima' }
      ],
      stock_critico: [
        { id: 101, producto: 'Meloxicam 5mg', stock: 5 },
        { id: 104, producto: 'Pipeta Antipulgas', stock: 2 }
      ]
    },
    message: 'Resumen cargado'
  };
};
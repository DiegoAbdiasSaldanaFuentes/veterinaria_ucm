const { Router } = require('express');
const {
  listarVentas,
  obtenerDetalleVenta,
  crearVenta,
  agregarDetalleVenta,
  anularVenta,
  listarCitas,
  listarBloquesDisponibles,
  reservarCita,
  actualizarEstadoCita,
} = require('../controllers/gestoresVentasAgendaController');

const {
  ingresarStock,
  ajustarStock,
  crearFichaClinica,
  agregarReceta,
  obtenerHistorialPaciente,
  verificarVeterinario,
  listarVacunaciones,
  registrarVacunacion,
  aplicarRefuerzoVacuna,
} = require('../controllers/gestoresClinicoInventarioController');

const router = Router();

// Gestor 1: Punto de venta (Ventas y detalles)
router.get('/ventas', listarVentas);
router.post('/ventas', crearVenta);
router.get('/ventas/:id/detalle', obtenerDetalleVenta);
router.post('/ventas/:id/detalle', agregarDetalleVenta);
router.put('/ventas/:id/anular', anularVenta);

// Gestor 2: Agenda y citas médicas
router.get('/citas', listarCitas);
router.post('/citas', reservarCita);
router.put('/citas/:id/estado', actualizarEstadoCita);
router.get('/bloques-disponibles', listarBloquesDisponibles);

// Gestor 3: Inventario
router.post('/inventario/ingresar', ingresarStock);
router.put('/inventario/ajustar', ajustarStock);

// Gestor 4: Clínico (Fichas, recetas e historial)
router.post('/fichas-clinicas', crearFichaClinica);
router.post('/fichas-clinicas/:idFicha/recetas', agregarReceta);
router.get('/pacientes/:idPaciente/historial', obtenerHistorialPaciente);

// Gestor 5: Vacunaciones y refuerzos
router.get('/veterinarios/:idUsuario/validar', verificarVeterinario);
router.get('/vacunaciones', listarVacunaciones);
router.post('/vacunaciones', registrarVacunacion);
router.post('/vacunaciones/:id/refuerzo', aplicarRefuerzoVacuna);

module.exports = router;
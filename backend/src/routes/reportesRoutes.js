const { Router } = require('express');
const {
  reporteVentasMes,
  reporteStockCritico,
  reporteVacunasPendientes,
  reporteRendimientoStaff,
  reporteResumenDashboard,
} = require('../controllers/reportesController');

const router = Router();

router.get('/ventas-mes', reporteVentasMes);
router.get('/stock-critico', reporteStockCritico);
router.get('/vacunas-pendientes', reporteVacunasPendientes);
router.get('/rendimiento-staff', reporteRendimientoStaff);
router.get('/resumen-dashboard', reporteResumenDashboard);

module.exports = router;
const { Router } = require('express');
const { login, registrar } = require('../controllers/authController');

const router = Router();
router.post('/login', login);
router.post('/registro', registrar);

module.exports = router;
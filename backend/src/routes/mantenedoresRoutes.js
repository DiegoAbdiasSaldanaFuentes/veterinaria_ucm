const { Router } = require('express');
const {
  listarRoles,
  crearRol,
  actualizarRol,
  eliminarRol,
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  listarClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  listarEspecies,
  crearEspecie,
  actualizarEspecie,
  eliminarEspecie,
  listarPacientes,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente,
} = require('../controllers/mantenedoresBaseController');

const {
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
} = require('../controllers/mantenedoresOperativosController');

const router = Router();

// Roles
router.get('/roles', listarRoles);
router.post('/roles', crearRol);
router.put('/roles/:id', actualizarRol);
router.delete('/roles/:id', eliminarRol);

// Usuarios
router.get('/usuarios', listarUsuarios);
router.post('/usuarios', crearUsuario);
router.put('/usuarios/:id', actualizarUsuario);
router.delete('/usuarios/:id', eliminarUsuario);

// Clientes
router.get('/clientes', listarClientes);
router.post('/clientes', crearCliente);
router.put('/clientes/:id', actualizarCliente);
router.delete('/clientes/:id', eliminarCliente);

// Especies
router.get('/especies', listarEspecies);
router.post('/especies', crearEspecie);
router.put('/especies/:id', actualizarEspecie);
router.delete('/especies/:id', eliminarEspecie);

// Pacientes (soporta ?id_cliente= opcional)
router.get('/pacientes', listarPacientes);
router.post('/pacientes', crearPaciente);
router.put('/pacientes/:id', actualizarPaciente);
router.delete('/pacientes/:id', eliminarPaciente);

// Proveedores
router.get('/proveedores', listarProveedores);
router.post('/proveedores', crearProveedor);
router.put('/proveedores/:id', actualizarProveedor);
router.delete('/proveedores/:id', eliminarProveedor);

// Productos
router.get('/productos', listarProductos);
router.get('/vacunas', listarProductos);
router.post('/productos', crearProducto);
router.post('/vacunas', crearProducto);
router.put('/productos/:id', actualizarProducto);
router.put('/vacunas/:id', actualizarProducto);
router.delete('/productos/:id', eliminarProducto);
router.delete('/vacunas/:id', eliminarProducto);

// Servicios
router.get('/servicios', listarServicios);
router.post('/servicios', crearServicio);
router.put('/servicios/:id', actualizarServicio);
router.delete('/servicios/:id', eliminarServicio);

// Bloques de agenda
router.get('/bloques-agenda', listarBloquesAgenda);
router.post('/bloques-agenda', crearBloqueAgenda);
router.put('/bloques-agenda/:id', actualizarBloqueAgenda);
router.delete('/bloques-agenda/:id', eliminarBloqueAgenda);

// Fichas clínicas y recetas (soporta ?id_ficha= opcional en recetas)
router.get('/fichas-clinicas', listarFichasClinicas);
router.put('/fichas-clinicas/:id', actualizarFichaClinica);
router.delete('/fichas-clinicas/:id', eliminarFichaClinica);

router.get('/recetas', listarRecetas);
router.put('/recetas/:id', actualizarReceta);
router.delete('/recetas/:id', eliminarReceta);

module.exports = router;
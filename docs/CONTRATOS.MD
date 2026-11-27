# Contratos API REST — Veterinaria UCM

Formato estándar de respuesta en todos los endpoints:
{ "success": true, "data": {}, "message": "OK: ..." }

## Autenticación
- POST /api/auth/login — Body: { "nombre_usuario": "", "clave": "" } -> PROC_VALIDAR_LOGIN / FUNC_LOGIN_USUARIO

## Mantenedores (CRUD)
- Roles: GET /api/roles, POST /api/roles ({ nombre_rol }), PUT /api/roles/:id ({ nombre_rol }), DELETE /api/roles/:id
- Usuarios: GET /api/usuarios, POST /api/usuarios ({ id_rol, nombre_usuario, clave, nombres, apellidos }), PUT /api/usuarios/:id ({ id_rol, nombres, apellidos, activo, clave? }), DELETE /api/usuarios/:id
- Clientes: GET /api/clientes, POST /api/clientes ({ rut, nombres, apellidos, telefono, correo }), PUT /api/clientes/:id ({ nombres, apellidos, telefono, correo }), DELETE /api/clientes/:id
- Especies: GET /api/especies, POST /api/especies ({ nombre_especie }), PUT /api/especies/:id ({ nombre_especie }), DELETE /api/especies/:id
- Pacientes: GET /api/pacientes, GET /api/clientes/:id/pacientes, POST /api/pacientes ({ id_cliente, id_especie, nombre_paciente, fecha_nacimiento }), PUT /api/pacientes/:id, DELETE /api/pacientes/:id
- Proveedores: GET /api/proveedores, POST /api/proveedores ({ razon_social, rut, telefono, correo }), PUT /api/proveedores/:id, DELETE /api/proveedores/:id
- Productos: GET /api/productos, POST /api/productos ({ id_proveedor, sku, nombre_producto, precio_unitario, stock, stock_minimo }), PUT /api/productos/:id ({ ..., activo }), DELETE /api/productos/:id
- Servicios: GET /api/servicios, POST /api/servicios ({ nombre_servicio }), PUT /api/servicios/:id ({ nombre_servicio, activo }), DELETE /api/servicios/:id
- Bloques Agenda: GET /api/bloques, GET /api/bloques/disponibles?fecha=YYYY-MM-DD, POST /api/bloques ({ id_veterinario, fecha_hora_inicio, habilitado }), PUT /api/bloques/:id, DELETE /api/bloques/:id
- Fichas y Recetas: GET /api/fichas, PUT /api/fichas/:id, DELETE /api/fichas/:id, GET /api/recetas, GET /api/fichas/:id/recetas, PUT /api/recetas/:id, DELETE /api/recetas/:id

## Gestores Transaccionales
- Ventas: GET /api/ventas, GET /api/ventas/:id/detalle, POST /api/ventas ({ id_cliente, id_usuario, detalle: [{ id_producto, cantidad }] }), PATCH /api/ventas/:id/anular
- Citas: GET /api/citas, POST /api/citas ({ id_bloque, id_paciente, id_servicio, motivo }), PATCH /api/citas/:id/estado ({ estado })
- Inventario: POST /api/inventario/ingreso ({ id_producto, cantidad }), POST /api/inventario/ajuste ({ id_producto, nuevo_stock, nuevo_stock_minimo })
- Clínico: POST /api/clinico/fichas ({ id_cita, diagnostico, observaciones }), POST /api/clinico/recetas ({ id_ficha, id_producto, indicaciones }), GET /api/pacientes/:id/historial
- Vacunaciones: GET /api/vacunaciones?id_paciente=, POST /api/vacunaciones ({ id_paciente, id_producto, id_usuario, fecha_aplicacion, fecha_proxima_dosis, observaciones }), POST /api/vacunaciones/:id/refuerzo ({ id_usuario, fecha_aplicacion, fecha_proxima_dosis, observaciones })

## Reportes
- GET /api/reportes/resumen
- GET /api/reportes/ventas-mes?mes=&anio=
- GET /api/reportes/stock-critico
- GET /api/reportes/vacunas-pendientes?desde=&hasta=
- GET /api/reportes/rendimiento-staff?mes=&anio=
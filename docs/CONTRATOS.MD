# Contratos API REST — Veterinaria UCM

- **Base URL local:** `http://localhost:3000`
- **CORS permitido:** `http://localhost:5173`
- **Formato estándar de respuesta:**

```json
{
  "success": true,
  "data": {},
  "message": "OK: ..."
}
```

## Estado del Servidor

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/health` | Verifica disponibilidad de Express y del pool de conexiones de Oracle (`SELECT 1 FROM DUAL`). |

## Autenticación (`/api/auth`)

| Método | Endpoint | Body / Parámetros | Objeto PL/SQL / Comportamiento |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | `{ "nombre_usuario": "", "clave": "" }` | `FUNC_LOGIN_USUARIO` / `PROC_VALIDAR_LOGIN`. Valida contraseñas con `scrypt` y nunca retorna `clave_hash`. |
| `POST` | `/api/auth/registro` | `{ "nombres": "", "apellidos": "", "nombre_usuario": "", "clave": "" }` | `PROC_SOLICITAR_USUARIO`. Cifra la contraseña con `scrypt` y crea la cuenta inactiva con rol `Recepcionista`, pendiente de activación por un administrador. |

## Mantenedores CRUD (`/api/mantenedores`)

### Roles
- `GET /api/mantenedores/roles`
- `POST /api/mantenedores/roles` — Body: `{ "nombre_rol": "" }`
- `PUT /api/mantenedores/roles/:id` — Body: `{ "nombre_rol": "" }`
- `DELETE /api/mantenedores/roles/:id`

### Usuarios
- `GET /api/mantenedores/usuarios`
- `POST /api/mantenedores/usuarios` — Body: `{ "id_rol": 1, "nombre_usuario": "", "clave": "", "nombres": "", "apellidos": "" }`
- `PUT /api/mantenedores/usuarios/:id` — Body: `{ "id_rol": 1, "nombres": "", "apellidos": "", "activo": 1, "clave": "" }` (`clave` opcional)
- `DELETE /api/mantenedores/usuarios/:id`

### Clientes
- `GET /api/mantenedores/clientes`
- `POST /api/mantenedores/clientes` — Body: `{ "rut": "12345678-9", "nombres": "", "apellidos": "", "telefono": "", "correo": "" }`
- `PUT /api/mantenedores/clientes/:id` — Body: `{ "nombres": "", "apellidos": "", "telefono": "", "correo": "" }`
- `DELETE /api/mantenedores/clientes/:id`

### Especies
- `GET /api/mantenedores/especies`
- `POST /api/mantenedores/especies` — Body: `{ "nombre_especie": "" }`
- `PUT /api/mantenedores/especies/:id` — Body: `{ "nombre_especie": "" }`
- `DELETE /api/mantenedores/especies/:id`

### Pacientes
- `GET /api/mantenedores/pacientes` — Soporta filtro opcional `?id_cliente=`
- `POST /api/mantenedores/pacientes` — Body: `{ "id_cliente": 1, "id_especie": 1, "nombre_paciente": "", "fecha_nacimiento": "YYYY-MM-DD" }`
- `PUT /api/mantenedores/pacientes/:id` — Body: `{ "id_cliente": 1, "id_especie": 1, "nombre_paciente": "", "fecha_nacimiento": "YYYY-MM-DD" }`
- `DELETE /api/mantenedores/pacientes/:id`

### Proveedores
- `GET /api/mantenedores/proveedores`
- `POST /api/mantenedores/proveedores` — Body: `{ "razon_social": "", "rut": "12345678-9", "telefono": "", "correo": "" }`
- `PUT /api/mantenedores/proveedores/:id` — Body: `{ "razon_social": "", "rut": "12345678-9", "telefono": "", "correo": "" }`
- `DELETE /api/mantenedores/proveedores/:id`

### Productos Comerciales (`ES_VACUNA = 0`)
- `GET /api/mantenedores/productos`
- `POST /api/mantenedores/productos` — Body: `{ "id_proveedor": 1, "sku": "", "nombre_producto": "", "precio_unitario": 0, "stock": 0, "stock_minimo": 0 }`
- `PUT /api/mantenedores/productos/:id` — Body: `{ "id_proveedor": 1, "sku": "", "nombre_producto": "", "precio_unitario": 0, "stock": 0, "stock_minimo": 0, "activo": 1 }`
- `DELETE /api/mantenedores/productos/:id`

### Vacunas (Catálogo Clínico en tabla `VACUNAS`, sin precio)
- `GET /api/mantenedores/vacunas` — Consulta `FUNC_GET_VACUNAS`
- `POST /api/mantenedores/vacunas` — Body: `{ "id_proveedor": 1, "sku": "", "nombre_producto": "", "stock": 0, "stock_minimo": 0 }`
- `PUT /api/mantenedores/vacunas/:id` — Body: `{ "id_proveedor": 1, "sku": "", "nombre_producto": "", "stock": 0, "stock_minimo": 0, "activo": 1 }`
- `DELETE /api/mantenedores/vacunas/:id`

### Servicios
- `GET /api/mantenedores/servicios`
- `POST /api/mantenedores/servicios` — Body: `{ "nombre_servicio": "" }`
- `PUT /api/mantenedores/servicios/:id` — Body: `{ "nombre_servicio": "", "activo": 1 }`
- `DELETE /api/mantenedores/servicios/:id`

### Bloques de Agenda
- `GET /api/mantenedores/bloques-agenda`
- `POST /api/mantenedores/bloques-agenda` — Body: `{ "id_veterinario": 1, "fecha_hora_inicio": "YYYY-MM-DD HH:mm", "habilitado": 1 }` (exige hora en `:00` o `:30` y fecha futura en Oracle)
- `PUT /api/mantenedores/bloques-agenda/:id` — Body: `{ "fecha_hora_inicio": "YYYY-MM-DD HH:mm", "habilitado": 1 }`
- `DELETE /api/mantenedores/bloques-agenda/:id`

### Fichas Clínicas y Recetas Médicas
- `GET /api/mantenedores/fichas-clinicas`
- `PUT /api/mantenedores/fichas-clinicas/:id` — Body: `{ "diagnostico": "", "observaciones": "" }`
- `DELETE /api/mantenedores/fichas-clinicas/:id`
- `GET /api/mantenedores/recetas` — Soporta filtro opcional `?id_ficha=`
- `PUT /api/mantenedores/recetas/:id` — Body: `{ "id_producto": 1, "indicaciones": "" }`
- `DELETE /api/mantenedores/recetas/:id`

## Gestores Transaccionales (`/api/gestores`)

### Ventas (POS — excluye vacunas)
- `GET /api/gestores/ventas`
- `GET /api/gestores/ventas/:id/detalle`
- `POST /api/gestores/ventas` — Body: `{ "id_cliente": 1, "id_usuario": 1, "detalle": [{ "id_producto": 1, "cantidad": 1 }] }`
- `PATCH /api/gestores/ventas/:id/anular`

### Agenda y Citas
- `GET /api/gestores/citas`
- `GET /api/gestores/bloques-disponibles?fecha=YYYY-MM-DD`
- `POST /api/gestores/citas` — Body: `{ "id_bloque": 1, "id_paciente": 1, "id_servicio": 1, "motivo": "" }`
- `PATCH /api/gestores/citas/:id/estado` — Body: `{ "estado": "RESERVADA | CANCELADA | ATENDIDA | NO_ASISTIO" }`

### Inventario (solo productos comerciales, `ES_VACUNA = 0`)
- `POST /api/gestores/inventario/ingreso` — Body: `{ "id_producto": 1, "cantidad": 10 }`
- `POST /api/gestores/inventario/ajuste` — Body: `{ "id_producto": 1, "nuevo_stock": 10, "nuevo_stock_minimo": 5 }`

### Gestión Clínica
- `POST /api/gestores/clinico/fichas` — Body: `{ "id_cita": 1, "diagnostico": "", "observaciones": "" }`
- `POST /api/gestores/clinico/recetas` — Body: `{ "id_ficha": 1, "id_producto": 1, "indicaciones": "" }` (solo productos comerciales)
- `GET /api/gestores/pacientes/:id/historial`

### Vacunaciones y Refuerzos
- `GET /api/gestores/vacunaciones?id_paciente=`
- `POST /api/gestores/vacunaciones` — Body: `{ "id_paciente": 1, "id_producto": 1, "id_usuario": 1, "fecha_aplicacion": "YYYY-MM-DD", "fecha_proxima_dosis": "YYYY-MM-DD", "observaciones": "" }` (`id_producto` referencia a `VACUNAS.ID_VACUNA`)
- `POST /api/gestores/vacunaciones/:id/refuerzo` — Body: `{ "id_usuario": 1, "fecha_aplicacion": "YYYY-MM-DD", "fecha_proxima_dosis": "YYYY-MM-DD", "observaciones": "" }`

## Reportes (`/api/reportes`)

| Método | Endpoint | Parámetros Query | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reportes/resumen` | — | KPIs generales del panel principal. |
| `GET` | `/api/reportes/ventas-mes` | `mes`, `anio` | Ventas registradas del periodo indicado. |
| `GET` | `/api/reportes/stock-critico` | — | Productos comerciales activos con stock igual o menor al mínimo (excluye vacunas). |
| `GET` | `/api/reportes/vacunas-pendientes` | `desde`, `hasta` (opcionales) | Recordatorios de refuerzos pendientes (`ESTADO = 0`) consultando `VACUNAS`. |
| `GET` | `/api/reportes/rendimiento-staff` | `mes`, `anio` (opcionales) | Ventas, citas atendidas y vacunaciones aplicadas por integrante del equipo. |
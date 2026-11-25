# Contratos PL/SQL — Integrante 2 (Oracle 21c)

> **Aviso para el Integrante 3 (Node.js):** Este documento detalla las firmas exactas de todos los procedimientos, funciones y el formato exacto de las columnas que retorna cada cursor (`SYS_REFCURSOR`) para que puedas mapearlo directamente en la API con `oracledb`.

---

## Orden de Ejecución en Oracle 21c

1. `oracle_db/01_esquema_base_es3.sql` *(Integrante 1 — Tablas base y secuencias)*
2. `oracle_db/02_esquema_operativo_es3.sql` *(Integrante 1 — Tablas operativas y secuencias)*
3. `oracle_db/03_mantenedores_base_plsql.sql` *(Control de acceso + 10 Mantenedores CRUD)*
4. `oracle_db/04_gestores_y_triggers_plsql.sql` *(Gestores de Ventas POS y Agenda/Citas)*
5. `oracle_db/05_productos_y_clinico_plsql.sql` *(Gestores de Inventario, Clínico y Vacunaciones)*
6. `oracle_db/06_reportes_y_triggers_plsql.sql` *(Reportes Dashboards + 5 Triggers de control)*
7. `oracle_db/07_seed_data.sql` *(Datos semilla iniciales para pruebas y demostración)*

**Convención de respuestas:** Todos los procedimientos manejan `COMMIT`/`ROLLBACK` y retornan un mensaje en `o_mensaje` con prefijo `'OK: ...'` o `'ERROR: ...'`. Ningún procedimiento usa `DBMS_OUTPUT.PUT_LINE`.

---

## 1. Control de Acceso y Mantenedores (`03_mantenedores_base_plsql.sql`)

### Control de Acceso (Login)
* `FUNC_LOGIN_USUARIO(p_nombre_usuario)` → `SYS_REFCURSOR`
  * **Columnas:** `ID_USUARIO`, `ID_ROL`, `NOMBRE_ROL`, `NOMBRE_USUARIO`, `CLAVE_HASH`, `NOMBRES`, `APELLIDOS`, `ACTIVO`
* `PROC_VALIDAR_LOGIN(p_nombre_usuario, p_clave_hash, o_id_usuario OUT, o_nombre_rol OUT, o_mensaje OUT)`

### Mantenedor 1: `ROLES`
* `PROC_CREAR_ROL(p_nombre_rol, o_id_rol OUT, o_mensaje OUT)`
* `PROC_ACTUALIZAR_ROL(p_id_rol, p_nombre_rol, o_mensaje OUT)`
* `PROC_ELIMINAR_ROL(p_id_rol, o_mensaje OUT)`
* `FUNC_GET_ROLES()` → `SYS_REFCURSOR`
  * **Columnas:** `ID_ROL`, `NOMBRE_ROL`

### Mantenedor 2: `USUARIOS`
* `PROC_CREAR_USUARIO(p_id_rol, p_nombre_usuario, p_clave_hash, p_nombres, p_apellidos, o_id_usuario OUT, o_mensaje OUT)`
* `PROC_ACTUALIZAR_USUARIO(p_id_usuario, p_id_rol, p_nombres, p_apellidos, p_activo, o_mensaje OUT, p_clave_hash DEFAULT NULL)`
* `PROC_ELIMINAR_USUARIO(p_id_usuario, o_mensaje OUT)`
* `FUNC_GET_USUARIOS()` → `SYS_REFCURSOR`
  * **Columnas:** `ID_USUARIO`, `ID_ROL`, `NOMBRE_ROL`, `NOMBRE_USUARIO`, `NOMBRES`, `APELLIDOS`, `ACTIVO`

### Mantenedor 3: `CLIENTES`
* `PROC_CREAR_CLIENTE(p_rut, p_nombres, p_apellidos, p_telefono, p_correo, o_id_cliente OUT, o_mensaje OUT)`
* `PROC_ACTUALIZAR_CLIENTE(p_id_cliente, p_telefono, p_correo, o_mensaje OUT, p_nombres DEFAULT NULL, p_apellidos DEFAULT NULL)`
* `PROC_ELIMINAR_CLIENTE(p_id_cliente, o_mensaje OUT)`
* `FUNC_GET_CLIENTES()` → `SYS_REFCURSOR`
  * **Columnas:** `ID_CLIENTE`, `RUT`, `NOMBRES`, `APELLIDOS`, `TELEFONO`, `CORREO`

### Mantenedor 4: `ESPECIES`
* `PROC_CREAR_ESPECIE(p_nombre_especie, o_id_especie OUT, o_mensaje OUT)`
* `PROC_ACTUALIZAR_ESPECIE(p_id_especie, p_nombre_especie, o_mensaje OUT)`
* `PROC_ELIMINAR_ESPECIE(p_id_especie, o_mensaje OUT)`
* `FUNC_GET_ESPECIES()` → `SYS_REFCURSOR`
  * **Columnas:** `ID_ESPECIE`, `NOMBRE_ESPECIE`

### Mantenedor 5: `PACIENTES`
* `PROC_CREAR_PACIENTE(p_id_cliente, p_id_especie, p_nombre_paciente, p_fecha_nacimiento, o_id_paciente OUT, o_mensaje OUT)`
* `PROC_ACTUALIZAR_PACIENTE(p_id_paciente, p_id_cliente, p_id_especie, p_nombre_paciente, p_fecha_nacimiento, o_mensaje OUT)`
* `PROC_ELIMINAR_PACIENTE(p_id_paciente, o_mensaje OUT)`
* `FUNC_GET_PACIENTES()` → `SYS_REFCURSOR`
  * **Columnas:** `ID_PACIENTE`, `NOMBRE_PACIENTE`, `FECHA_NACIMIENTO`, `ID_ESPECIE`, `NOMBRE_ESPECIE`, `ID_CLIENTE`, `RUT_CLIENTE`, `DUENO`
* `FUNC_GET_PACIENTES_POR_CLIENTE(p_id_cliente)` → `SYS_REFCURSOR`
  * **Columnas:** `ID_PACIENTE`, `NOMBRE_PACIENTE`, `FECHA_NACIMIENTO`, `ID_ESPECIE`, `NOMBRE_ESPECIE`, `ID_CLIENTE`

### Mantenedor 6: `PROVEEDORES`
* `PROC_CREAR_PROVEEDOR(p_razon_social, p_rut, p_telefono, p_correo, o_id_proveedor OUT, o_mensaje OUT)`
* `PROC_ACTUALIZAR_PROVEEDOR(p_id_proveedor, p_razon_social, p_rut, p_telefono, p_correo, o_mensaje OUT)`
* `PROC_ELIMINAR_PROVEEDOR(p_id_proveedor, o_mensaje OUT)`
* `FUNC_GET_PROVEEDORES()` → `SYS_REFCURSOR`
  * **Columnas:** `ID_PROVEEDOR`, `RAZON_SOCIAL`, `RUT`, `TELEFONO`, `CORREO`

### Mantenedor 7: `PRODUCTOS`
* `PROC_CREAR_PRODUCTO(p_id_proveedor, p_sku, p_nombre_producto, p_precio_unitario, p_stock, p_stock_minimo, o_id_producto OUT, o_mensaje OUT)`
* `PROC_ACTUALIZAR_PRODUCTO(p_id_producto, p_id_proveedor, p_sku, p_nombre_producto, p_precio_unitario, p_stock, p_stock_minimo, p_activo, o_mensaje OUT)`
* `PROC_ELIMINAR_PRODUCTO(p_id_producto, o_mensaje OUT)`
* `FUNC_GET_PRODUCTOS()` → `SYS_REFCURSOR`
  * **Columnas:** `ID_PRODUCTO`, `SKU`, `NOMBRE_PRODUCTO`, `PRECIO_UNITARIO`, `STOCK`, `STOCK_MINIMO`, `ACTIVO`, `ID_PROVEEDOR`, `PROVEEDOR`

### Mantenedor 8: `SERVICIOS`
* `PROC_CREAR_SERVICIO(p_nombre_servicio, o_id_servicio OUT, o_mensaje OUT)`
* `PROC_ACTUALIZAR_SERVICIO(p_id_servicio, p_nombre_servicio, p_activo, o_mensaje OUT)`
* `PROC_ELIMINAR_SERVICIO(p_id_servicio, o_mensaje OUT)`
* `FUNC_GET_SERVICIOS()` → `SYS_REFCURSOR`
  * **Columnas:** `ID_SERVICIO`, `NOMBRE_SERVICIO`, `ACTIVO`

### Mantenedor 9: `BLOQUES_AGENDA`
* `PROC_CREAR_BLOQUE_AGENDA(p_id_veterinario, p_fecha_hora_inicio, p_habilitado, o_id_bloque OUT, o_mensaje OUT)`
* `PROC_ACTUALIZAR_BLOQUE_AGENDA(p_id_bloque, p_fecha_hora_inicio, p_habilitado, o_mensaje OUT)`
* `PROC_ELIMINAR_BLOQUE_AGENDA(p_id_bloque, o_mensaje OUT)`
* `FUNC_GET_BLOQUES_AGENDA()` → `SYS_REFCURSOR`
  * **Columnas:** `ID_BLOQUE`, `ID_VETERINARIO`, `VETERINARIO`, `FECHA_HORA_INICIO`, `HABILITADO`, `OCUPADO`

### Mantenedor 10: `FICHAS_CLINICAS` y `RECETAS`
* `PROC_ACTUALIZAR_FICHA_CLINICA(p_id_ficha, p_diagnostico, p_observaciones, o_mensaje OUT)`
* `PROC_ELIMINAR_FICHA_CLINICA(p_id_ficha, o_mensaje OUT)`
* `FUNC_GET_FICHAS_CLINICAS()` → `SYS_REFCURSOR`
  * **Columnas:** `ID_FICHA`, `ID_CITA`, `FECHA_ATENCION`, `ID_PACIENTE`, `NOMBRE_PACIENTE`, `DUENO`, `VETERINARIO`, `NOMBRE_SERVICIO`, `DIAGNOSTICO`, `OBSERVACIONES`
* `PROC_ACTUALIZAR_RECETA(p_id_receta, p_id_producto, p_indicaciones, o_mensaje OUT)`
* `PROC_ELIMINAR_RECETA(p_id_receta, o_mensaje OUT)`
* `FUNC_GET_RECETAS()` → `SYS_REFCURSOR`
  * **Columnas:** `ID_RECETA`, `ID_FICHA`, `ID_PACIENTE`, `NOMBRE_PACIENTE`, `ID_PRODUCTO`, `MEDICAMENTO`, `INDICACIONES`
* `FUNC_GET_RECETAS_POR_FICHA(p_id_ficha)` → `SYS_REFCURSOR`
  * **Columnas:** `ID_RECETA`, `ID_FICHA`, `ID_PRODUCTO`, `SKU`, `MEDICAMENTO`, `INDICACIONES`

---

## 2. Gestores Transaccionales (`04` y `05`)

### Gestor 1: Punto de Venta (`04_gestores_y_triggers_plsql.sql`)
* `PROC_CREAR_VENTA(p_id_cliente, p_id_usuario, o_id_venta OUT, o_mensaje OUT)`
* `PROC_ADD_DETALLE_VENTA(p_id_venta, p_id_producto, p_cantidad, o_mensaje OUT)`
* `PROC_ANULAR_VENTA(p_id_venta, o_mensaje OUT)`
* `FUNC_GET_VENTAS()` → `SYS_REFCURSOR`
  * **Columnas:** `ID_VENTA`, `FECHA_VENTA`, `ESTADO`, `ID_CLIENTE`, `RUT_CLIENTE`, `CLIENTE`, `ID_USUARIO`, `VENDEDOR`, `CANTIDAD_ITEMS`, `TOTAL_VENTA`
* `FUNC_GET_DETALLE_VENTA(p_id_venta)` → `SYS_REFCURSOR`
  * **Columnas:** `ID_DETALLE_VENTA`, `ID_VENTA`, `ID_PRODUCTO`, `SKU`, `NOMBRE_PRODUCTO`, `CANTIDAD`, `PRECIO_UNITARIO`, `SUBTOTAL`

### Gestor 2: Agenda y Citas (`04_gestores_y_triggers_plsql.sql`)
* `PROC_RESERVAR_CITA(p_id_bloque, p_id_paciente, p_id_servicio, p_motivo, o_id_cita OUT, o_mensaje OUT)`
* `PROC_ACTUALIZAR_ESTADO_CITA(p_id_cita, p_estado, o_mensaje OUT)`
* `FUNC_GET_CITAS()` → `SYS_REFCURSOR`
  * **Columnas:** `ID_CITA`, `ID_BLOQUE`, `FECHA_HORA_INICIO`, `ID_VETERINARIO`, `VETERINARIO`, `ID_PACIENTE`, `NOMBRE_PACIENTE`, `NOMBRE_ESPECIE`, `DUENO`, `TELEFONO_DUENO`, `ID_SERVICIO`, `NOMBRE_SERVICIO`, `ESTADO`, `MOTIVO`
* `FUNC_GET_BLOQUES_DISPONIBLES(p_fecha DEFAULT NULL)` → `SYS_REFCURSOR`
  * **Columnas:** `ID_BLOQUE`, `ID_VETERINARIO`, `VETERINARIO`, `FECHA_HORA_INICIO`

### Gestor 3: Inventario (`05_productos_y_clinico_plsql.sql`)
* `PROC_INGRESAR_STOCK(p_id_producto, p_cantidad, o_mensaje OUT)`
* `PROC_AJUSTAR_STOCK(p_id_producto, p_nuevo_stock, p_nuevo_stock_minimo, o_mensaje OUT)`

### Gestor 4: Clínico (`05_productos_y_clinico_plsql.sql`)
* `PROC_CREAR_FICHA_CLINICA(p_id_cita, p_diagnostico, p_observaciones, o_id_ficha OUT, o_mensaje OUT)`
* `PROC_AGREGAR_RECETA(p_id_ficha, p_id_producto, p_indicaciones, o_id_receta OUT, o_mensaje OUT)`
* `FUNC_GET_HISTORIAL_PACIENTE(p_id_paciente)` → `SYS_REFCURSOR`
  * **Columnas:** `ID_CITA`, `FECHA_HORA_INICIO`, `VETERINARIO`, `NOMBRE_SERVICIO`, `ESTADO_CITA`, `MOTIVO`, `ID_FICHA`, `DIAGNOSTICO`, `OBSERVACIONES`, `CANTIDAD_RECETAS`

### Gestor 5: Vacunaciones y Refuerzos (`05_productos_y_clinico_plsql.sql`)
* `FUNC_ES_VETERINARIO(p_id_usuario)` → `NUMBER` (`1` = veterinario activo, `0` = no)
* `PROC_REGISTRAR_VACUNACION(p_id_paciente, p_id_producto, p_id_usuario, p_fecha_aplicacion, p_fecha_proxima_dosis, p_observaciones, o_id_vacunacion OUT, o_mensaje OUT)`
* `PROC_APLICAR_REFUERZO_VACUNA(p_id_vacunacion_anterior, p_id_usuario, p_fecha_aplicacion, p_fecha_proxima_dosis, p_observaciones, o_id_vacunacion_nueva OUT, o_mensaje OUT)`
* `FUNC_GET_VACUNACIONES(p_id_paciente DEFAULT NULL)` → `SYS_REFCURSOR`
  * **Columnas:** `ID_VACUNACION`, `ID_PACIENTE`, `NOMBRE_PACIENTE`, `NOMBRE_ESPECIE`, `DUENO`, `ID_PRODUCTO`, `VACUNA`, `ID_USUARIO`, `VETERINARIO`, `FECHA_APLICACION`, `FECHA_PROXIMA_DOSIS`, `OBSERVACIONES`, `ESTADO`

---

## 3. Reportes Dashboards (`06_reportes_y_triggers_plsql.sql`)

* `FUNC_REPORTE_VENTAS_MES(p_mes, p_anio)` → `SYS_REFCURSOR`
  * **Columnas:** `ID_VENTA`, `FECHA_VENTA`, `ESTADO`, `RUT_CLIENTE`, `CLIENTE`, `VENDEDOR`, `CANTIDAD_ITEMS`, `TOTAL_VENTA`
* `FUNC_REPORTE_STOCK_CRITICO()` → `SYS_REFCURSOR`
  * **Columnas:** `ID_PRODUCTO`, `SKU`, `NOMBRE_PRODUCTO`, `STOCK`, `STOCK_MINIMO`, `FALTANTE_SUGERIDO`, `ESTADO_STOCK`, `PROVEEDOR`, `TELEFONO`, `CORREO`
* `FUNC_REPORTE_VACUNAS_PENDIENTES(p_fecha_desde DEFAULT NULL, p_fecha_hasta DEFAULT NULL)` → `SYS_REFCURSOR`
  * **Columnas:** `ID_VACUNACION`, `FECHA_APLICACION`, `FECHA_PROXIMA_DOSIS`, `DIAS_RESTANTES`, `ESTADO_ALERTA`, `OBSERVACIONES`, `ID_PACIENTE`, `NOMBRE_PACIENTE`, `NOMBRE_ESPECIE`, `DUENO`, `TELEFONO`, `CORREO`, `VACUNA`
* `FUNC_REPORTE_RENDIMIENTO_STAFF(p_mes DEFAULT NULL, p_anio DEFAULT NULL)` → `SYS_REFCURSOR`
  * **Columnas:** `ID_USUARIO`, `STAFF`, `NOMBRE_ROL`, `VENTAS_REGISTRADAS`, `MONTO_VENDIDO`, `CITAS_ATENDIDAS`, `VACUNAS_APLICADAS`
* `FUNC_REPORTE_RESUMEN_DASHBOARD()` → `SYS_REFCURSOR`
  * **Columnas:** `CITAS_HOY`, `ATENCIONES_HOY`, `VACUNAS_PENDIENTES`, `VACUNAS_VENCIDAS`, `PRODUCTOS_CRITICOS`, `VENTAS_HOY_CANTIDAD`, `VENTAS_HOY_MONTO`

---

## 4. Triggers de Monitoreo y Control (`06_reportes_y_triggers_plsql.sql`)

1. `TRG_DESCONTAR_STOCK_VENTA`: valida estado de venta, producto activo y stock disponible antes de insertar en `DETALLE_VENTAS` y descuenta el stock automáticamente.
2. `TRG_VALIDAR_STOCK_MOD_DETALLE`: ajusta o devuelve stock si se modifica la cantidad o elimina una línea de una venta registrada.
3. `TRG_RESTAURAR_STOCK_VENTA_ANULADA`: restaura todo el stock de `DETALLE_VENTAS` al cambiar `VENTAS.ESTADO` a `'ANULADA'`.
4. `TRG_NORMALIZAR_CLIENTE`: limpia espacios, quita puntos y pasa a mayúsculas `RUT`, y pasa a minúsculas `CORREO` al insertar/actualizar `CLIENTES`.
5. `TRG_VALIDAR_VACUNACION_ROL`: protege `VACUNACIONES` validando rol de veterinario activo y que `FECHA_PROXIMA_DOSIS > FECHA_APLICACION`.

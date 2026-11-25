-- ============================================================================
-- ES3 | Veterinaria UCM | 07 - Datos Semilla (Seed Data)
-- Motor: Oracle Database 21c
-- Requiere: 01, 02, 03, 04, 05 y 06 ejecutados previamente
-- Responsable: Integrante 2 (Logica PL/SQL)
--
-- Caracteristicas:
--   - Idempotente: si los datos semilla ya existen (usuario 'admin'), no duplica.
--   - Pobla las 15 tablas usando explicitamente las 15 secuencias (SEQ_*.NEXTVAL).
--   - Compatible con todos los CHECK constraints y triggers (stock, RUT,
--     bloques :00/:30 y validacion de rol Veterinario en VACUNACIONES).
--
-- Credenciales de prueba (formato directo validado por PROC_VALIDAR_LOGIN):
--   - Administrador : usuario = 'admin'       | clave = 'admin123'
--   - Veterinario 1 : usuario = 'vet.carlos'  | clave = 'vet123'
--   - Veterinario 2 : usuario = 'vet.andrea'  | clave = 'vet123'
--   - Recepcionista : usuario = 'recep.sofia' | clave = 'recep123'
-- ============================================================================

DECLARE
    v_seed_existe   NUMBER := 0;

    -- 1. Roles
    v_rol_admin     ROLES.ID_ROL%TYPE;
    v_rol_vet       ROLES.ID_ROL%TYPE;
    v_rol_recep     ROLES.ID_ROL%TYPE;

    -- 2. Usuarios
    v_usr_admin     USUARIOS.ID_USUARIO%TYPE;
    v_usr_vet1      USUARIOS.ID_USUARIO%TYPE;
    v_usr_vet2      USUARIOS.ID_USUARIO%TYPE;
    v_usr_recep     USUARIOS.ID_USUARIO%TYPE;

    -- 3. Especies
    v_esp_canino    ESPECIES.ID_ESPECIE%TYPE;
    v_esp_felino    ESPECIES.ID_ESPECIE%TYPE;
    v_esp_exotico   ESPECIES.ID_ESPECIE%TYPE;
    v_esp_ave       ESPECIES.ID_ESPECIE%TYPE;

    -- 4. Clientes
    v_cli_juan      CLIENTES.ID_CLIENTE%TYPE;
    v_cli_maria     CLIENTES.ID_CLIENTE%TYPE;
    v_cli_pedro     CLIENTES.ID_CLIENTE%TYPE;
    v_cli_camila    CLIENTES.ID_CLIENTE%TYPE;
    v_cli_andres    CLIENTES.ID_CLIENTE%TYPE;

    -- 5. Pacientes
    v_pac_max       PACIENTES.ID_PACIENTE%TYPE;
    v_pac_luna      PACIENTES.ID_PACIENTE%TYPE;
    v_pac_rocky     PACIENTES.ID_PACIENTE%TYPE;
    v_pac_michi     PACIENTES.ID_PACIENTE%TYPE;
    v_pac_kira      PACIENTES.ID_PACIENTE%TYPE;
    v_pac_coco      PACIENTES.ID_PACIENTE%TYPE;

    -- 6. Proveedores
    v_prov_vetsalud PROVEEDORES.ID_PROVEEDOR%TYPE;
    v_prov_bioanim  PROVEEDORES.ID_PROVEEDOR%TYPE;
    v_prov_petcare  PROVEEDORES.ID_PROVEEDOR%TYPE;

    -- 7. Productos
    v_prod_rabia    PRODUCTOS.ID_PRODUCTO%TYPE;
    v_prod_octuple  PRODUCTOS.ID_PRODUCTO%TYPE;
    v_prod_triple   PRODUCTOS.ID_PRODUCTO%TYPE;
    v_prod_melox    PRODUCTOS.ID_PRODUCTO%TYPE;
    v_prod_amox     PRODUCTOS.ID_PRODUCTO%TYPE;
    v_prod_alim     PRODUCTOS.ID_PRODUCTO%TYPE;
    v_prod_pipeta   PRODUCTOS.ID_PRODUCTO%TYPE;
    v_prod_antip    PRODUCTOS.ID_PRODUCTO%TYPE;
    v_prod_gasa     PRODUCTOS.ID_PRODUCTO%TYPE;
    v_prod_shamp    PRODUCTOS.ID_PRODUCTO%TYPE;

    -- 8. Servicios
    v_srv_consulta  SERVICIOS.ID_SERVICIO%TYPE;
    v_srv_vacuna    SERVICIOS.ID_SERVICIO%TYPE;
    v_srv_control   SERVICIOS.ID_SERVICIO%TYPE;
    v_srv_dental    SERVICIOS.ID_SERVICIO%TYPE;
    v_srv_cirugia   SERVICIOS.ID_SERVICIO%TYPE;
    v_srv_despar    SERVICIOS.ID_SERVICIO%TYPE;
    v_srv_peluq     SERVICIOS.ID_SERVICIO%TYPE;

    -- 9. Bloques de Agenda
    v_blq_pasado1   BLOQUES_AGENDA.ID_BLOQUE%TYPE;
    v_blq_pasado2   BLOQUES_AGENDA.ID_BLOQUE%TYPE;
    v_blq_pasado3   BLOQUES_AGENDA.ID_BLOQUE%TYPE;
    v_blq_hoy1      BLOQUES_AGENDA.ID_BLOQUE%TYPE;
    v_blq_hoy2      BLOQUES_AGENDA.ID_BLOQUE%TYPE;
    v_blq_hoy3      BLOQUES_AGENDA.ID_BLOQUE%TYPE;
    v_blq_hoy4      BLOQUES_AGENDA.ID_BLOQUE%TYPE;
    v_blq_manana1   BLOQUES_AGENDA.ID_BLOQUE%TYPE;
    v_blq_manana2   BLOQUES_AGENDA.ID_BLOQUE%TYPE;
    v_blq_manana3   BLOQUES_AGENDA.ID_BLOQUE%TYPE;

    -- 10. Citas
    v_cita_1        CITAS.ID_CITA%TYPE;
    v_cita_2        CITAS.ID_CITA%TYPE;
    v_cita_3        CITAS.ID_CITA%TYPE;
    v_cita_4        CITAS.ID_CITA%TYPE;
    v_cita_5        CITAS.ID_CITA%TYPE;
    v_cita_6        CITAS.ID_CITA%TYPE;

    -- 11. Fichas Clinicas
    v_ficha_1       FICHAS_CLINICAS.ID_FICHA%TYPE;
    v_ficha_2       FICHAS_CLINICAS.ID_FICHA%TYPE;
    v_ficha_3       FICHAS_CLINICAS.ID_FICHA%TYPE;

    -- 12. Ventas
    v_venta_1       VENTAS.ID_VENTA%TYPE;
    v_venta_2       VENTAS.ID_VENTA%TYPE;
    v_venta_3       VENTAS.ID_VENTA%TYPE;
    v_venta_4       VENTAS.ID_VENTA%TYPE;
    v_venta_5       VENTAS.ID_VENTA%TYPE;

    -- Fechas base (alineadas exactamente a :00 y :30 para CK_BLOQUES_MEDIA_HORA)
    v_hoy           DATE := TRUNC(SYSDATE);
BEGIN
    -- Verificacion de idempotencia: evita duplicar si el seed ya se ejecuto
    SELECT COUNT(*)
      INTO v_seed_existe
      FROM USUARIOS
     WHERE UPPER(NOMBRE_USUARIO) = 'ADMIN';

    IF v_seed_existe > 0 THEN
        RETURN;
    END IF;

    -- ========================================================================
    -- 1. ROLES (3 roles base obligatorios)
    -- ========================================================================
    INSERT INTO ROLES (ID_ROL, NOMBRE_ROL)
    VALUES (SEQ_ROLES.NEXTVAL, 'Administrador')
    RETURNING ID_ROL INTO v_rol_admin;

    INSERT INTO ROLES (ID_ROL, NOMBRE_ROL)
    VALUES (SEQ_ROLES.NEXTVAL, 'Veterinario')
    RETURNING ID_ROL INTO v_rol_vet;

    INSERT INTO ROLES (ID_ROL, NOMBRE_ROL)
    VALUES (SEQ_ROLES.NEXTVAL, 'Recepcionista')
    RETURNING ID_ROL INTO v_rol_recep;

    -- ========================================================================
    -- 2. USUARIOS (coinciden con formato de CLAVE_HASH de PROC_VALIDAR_LOGIN)
    -- ========================================================================
    INSERT INTO USUARIOS (
        ID_USUARIO, ID_ROL, NOMBRE_USUARIO, CLAVE_HASH, NOMBRES, APELLIDOS, ACTIVO
    ) VALUES (
        SEQ_USUARIOS.NEXTVAL, v_rol_admin, 'admin', 'admin123', 'Roberto', 'Morales Diaz', 1
    ) RETURNING ID_USUARIO INTO v_usr_admin;

    INSERT INTO USUARIOS (
        ID_USUARIO, ID_ROL, NOMBRE_USUARIO, CLAVE_HASH, NOMBRES, APELLIDOS, ACTIVO
    ) VALUES (
        SEQ_USUARIOS.NEXTVAL, v_rol_vet, 'vet.carlos', 'vet123', 'Carlos', 'Mendoza Silva', 1
    ) RETURNING ID_USUARIO INTO v_usr_vet1;

    INSERT INTO USUARIOS (
        ID_USUARIO, ID_ROL, NOMBRE_USUARIO, CLAVE_HASH, NOMBRES, APELLIDOS, ACTIVO
    ) VALUES (
        SEQ_USUARIOS.NEXTVAL, v_rol_vet, 'vet.andrea', 'vet123', 'Andrea', 'Rojas Fuentes', 1
    ) RETURNING ID_USUARIO INTO v_usr_vet2;

    INSERT INTO USUARIOS (
        ID_USUARIO, ID_ROL, NOMBRE_USUARIO, CLAVE_HASH, NOMBRES, APELLIDOS, ACTIVO
    ) VALUES (
        SEQ_USUARIOS.NEXTVAL, v_rol_recep, 'recep.sofia', 'recep123', 'Sofia', 'Herrera Lagos', 1
    ) RETURNING ID_USUARIO INTO v_usr_recep;

    -- ========================================================================
    -- 3. ESPECIES
    -- ========================================================================
    INSERT INTO ESPECIES (ID_ESPECIE, NOMBRE_ESPECIE)
    VALUES (SEQ_ESPECIES.NEXTVAL, 'Canino')
    RETURNING ID_ESPECIE INTO v_esp_canino;

    INSERT INTO ESPECIES (ID_ESPECIE, NOMBRE_ESPECIE)
    VALUES (SEQ_ESPECIES.NEXTVAL, 'Felino')
    RETURNING ID_ESPECIE INTO v_esp_felino;

    INSERT INTO ESPECIES (ID_ESPECIE, NOMBRE_ESPECIE)
    VALUES (SEQ_ESPECIES.NEXTVAL, 'Exotico')
    RETURNING ID_ESPECIE INTO v_esp_exotico;

    INSERT INTO ESPECIES (ID_ESPECIE, NOMBRE_ESPECIE)
    VALUES (SEQ_ESPECIES.NEXTVAL, 'Ave')
    RETURNING ID_ESPECIE INTO v_esp_ave;

    -- ========================================================================
    -- 4. CLIENTES (RUT valido sin puntos: ^[0-9]{1,8}-[0-9K]$)
    -- ========================================================================
    INSERT INTO CLIENTES (ID_CLIENTE, RUT, NOMBRES, APELLIDOS, TELEFONO, CORREO)
    VALUES (SEQ_CLIENTES.NEXTVAL, '12345678-5', 'Juan', 'Perez Gonzalez', '+56987654321', 'juan.perez@mail.cl')
    RETURNING ID_CLIENTE INTO v_cli_juan;

    INSERT INTO CLIENTES (ID_CLIENTE, RUT, NOMBRES, APELLIDOS, TELEFONO, CORREO)
    VALUES (SEQ_CLIENTES.NEXTVAL, '15678901-2', 'Maria', 'Gomez Torres', '+56912345678', 'maria.gomez@mail.cl')
    RETURNING ID_CLIENTE INTO v_cli_maria;

    INSERT INTO CLIENTES (ID_CLIENTE, RUT, NOMBRES, APELLIDOS, TELEFONO, CORREO)
    VALUES (SEQ_CLIENTES.NEXTVAL, '18234567-K', 'Pedro', 'Soto Contreras', '+56976543210', 'pedro.soto@mail.cl')
    RETURNING ID_CLIENTE INTO v_cli_pedro;

    INSERT INTO CLIENTES (ID_CLIENTE, RUT, NOMBRES, APELLIDOS, TELEFONO, CORREO)
    VALUES (SEQ_CLIENTES.NEXTVAL, '14567890-3', 'Camila', 'Vargas Bravo', '+56965432198', 'camila.vargas@mail.cl')
    RETURNING ID_CLIENTE INTO v_cli_camila;

    INSERT INTO CLIENTES (ID_CLIENTE, RUT, NOMBRES, APELLIDOS, TELEFONO, CORREO)
    VALUES (SEQ_CLIENTES.NEXTVAL, '19876543-1', 'Andres', 'Munoz Paredes', '+56954321876', 'andres.munoz@mail.cl')
    RETURNING ID_CLIENTE INTO v_cli_andres;

    -- ========================================================================
    -- 5. PACIENTES
    -- ========================================================================
    INSERT INTO PACIENTES (ID_PACIENTE, ID_CLIENTE, ID_ESPECIE, NOMBRE_PACIENTE, FECHA_NACIMIENTO)
    VALUES (SEQ_PACIENTES.NEXTVAL, v_cli_juan, v_esp_canino, 'Max', DATE '2022-04-15')
    RETURNING ID_PACIENTE INTO v_pac_max;

    INSERT INTO PACIENTES (ID_PACIENTE, ID_CLIENTE, ID_ESPECIE, NOMBRE_PACIENTE, FECHA_NACIMIENTO)
    VALUES (SEQ_PACIENTES.NEXTVAL, v_cli_maria, v_esp_felino, 'Luna', DATE '2023-08-20')
    RETURNING ID_PACIENTE INTO v_pac_luna;

    INSERT INTO PACIENTES (ID_PACIENTE, ID_CLIENTE, ID_ESPECIE, NOMBRE_PACIENTE, FECHA_NACIMIENTO)
    VALUES (SEQ_PACIENTES.NEXTVAL, v_cli_pedro, v_esp_canino, 'Rocky', DATE '2021-01-10')
    RETURNING ID_PACIENTE INTO v_pac_rocky;

    INSERT INTO PACIENTES (ID_PACIENTE, ID_CLIENTE, ID_ESPECIE, NOMBRE_PACIENTE, FECHA_NACIMIENTO)
    VALUES (SEQ_PACIENTES.NEXTVAL, v_cli_camila, v_esp_felino, 'Michi', DATE '2024-02-05')
    RETURNING ID_PACIENTE INTO v_pac_michi;

    INSERT INTO PACIENTES (ID_PACIENTE, ID_CLIENTE, ID_ESPECIE, NOMBRE_PACIENTE, FECHA_NACIMIENTO)
    VALUES (SEQ_PACIENTES.NEXTVAL, v_cli_andres, v_esp_canino, 'Kira', DATE '2023-11-12')
    RETURNING ID_PACIENTE INTO v_pac_kira;

    INSERT INTO PACIENTES (ID_PACIENTE, ID_CLIENTE, ID_ESPECIE, NOMBRE_PACIENTE, FECHA_NACIMIENTO)
    VALUES (SEQ_PACIENTES.NEXTVAL, v_cli_juan, v_esp_exotico, 'Coco', DATE '2024-06-01')
    RETURNING ID_PACIENTE INTO v_pac_coco;

    -- ========================================================================
    -- 6. PROVEEDORES
    -- ========================================================================
    INSERT INTO PROVEEDORES (ID_PROVEEDOR, RAZON_SOCIAL, RUT, TELEFONO, CORREO)
    VALUES (SEQ_PROVEEDORES.NEXTVAL, 'Distribuidora VetSalud SpA', '76123456-7', '+56224567890', 'ventas@vetsalud.cl')
    RETURNING ID_PROVEEDOR INTO v_prov_vetsalud;

    INSERT INTO PROVEEDORES (ID_PROVEEDOR, RAZON_SOCIAL, RUT, TELEFONO, CORREO)
    VALUES (SEQ_PROVEEDORES.NEXTVAL, 'Laboratorio BioAnimal Chile Ltda.', '77654321-K', '+56229876543', 'pedidos@bioanimal.cl')
    RETURNING ID_PROVEEDOR INTO v_prov_bioanim;

    INSERT INTO PROVEEDORES (ID_PROVEEDOR, RAZON_SOCIAL, RUT, TELEFONO, CORREO)
    VALUES (SEQ_PROVEEDORES.NEXTVAL, 'Insumos PetCare Sur S.A.', '78901234-5', '+56712345678', 'contacto@petcaresur.cl')
    RETURNING ID_PROVEEDOR INTO v_prov_petcare;

    -- ========================================================================
    -- 7. PRODUCTOS (incluye vacunas, stock normal, stock critico, sin stock e inactivo)
    -- ========================================================================
    INSERT INTO PRODUCTOS (
        ID_PRODUCTO, ID_PROVEEDOR, SKU, NOMBRE_PRODUCTO, PRECIO_UNITARIO, STOCK, STOCK_MINIMO, ACTIVO
    ) VALUES (
        SEQ_PRODUCTOS.NEXTVAL, v_prov_bioanim, 'VAC-RAB-001', 'Vacuna Antirrabica 1ml', 12000, 28, 8, 1
    ) RETURNING ID_PRODUCTO INTO v_prod_rabia;

    INSERT INTO PRODUCTOS (
        ID_PRODUCTO, ID_PROVEEDOR, SKU, NOMBRE_PRODUCTO, PRECIO_UNITARIO, STOCK, STOCK_MINIMO, ACTIVO
    ) VALUES (
        SEQ_PRODUCTOS.NEXTVAL, v_prov_bioanim, 'VAC-OCT-002', 'Vacuna Octuple Canina', 16500, 22, 6, 1
    ) RETURNING ID_PRODUCTO INTO v_prod_octuple;

    INSERT INTO PRODUCTOS (
        ID_PRODUCTO, ID_PROVEEDOR, SKU, NOMBRE_PRODUCTO, PRECIO_UNITARIO, STOCK, STOCK_MINIMO, ACTIVO
    ) VALUES (
        SEQ_PRODUCTOS.NEXTVAL, v_prov_bioanim, 'VAC-TRI-003', 'Vacuna Triple Felina', 15000, 16, 5, 1
    ) RETURNING ID_PRODUCTO INTO v_prod_triple;

    INSERT INTO PRODUCTOS (
        ID_PRODUCTO, ID_PROVEEDOR, SKU, NOMBRE_PRODUCTO, PRECIO_UNITARIO, STOCK, STOCK_MINIMO, ACTIVO
    ) VALUES (
        SEQ_PRODUCTOS.NEXTVAL, v_prov_vetsalud, 'MED-MEL-004', 'Meloxicam 5mg Caja 10 comp.', 9500, 20, 5, 1
    ) RETURNING ID_PRODUCTO INTO v_prod_melox;

    INSERT INTO PRODUCTOS (
        ID_PRODUCTO, ID_PROVEEDOR, SKU, NOMBRE_PRODUCTO, PRECIO_UNITARIO, STOCK, STOCK_MINIMO, ACTIVO
    ) VALUES (
        SEQ_PRODUCTOS.NEXTVAL, v_prov_vetsalud, 'MED-AMO-005', 'Amoxicilina Veterinaria 250mg', 11000, 24, 6, 1
    ) RETURNING ID_PRODUCTO INTO v_prod_amox;

    INSERT INTO PRODUCTOS (
        ID_PRODUCTO, ID_PROVEEDOR, SKU, NOMBRE_PRODUCTO, PRECIO_UNITARIO, STOCK, STOCK_MINIMO, ACTIVO
    ) VALUES (
        SEQ_PRODUCTOS.NEXTVAL, v_prov_petcare, 'ALI-CAN-006', 'Alimento Premium Perro Adulto 3kg', 18900, 18, 4, 1
    ) RETURNING ID_PRODUCTO INTO v_prod_alim;

    -- Productos en stock critico (STOCK <= STOCK_MINIMO) para reporte y alertas
    INSERT INTO PRODUCTOS (
        ID_PRODUCTO, ID_PROVEEDOR, SKU, NOMBRE_PRODUCTO, PRECIO_UNITARIO, STOCK, STOCK_MINIMO, ACTIVO
    ) VALUES (
        SEQ_PRODUCTOS.NEXTVAL, v_prov_petcare, 'ANT-PIP-007', 'Pipeta Antipulgas Perro 10-20kg', 8500, 4, 8, 1
    ) RETURNING ID_PRODUCTO INTO v_prod_pipeta;

    INSERT INTO PRODUCTOS (
        ID_PRODUCTO, ID_PROVEEDOR, SKU, NOMBRE_PRODUCTO, PRECIO_UNITARIO, STOCK, STOCK_MINIMO, ACTIVO
    ) VALUES (
        SEQ_PRODUCTOS.NEXTVAL, v_prov_vetsalud, 'MED-ANT-008', 'Antiparasitario Interno Comprimido', 4500, 5, 10, 1
    ) RETURNING ID_PRODUCTO INTO v_prod_antip;

    INSERT INTO PRODUCTOS (
        ID_PRODUCTO, ID_PROVEEDOR, SKU, NOMBRE_PRODUCTO, PRECIO_UNITARIO, STOCK, STOCK_MINIMO, ACTIVO
    ) VALUES (
        SEQ_PRODUCTOS.NEXTVAL, v_prov_petcare, 'INS-GAS-009', 'Gasa Esteril Quirurgica Pack 10', 3200, 0, 5, 1
    ) RETURNING ID_PRODUCTO INTO v_prod_gasa;

    -- Producto inactivo (ACTIVO = 0) para verificar listado y reactivacion en mantenedor
    INSERT INTO PRODUCTOS (
        ID_PRODUCTO, ID_PROVEEDOR, SKU, NOMBRE_PRODUCTO, PRECIO_UNITARIO, STOCK, STOCK_MINIMO, ACTIVO
    ) VALUES (
        SEQ_PRODUCTOS.NEXTVAL, v_prov_petcare, 'DES-SHA-010', 'Shampoo Hipoalergenico Descontinuado', 7900, 5, 2, 0
    ) RETURNING ID_PRODUCTO INTO v_prod_shamp;

    -- ========================================================================
    -- 8. SERVICIOS
    -- ========================================================================
    INSERT INTO SERVICIOS (ID_SERVICIO, NOMBRE_SERVICIO, ACTIVO)
    VALUES (SEQ_SERVICIOS.NEXTVAL, 'Consulta General', 1)
    RETURNING ID_SERVICIO INTO v_srv_consulta;

    INSERT INTO SERVICIOS (ID_SERVICIO, NOMBRE_SERVICIO, ACTIVO)
    VALUES (SEQ_SERVICIOS.NEXTVAL, 'Vacunacion', 1)
    RETURNING ID_SERVICIO INTO v_srv_vacuna;

    INSERT INTO SERVICIOS (ID_SERVICIO, NOMBRE_SERVICIO, ACTIVO)
    VALUES (SEQ_SERVICIOS.NEXTVAL, 'Control Sano', 1)
    RETURNING ID_SERVICIO INTO v_srv_control;

    INSERT INTO SERVICIOS (ID_SERVICIO, NOMBRE_SERVICIO, ACTIVO)
    VALUES (SEQ_SERVICIOS.NEXTVAL, 'Revision Dental', 1)
    RETURNING ID_SERVICIO INTO v_srv_dental;

    INSERT INTO SERVICIOS (ID_SERVICIO, NOMBRE_SERVICIO, ACTIVO)
    VALUES (SEQ_SERVICIOS.NEXTVAL, 'Cirugia Menor', 1)
    RETURNING ID_SERVICIO INTO v_srv_cirugia;

    INSERT INTO SERVICIOS (ID_SERVICIO, NOMBRE_SERVICIO, ACTIVO)
    VALUES (SEQ_SERVICIOS.NEXTVAL, 'Desparasitacion', 1)
    RETURNING ID_SERVICIO INTO v_srv_despar;

    INSERT INTO SERVICIOS (ID_SERVICIO, NOMBRE_SERVICIO, ACTIVO)
    VALUES (SEQ_SERVICIOS.NEXTVAL, 'Peluqueria Canina', 0)
    RETURNING ID_SERVICIO INTO v_srv_peluq;

    -- ========================================================================
    -- 9. BLOQUES_AGENDA (horarios exactos :00 y :30 segun CK_BLOQUES_MEDIA_HORA)
    -- ========================================================================
    -- Bloques dias anteriores (para citas ya atendidas / canceladas)
    INSERT INTO BLOQUES_AGENDA (ID_BLOQUE, ID_VETERINARIO, FECHA_HORA_INICIO, HABILITADO)
    VALUES (SEQ_BLOQUES_AGENDA.NEXTVAL, v_usr_vet1, TRUNC(v_hoy - 3 + 10/24, 'HH24'), 1)
    RETURNING ID_BLOQUE INTO v_blq_pasado1;

    INSERT INTO BLOQUES_AGENDA (ID_BLOQUE, ID_VETERINARIO, FECHA_HORA_INICIO, HABILITADO)
    VALUES (SEQ_BLOQUES_AGENDA.NEXTVAL, v_usr_vet2, TRUNC(v_hoy - 2 + 11/24, 'HH24') + 1/48, 1)
    RETURNING ID_BLOQUE INTO v_blq_pasado2;

    INSERT INTO BLOQUES_AGENDA (ID_BLOQUE, ID_VETERINARIO, FECHA_HORA_INICIO, HABILITADO)
    VALUES (SEQ_BLOQUES_AGENDA.NEXTVAL, v_usr_vet1, TRUNC(v_hoy - 1 + 15/24, 'HH24'), 1)
    RETURNING ID_BLOQUE INTO v_blq_pasado3;

    -- Bloques de HOY (para KPIs CITAS_HOY y ATENCIONES_HOY)
    INSERT INTO BLOQUES_AGENDA (ID_BLOQUE, ID_VETERINARIO, FECHA_HORA_INICIO, HABILITADO)
    VALUES (SEQ_BLOQUES_AGENDA.NEXTVAL, v_usr_vet1, TRUNC(v_hoy + 9/24, 'HH24'), 1)
    RETURNING ID_BLOQUE INTO v_blq_hoy1;

    INSERT INTO BLOQUES_AGENDA (ID_BLOQUE, ID_VETERINARIO, FECHA_HORA_INICIO, HABILITADO)
    VALUES (SEQ_BLOQUES_AGENDA.NEXTVAL, v_usr_vet1, TRUNC(v_hoy + 10/24, 'HH24') + 1/48, 1)
    RETURNING ID_BLOQUE INTO v_blq_hoy2;

    INSERT INTO BLOQUES_AGENDA (ID_BLOQUE, ID_VETERINARIO, FECHA_HORA_INICIO, HABILITADO)
    VALUES (SEQ_BLOQUES_AGENDA.NEXTVAL, v_usr_vet2, TRUNC(v_hoy + 11/24, 'HH24') + 1/48, 1)
    RETURNING ID_BLOQUE INTO v_blq_hoy3;

    INSERT INTO BLOQUES_AGENDA (ID_BLOQUE, ID_VETERINARIO, FECHA_HORA_INICIO, HABILITADO)
    VALUES (SEQ_BLOQUES_AGENDA.NEXTVAL, v_usr_vet2, TRUNC(v_hoy + 16/24, 'HH24'), 1)
    RETURNING ID_BLOQUE INTO v_blq_hoy4;

    -- Bloques disponibles MANANA (para probar reservas nuevas en vivo)
    INSERT INTO BLOQUES_AGENDA (ID_BLOQUE, ID_VETERINARIO, FECHA_HORA_INICIO, HABILITADO)
    VALUES (SEQ_BLOQUES_AGENDA.NEXTVAL, v_usr_vet1, TRUNC(v_hoy + 1 + 9/24, 'HH24'), 1)
    RETURNING ID_BLOQUE INTO v_blq_manana1;

    INSERT INTO BLOQUES_AGENDA (ID_BLOQUE, ID_VETERINARIO, FECHA_HORA_INICIO, HABILITADO)
    VALUES (SEQ_BLOQUES_AGENDA.NEXTVAL, v_usr_vet1, TRUNC(v_hoy + 1 + 9/24, 'HH24') + 1/48, 1)
    RETURNING ID_BLOQUE INTO v_blq_manana2;

    INSERT INTO BLOQUES_AGENDA (ID_BLOQUE, ID_VETERINARIO, FECHA_HORA_INICIO, HABILITADO)
    VALUES (SEQ_BLOQUES_AGENDA.NEXTVAL, v_usr_vet2, TRUNC(v_hoy + 1 + 10/24, 'HH24'), 1)
    RETURNING ID_BLOQUE INTO v_blq_manana3;

    -- ========================================================================
    -- 10. CITAS
    -- ========================================================================
    INSERT INTO CITAS (ID_CITA, ID_BLOQUE, ID_PACIENTE, ID_SERVICIO, ESTADO, MOTIVO)
    VALUES (SEQ_CITAS.NEXTVAL, v_blq_pasado1, v_pac_max, v_srv_consulta, 'ATENDIDA', 'Control por decaimiento leve y fiebre')
    RETURNING ID_CITA INTO v_cita_1;

    INSERT INTO CITAS (ID_CITA, ID_BLOQUE, ID_PACIENTE, ID_SERVICIO, ESTADO, MOTIVO)
    VALUES (SEQ_CITAS.NEXTVAL, v_blq_pasado2, v_pac_luna, v_srv_control, 'ATENDIDA', 'Control sano semestral y revision de peso')
    RETURNING ID_CITA INTO v_cita_2;

    INSERT INTO CITAS (ID_CITA, ID_BLOQUE, ID_PACIENTE, ID_SERVICIO, ESTADO, MOTIVO)
    VALUES (SEQ_CITAS.NEXTVAL, v_blq_pasado3, v_pac_rocky, v_srv_dental, 'CANCELADA', 'Dueno reagendo por motivos laborales')
    RETURNING ID_CITA INTO v_cita_3;

    INSERT INTO CITAS (ID_CITA, ID_BLOQUE, ID_PACIENTE, ID_SERVICIO, ESTADO, MOTIVO)
    VALUES (SEQ_CITAS.NEXTVAL, v_blq_hoy1, v_pac_rocky, v_srv_dental, 'ATENDIDA', 'Limpieza y evaluacion dental')
    RETURNING ID_CITA INTO v_cita_4;

    INSERT INTO CITAS (ID_CITA, ID_BLOQUE, ID_PACIENTE, ID_SERVICIO, ESTADO, MOTIVO)
    VALUES (SEQ_CITAS.NEXTVAL, v_blq_hoy2, v_pac_max, v_srv_vacuna, 'RESERVADA', 'Aplicacion de refuerzo antirrabico')
    RETURNING ID_CITA INTO v_cita_5;

    INSERT INTO CITAS (ID_CITA, ID_BLOQUE, ID_PACIENTE, ID_SERVICIO, ESTADO, MOTIVO)
    VALUES (SEQ_CITAS.NEXTVAL, v_blq_hoy3, v_pac_kira, v_srv_despar, 'RESERVADA', 'Desparasitacion interna y externa')
    RETURNING ID_CITA INTO v_cita_6;

    -- ========================================================================
    -- 11. FICHAS_CLINICAS (para las 3 citas ATENDIDAS)
    -- ========================================================================
    INSERT INTO FICHAS_CLINICAS (ID_FICHA, ID_CITA, DIAGNOSTICO, OBSERVACIONES)
    VALUES (
        SEQ_FICHAS_CLINICAS.NEXTVAL, v_cita_1,
        'Infeccion respiratoria leve de vias altas',
        'Temperatura 39.2 C. Se indica antibiotico oral y control en 7 dias.'
    ) RETURNING ID_FICHA INTO v_ficha_1;

    INSERT INTO FICHAS_CLINICAS (ID_FICHA, ID_CITA, DIAGNOSTICO, OBSERVACIONES)
    VALUES (
        SEQ_FICHAS_CLINICAS.NEXTVAL, v_cita_2,
        'Paciente sano, peso estable 3.8 kg',
        'Pelaje y mucosas normales. Pendiente refuerzo de vacuna Triple Felina.'
    ) RETURNING ID_FICHA INTO v_ficha_2;

    INSERT INTO FICHAS_CLINICAS (ID_FICHA, ID_CITA, DIAGNOSTICO, OBSERVACIONES)
    VALUES (
        SEQ_FICHAS_CLINICAS.NEXTVAL, v_cita_4,
        'Gingivitis leve grado 1',
        'Se realiza profilaxis basica. Indicar antiinflamatorio por 3 dias.'
    ) RETURNING ID_FICHA INTO v_ficha_3;

    -- ========================================================================
    -- 12. RECETAS
    -- ========================================================================
    INSERT INTO RECETAS (ID_RECETA, ID_FICHA, ID_PRODUCTO, INDICACIONES)
    VALUES (SEQ_RECETAS.NEXTVAL, v_ficha_1, v_prod_amox, '1 comprimido cada 12 horas durante 7 dias junto con alimento.');

    INSERT INTO RECETAS (ID_RECETA, ID_FICHA, ID_PRODUCTO, INDICACIONES)
    VALUES (SEQ_RECETAS.NEXTVAL, v_ficha_1, v_prod_melox, 'Medio comprimido cada 24 horas por 3 dias si presenta fiebre.');

    INSERT INTO RECETAS (ID_RECETA, ID_FICHA, ID_PRODUCTO, INDICACIONES)
    VALUES (SEQ_RECETAS.NEXTVAL, v_ficha_2, v_prod_antip, '1 comprimido dosis unica y repetir en 3 meses.');

    INSERT INTO RECETAS (ID_RECETA, ID_FICHA, ID_PRODUCTO, INDICACIONES)
    VALUES (SEQ_RECETAS.NEXTVAL, v_ficha_3, v_prod_melox, '1 comprimido cada 24 horas por 3 dias despues de comer.');

    -- ========================================================================
    -- 13 & 14. VENTAS Y DETALLE_VENTAS
    -- Nota: TRG_DESCONTAR_STOCK_VENTA descuenta el stock automaticamente y
    --       TRG_RESTAURAR_STOCK_VENTA_ANULADA lo restaura al anular v_venta_5.
    -- ========================================================================
    -- Venta 1: hace 2 dias (REGISTRADA)
    INSERT INTO VENTAS (ID_VENTA, ID_USUARIO, ID_CLIENTE, FECHA_VENTA, ESTADO)
    VALUES (SEQ_VENTAS.NEXTVAL, v_usr_recep, v_cli_juan, SYSTIMESTAMP - INTERVAL '2' DAY, 'REGISTRADA')
    RETURNING ID_VENTA INTO v_venta_1;

    INSERT INTO DETALLE_VENTAS (ID_DETALLE_VENTA, ID_VENTA, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO)
    VALUES (SEQ_DETALLE_VENTAS.NEXTVAL, v_venta_1, v_prod_alim, 2, 18900);

    INSERT INTO DETALLE_VENTAS (ID_DETALLE_VENTA, ID_VENTA, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO)
    VALUES (SEQ_DETALLE_VENTAS.NEXTVAL, v_venta_1, v_prod_amox, 1, 11000);

    -- Venta 2: ayer (REGISTRADA)
    INSERT INTO VENTAS (ID_VENTA, ID_USUARIO, ID_CLIENTE, FECHA_VENTA, ESTADO)
    VALUES (SEQ_VENTAS.NEXTVAL, v_usr_vet1, v_cli_maria, SYSTIMESTAMP - INTERVAL '1' DAY, 'REGISTRADA')
    RETURNING ID_VENTA INTO v_venta_2;

    INSERT INTO DETALLE_VENTAS (ID_DETALLE_VENTA, ID_VENTA, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO)
    VALUES (SEQ_DETALLE_VENTAS.NEXTVAL, v_venta_2, v_prod_antip, 2, 4500);

    INSERT INTO DETALLE_VENTAS (ID_DETALLE_VENTA, ID_VENTA, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO)
    VALUES (SEQ_DETALLE_VENTAS.NEXTVAL, v_venta_2, v_prod_melox, 1, 9500);

    -- Venta 3: HOY (REGISTRADA, con cliente)
    INSERT INTO VENTAS (ID_VENTA, ID_USUARIO, ID_CLIENTE, FECHA_VENTA, ESTADO)
    VALUES (SEQ_VENTAS.NEXTVAL, v_usr_recep, v_cli_pedro, SYSTIMESTAMP, 'REGISTRADA')
    RETURNING ID_VENTA INTO v_venta_3;

    INSERT INTO DETALLE_VENTAS (ID_DETALLE_VENTA, ID_VENTA, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO)
    VALUES (SEQ_DETALLE_VENTAS.NEXTVAL, v_venta_3, v_prod_alim, 1, 18900);

    INSERT INTO DETALLE_VENTAS (ID_DETALLE_VENTA, ID_VENTA, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO)
    VALUES (SEQ_DETALLE_VENTAS.NEXTVAL, v_venta_3, v_prod_pipeta, 2, 8500);

    -- Venta 4: HOY (REGISTRADA, Consumidor Final -> ID_CLIENTE = NULL)
    INSERT INTO VENTAS (ID_VENTA, ID_USUARIO, ID_CLIENTE, FECHA_VENTA, ESTADO)
    VALUES (SEQ_VENTAS.NEXTVAL, v_usr_admin, NULL, SYSTIMESTAMP, 'REGISTRADA')
    RETURNING ID_VENTA INTO v_venta_4;

    INSERT INTO DETALLE_VENTAS (ID_DETALLE_VENTA, ID_VENTA, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO)
    VALUES (SEQ_DETALLE_VENTAS.NEXTVAL, v_venta_4, v_prod_melox, 2, 9500);

    -- Venta 5: ANULADA (prueba en vivo del trigger TRG_RESTAURAR_STOCK_VENTA_ANULADA)
    INSERT INTO VENTAS (ID_VENTA, ID_USUARIO, ID_CLIENTE, FECHA_VENTA, ESTADO)
    VALUES (SEQ_VENTAS.NEXTVAL, v_usr_recep, v_cli_camila, SYSTIMESTAMP - INTERVAL '1' DAY, 'REGISTRADA')
    RETURNING ID_VENTA INTO v_venta_5;

    INSERT INTO DETALLE_VENTAS (ID_DETALLE_VENTA, ID_VENTA, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO)
    VALUES (SEQ_DETALLE_VENTAS.NEXTVAL, v_venta_5, v_prod_alim, 1, 18900);

    UPDATE VENTAS
       SET ESTADO = 'ANULADA'
     WHERE ID_VENTA = v_venta_5;

    -- ========================================================================
    -- 15. VACUNACIONES (validadas por TRG_VALIDAR_VACUNACION_ROL)
    -- Incluye: 1 vencida, 1 para hoy, 2 proximas y 1 ya aplicada (ESTADO = 1)
    -- ========================================================================
    -- Vencida (ESTADO = 0, FECHA_PROXIMA_DOSIS < HOY)
    INSERT INTO VACUNACIONES (
        ID_VACUNACION, ID_PACIENTE, ID_PRODUCTO, ID_USUARIO,
        FECHA_APLICACION, FECHA_PROXIMA_DOSIS, OBSERVACIONES, ESTADO
    ) VALUES (
        SEQ_VACUNACIONES.NEXTVAL, v_pac_luna, v_prod_triple, v_usr_vet2,
        v_hoy - 45, v_hoy - 10, 'Primera dosis sin reacciones adversas. Refuerzo vencido.', 0
    );

    -- Vence HOY (ESTADO = 0, FECHA_PROXIMA_DOSIS = HOY)
    INSERT INTO VACUNACIONES (
        ID_VACUNACION, ID_PACIENTE, ID_PRODUCTO, ID_USUARIO,
        FECHA_APLICACION, FECHA_PROXIMA_DOSIS, OBSERVACIONES, ESTADO
    ) VALUES (
        SEQ_VACUNACIONES.NEXTVAL, v_pac_max, v_prod_rabia, v_usr_vet1,
        v_hoy - 30, v_hoy, 'Refuerzo anual programado para hoy.', 0
    );

    -- Proxima en 5 dias (ESTADO = 0)
    INSERT INTO VACUNACIONES (
        ID_VACUNACION, ID_PACIENTE, ID_PRODUCTO, ID_USUARIO,
        FECHA_APLICACION, FECHA_PROXIMA_DOSIS, OBSERVACIONES, ESTADO
    ) VALUES (
        SEQ_VACUNACIONES.NEXTVAL, v_pac_rocky, v_prod_octuple, v_usr_vet1,
        v_hoy - 25, v_hoy + 5, 'Tolero bien la dosis inicial. Citar para refuerzo.', 0
    );

    -- Proxima en 20 dias (ESTADO = 0, util para filtro de periodo en reporte)
    INSERT INTO VACUNACIONES (
        ID_VACUNACION, ID_PACIENTE, ID_PRODUCTO, ID_USUARIO,
        FECHA_APLICACION, FECHA_PROXIMA_DOSIS, OBSERVACIONES, ESTADO
    ) VALUES (
        SEQ_VACUNACIONES.NEXTVAL, v_pac_kira, v_prod_rabia, v_usr_vet2,
        v_hoy - 10, v_hoy + 20, 'Aplicacion en extremidad posterior derecha.', 0
    );

    -- Ya reforzada / aplicada (ESTADO = 1 -> no aparece en alertas pendientes)
    INSERT INTO VACUNACIONES (
        ID_VACUNACION, ID_PACIENTE, ID_PRODUCTO, ID_USUARIO,
        FECHA_APLICACION, FECHA_PROXIMA_DOSIS, OBSERVACIONES, ESTADO
    ) VALUES (
        SEQ_VACUNACIONES.NEXTVAL, v_pac_michi, v_prod_triple, v_usr_vet2,
        v_hoy - 90, v_hoy - 60, 'Esquema completado y refuerzo ya aplicado.', 1
    );

    COMMIT;
END;
/

-- ============================================================================
-- VERIFICACION RAPIDA DE CARGA Y COMPILACION (OPCIONAL AL EJECUTAR CON F5)
-- ============================================================================
SELECT 'ROLES' AS TABLA, COUNT(*) AS REGISTROS FROM ROLES
UNION ALL SELECT 'USUARIOS', COUNT(*) FROM USUARIOS
UNION ALL SELECT 'ESPECIES', COUNT(*) FROM ESPECIES
UNION ALL SELECT 'CLIENTES', COUNT(*) FROM CLIENTES
UNION ALL SELECT 'PACIENTES', COUNT(*) FROM PACIENTES
UNION ALL SELECT 'PROVEEDORES', COUNT(*) FROM PROVEEDORES
UNION ALL SELECT 'PRODUCTOS', COUNT(*) FROM PRODUCTOS
UNION ALL SELECT 'SERVICIOS', COUNT(*) FROM SERVICIOS
UNION ALL SELECT 'BLOQUES_AGENDA', COUNT(*) FROM BLOQUES_AGENDA
UNION ALL SELECT 'CITAS', COUNT(*) FROM CITAS
UNION ALL SELECT 'FICHAS_CLINICAS', COUNT(*) FROM FICHAS_CLINICAS
UNION ALL SELECT 'RECETAS', COUNT(*) FROM RECETAS
UNION ALL SELECT 'VENTAS', COUNT(*) FROM VENTAS
UNION ALL SELECT 'DETALLE_VENTAS', COUNT(*) FROM DETALLE_VENTAS
UNION ALL SELECT 'VACUNACIONES', COUNT(*) FROM VACUNACIONES;

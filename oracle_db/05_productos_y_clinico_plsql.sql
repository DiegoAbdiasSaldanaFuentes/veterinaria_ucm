-- ============================================================================
-- ES3 | Veterinaria UCM | 05 - Gestores: Inventario, Clinico y Vacunaciones
-- Motor: Oracle Database 21c
-- Requiere: 01_esquema_base_es3.sql, 02_esquema_operativo_es3.sql, 03 y 04
-- Responsable: Integrante 2 (Logica PL/SQL)
-- ============================================================================

-- ============================================================================
-- GESTOR 3: INVENTARIO (INGRESO Y AJUSTE DE STOCK)
-- ============================================================================

CREATE OR REPLACE PROCEDURE PROC_INGRESAR_STOCK (
    p_id_producto IN  PRODUCTOS.ID_PRODUCTO%TYPE,
    p_cantidad    IN  PRODUCTOS.STOCK%TYPE,
    o_mensaje     OUT VARCHAR2
) IS
    CURSOR c_prod IS
        SELECT NOMBRE_PRODUCTO, STOCK, ACTIVO
          FROM PRODUCTOS
         WHERE ID_PRODUCTO = p_id_producto
           FOR UPDATE;

    v_prod c_prod%ROWTYPE;
BEGIN
    IF p_cantidad IS NULL OR p_cantidad <= 0 THEN
        o_mensaje := 'ERROR: La cantidad a ingresar debe ser mayor a cero.';
        RETURN;
    END IF;

    OPEN c_prod;
    FETCH c_prod INTO v_prod;
    IF c_prod%NOTFOUND THEN
        CLOSE c_prod;
        ROLLBACK;
        o_mensaje := 'ERROR: Producto no encontrado.';
        RETURN;
    END IF;
    CLOSE c_prod;

    IF v_prod.ACTIVO = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se puede ingresar stock a un producto inactivo.';
        RETURN;
    END IF;

    UPDATE PRODUCTOS
       SET STOCK = STOCK + p_cantidad
     WHERE ID_PRODUCTO = p_id_producto;

    COMMIT;
    o_mensaje := 'OK: Stock actualizado correctamente para ' || v_prod.NOMBRE_PRODUCTO ||
                 ' (nuevo stock: ' || (v_prod.STOCK + p_cantidad) || ').';
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al ingresar stock: ' || SQLERRM;
END PROC_INGRESAR_STOCK;
/

CREATE OR REPLACE PROCEDURE PROC_AJUSTAR_STOCK (
    p_id_producto        IN  PRODUCTOS.ID_PRODUCTO%TYPE,
    p_nuevo_stock        IN  PRODUCTOS.STOCK%TYPE,
    p_nuevo_stock_minimo IN  PRODUCTOS.STOCK_MINIMO%TYPE,
    o_mensaje            OUT VARCHAR2
) IS
BEGIN
    IF p_nuevo_stock IS NULL OR p_nuevo_stock < 0 OR
       p_nuevo_stock_minimo IS NULL OR p_nuevo_stock_minimo < 0 THEN
        o_mensaje := 'ERROR: Stock y stock minimo deben ser mayores o iguales a cero.';
        RETURN;
    END IF;

    LOCK TABLE PRODUCTOS IN ROW EXCLUSIVE MODE;

    UPDATE PRODUCTOS
       SET STOCK        = p_nuevo_stock,
           STOCK_MINIMO = p_nuevo_stock_minimo
     WHERE ID_PRODUCTO = p_id_producto;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: Producto no encontrado.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Ajuste de inventario aplicado correctamente.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al ajustar stock: ' || SQLERRM;
END PROC_AJUSTAR_STOCK;
/

-- ============================================================================
-- GESTOR 4: GESTION CLINICA (FICHAS CLINICAS, RECETAS E HISTORIAL)
-- ============================================================================

CREATE OR REPLACE PROCEDURE PROC_CREAR_FICHA_CLINICA (
    p_id_cita       IN  FICHAS_CLINICAS.ID_CITA%TYPE,
    p_diagnostico   IN  FICHAS_CLINICAS.DIAGNOSTICO%TYPE,
    p_observaciones IN  FICHAS_CLINICAS.OBSERVACIONES%TYPE,
    o_id_ficha      OUT FICHAS_CLINICAS.ID_FICHA%TYPE,
    o_mensaje       OUT VARCHAR2
) IS
    CURSOR c_cita IS
        SELECT ESTADO
          FROM CITAS
         WHERE ID_CITA = p_id_cita
           FOR UPDATE;

    v_estado_cita CITAS.ESTADO%TYPE;
BEGIN
    OPEN c_cita;
    FETCH c_cita INTO v_estado_cita;
    IF c_cita%NOTFOUND THEN
        CLOSE c_cita;
        ROLLBACK;
        o_id_ficha := NULL;
        o_mensaje := 'ERROR: La cita especificada no existe.';
        RETURN;
    END IF;
    CLOSE c_cita;

    IF v_estado_cita = 'CANCELADA' THEN
        ROLLBACK;
        o_id_ficha := NULL;
        o_mensaje := 'ERROR: No se puede crear una ficha clinica para una cita cancelada.';
        RETURN;
    END IF;

    INSERT INTO FICHAS_CLINICAS (ID_FICHA, ID_CITA, DIAGNOSTICO, OBSERVACIONES)
    VALUES (SEQ_FICHAS_CLINICAS.NEXTVAL, p_id_cita, TRIM(p_diagnostico), TRIM(p_observaciones))
    RETURNING ID_FICHA INTO o_id_ficha;

    UPDATE CITAS
       SET ESTADO = 'ATENDIDA'
     WHERE ID_CITA = p_id_cita;

    COMMIT;
    o_mensaje := 'OK: Ficha clinica registrada y cita marcada como ATENDIDA.';
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_id_ficha := NULL;
        o_mensaje := 'ERROR: Esta cita ya tiene una ficha clinica asociada.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_id_ficha := NULL;
        o_mensaje := 'ERROR al registrar ficha clinica: ' || SQLERRM;
END PROC_CREAR_FICHA_CLINICA;
/

CREATE OR REPLACE PROCEDURE PROC_AGREGAR_RECETA (
    p_id_ficha     IN  RECETAS.ID_FICHA%TYPE,
    p_id_producto  IN  RECETAS.ID_PRODUCTO%TYPE,
    p_indicaciones IN  RECETAS.INDICACIONES%TYPE,
    o_id_receta    OUT RECETAS.ID_RECETA%TYPE,
    o_mensaje      OUT VARCHAR2
) IS
    v_prod_activo NUMBER;
    e_fk_parent   EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_parent, -2291);
BEGIN
    IF TRIM(p_indicaciones) IS NULL THEN
        o_id_receta := NULL;
        o_mensaje := 'ERROR: Las indicaciones de la receta son obligatorias.';
        RETURN;
    END IF;

    SELECT COUNT(*)
      INTO v_prod_activo
      FROM PRODUCTOS
     WHERE ID_PRODUCTO = p_id_producto
       AND ACTIVO = 1;

    IF v_prod_activo = 0 THEN
        o_id_receta := NULL;
        o_mensaje := 'ERROR: El producto/medicamento no existe o esta inactivo.';
        RETURN;
    END IF;

    LOCK TABLE RECETAS IN ROW EXCLUSIVE MODE;

    INSERT INTO RECETAS (ID_RECETA, ID_FICHA, ID_PRODUCTO, INDICACIONES)
    VALUES (SEQ_RECETAS.NEXTVAL, p_id_ficha, p_id_producto, TRIM(p_indicaciones))
    RETURNING ID_RECETA INTO o_id_receta;

    COMMIT;
    o_mensaje := 'OK: Receta agregada correctamente.';
EXCEPTION
    WHEN e_fk_parent THEN
        ROLLBACK;
        o_id_receta := NULL;
        o_mensaje := 'ERROR: La ficha clinica especificada no existe.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_id_receta := NULL;
        o_mensaje := 'ERROR al agregar receta: ' || SQLERRM;
END PROC_AGREGAR_RECETA;
/

CREATE OR REPLACE FUNCTION FUNC_GET_HISTORIAL_PACIENTE (
    p_id_paciente IN PACIENTES.ID_PACIENTE%TYPE
) RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT c.ID_CITA,
               b.FECHA_HORA_INICIO,
               u.NOMBRES || ' ' || u.APELLIDOS AS VETERINARIO,
               s.NOMBRE_SERVICIO,
               c.ESTADO AS ESTADO_CITA,
               c.MOTIVO,
               f.ID_FICHA,
               f.DIAGNOSTICO,
               f.OBSERVACIONES,
               (SELECT COUNT(*)
                  FROM RECETAS r
                 WHERE r.ID_FICHA = f.ID_FICHA) AS CANTIDAD_RECETAS
          FROM CITAS c
          JOIN BLOQUES_AGENDA b ON c.ID_BLOQUE = b.ID_BLOQUE
          JOIN USUARIOS u ON b.ID_VETERINARIO = u.ID_USUARIO
          JOIN SERVICIOS s ON c.ID_SERVICIO = s.ID_SERVICIO
          LEFT JOIN FICHAS_CLINICAS f ON c.ID_CITA = f.ID_CITA
         WHERE c.ID_PACIENTE = p_id_paciente
         ORDER BY b.FECHA_HORA_INICIO DESC;

    RETURN v_cursor;
END FUNC_GET_HISTORIAL_PACIENTE;
/

-- ============================================================================
-- GESTOR 5: VACUNACIONES Y REFUERZOS (CONTRATO INTEGRANTE 1)
-- Reglas:
--   - Validar rol de veterinario en ID_USUARIO
--   - Validar FECHA_PROXIMA_DOSIS > FECHA_APLICACION
--   - Al aplicar refuerzo: registrar nueva dosis y marcar anterior ESTADO = 1
--     en la misma transaccion
-- ============================================================================

CREATE OR REPLACE FUNCTION FUNC_ES_VETERINARIO (
    p_id_usuario IN USUARIOS.ID_USUARIO%TYPE
) RETURN NUMBER
IS
    v_cnt NUMBER;
BEGIN
    SELECT COUNT(*)
      INTO v_cnt
      FROM USUARIOS u
      JOIN ROLES r ON u.ID_ROL = r.ID_ROL
     WHERE u.ID_USUARIO = p_id_usuario
       AND u.ACTIVO = 1
       AND UPPER(r.NOMBRE_ROL) LIKE '%VETERINARI%';

    IF v_cnt > 0 THEN
        RETURN 1;
    ELSE
        RETURN 0;
    END IF;
END FUNC_ES_VETERINARIO;
/

CREATE OR REPLACE PROCEDURE PROC_REGISTRAR_VACUNACION (
    p_id_paciente         IN  VACUNACIONES.ID_PACIENTE%TYPE,
    p_id_producto         IN  VACUNACIONES.ID_PRODUCTO%TYPE,
    p_id_usuario          IN  VACUNACIONES.ID_USUARIO%TYPE,
    p_fecha_aplicacion    IN  VACUNACIONES.FECHA_APLICACION%TYPE,
    p_fecha_proxima_dosis IN  VACUNACIONES.FECHA_PROXIMA_DOSIS%TYPE,
    p_observaciones       IN  VACUNACIONES.OBSERVACIONES%TYPE,
    o_id_vacunacion       OUT VACUNACIONES.ID_VACUNACION%TYPE,
    o_mensaje             OUT VARCHAR2
) IS
    v_prod_activo NUMBER;
    e_fk_parent   EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_parent, -2291);
BEGIN
    IF FUNC_ES_VETERINARIO(p_id_usuario) = 0 THEN
        o_id_vacunacion := NULL;
        o_mensaje := 'ERROR: Solo un usuario activo con rol de Veterinario puede registrar vacunaciones.';
        RETURN;
    END IF;

    IF p_fecha_aplicacion IS NULL OR p_fecha_proxima_dosis IS NULL OR
       p_fecha_proxima_dosis <= p_fecha_aplicacion THEN
        o_id_vacunacion := NULL;
        o_mensaje := 'ERROR: La fecha de proxima dosis debe ser posterior a la fecha de aplicacion.';
        RETURN;
    END IF;

    SELECT COUNT(*)
      INTO v_prod_activo
      FROM PRODUCTOS
     WHERE ID_PRODUCTO = p_id_producto
       AND ACTIVO = 1;

    IF v_prod_activo = 0 THEN
        o_id_vacunacion := NULL;
        o_mensaje := 'ERROR: La vacuna (producto) no existe o se encuentra inactiva.';
        RETURN;
    END IF;

    LOCK TABLE VACUNACIONES IN ROW EXCLUSIVE MODE;

    INSERT INTO VACUNACIONES (
        ID_VACUNACION, ID_PACIENTE, ID_PRODUCTO, ID_USUARIO,
        FECHA_APLICACION, FECHA_PROXIMA_DOSIS, OBSERVACIONES, ESTADO
    )
    VALUES (
        SEQ_VACUNACIONES.NEXTVAL, p_id_paciente, p_id_producto, p_id_usuario,
        p_fecha_aplicacion, p_fecha_proxima_dosis, TRIM(p_observaciones), 0
    )
    RETURNING ID_VACUNACION INTO o_id_vacunacion;

    COMMIT;
    o_mensaje := 'OK: Vacunacion registrada correctamente.';
EXCEPTION
    WHEN e_fk_parent THEN
        ROLLBACK;
        o_id_vacunacion := NULL;
        o_mensaje := 'ERROR: Paciente, producto o usuario no encontrado.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_id_vacunacion := NULL;
        o_mensaje := 'ERROR al registrar vacunacion: ' || SQLERRM;
END PROC_REGISTRAR_VACUNACION;
/

CREATE OR REPLACE PROCEDURE PROC_APLICAR_REFUERZO_VACUNA (
    p_id_vacunacion_anterior IN  VACUNACIONES.ID_VACUNACION%TYPE,
    p_id_usuario             IN  VACUNACIONES.ID_USUARIO%TYPE,
    p_fecha_aplicacion       IN  VACUNACIONES.FECHA_APLICACION%TYPE,
    p_fecha_proxima_dosis    IN  VACUNACIONES.FECHA_PROXIMA_DOSIS%TYPE,
    p_observaciones          IN  VACUNACIONES.OBSERVACIONES%TYPE,
    o_id_vacunacion_nueva    OUT VACUNACIONES.ID_VACUNACION%TYPE,
    o_mensaje                OUT VARCHAR2
) IS
    CURSOR c_vac_anterior IS
        SELECT ID_PACIENTE, ID_PRODUCTO, ESTADO
          FROM VACUNACIONES
         WHERE ID_VACUNACION = p_id_vacunacion_anterior
           FOR UPDATE;

    v_ant c_vac_anterior%ROWTYPE;
BEGIN
    IF FUNC_ES_VETERINARIO(p_id_usuario) = 0 THEN
        o_id_vacunacion_nueva := NULL;
        o_mensaje := 'ERROR: Solo un usuario activo con rol de Veterinario puede aplicar refuerzos.';
        RETURN;
    END IF;

    IF p_fecha_aplicacion IS NULL OR p_fecha_proxima_dosis IS NULL OR
       p_fecha_proxima_dosis <= p_fecha_aplicacion THEN
        o_id_vacunacion_nueva := NULL;
        o_mensaje := 'ERROR: La fecha de proxima dosis debe ser posterior a la fecha de aplicacion.';
        RETURN;
    END IF;

    OPEN c_vac_anterior;
    FETCH c_vac_anterior INTO v_ant;
    IF c_vac_anterior%NOTFOUND THEN
        CLOSE c_vac_anterior;
        ROLLBACK;
        o_id_vacunacion_nueva := NULL;
        o_mensaje := 'ERROR: No se encontro el registro de vacunacion anterior.';
        RETURN;
    END IF;
    CLOSE c_vac_anterior;

    IF v_ant.ESTADO = 1 THEN
        ROLLBACK;
        o_id_vacunacion_nueva := NULL;
        o_mensaje := 'ERROR: El refuerzo de esa vacunacion ya fue marcado como aplicado.';
        RETURN;
    END IF;

    -- Misma transaccion: marcar anterior como aplicado (1) y registrar nueva dosis (0)
    UPDATE VACUNACIONES
       SET ESTADO = 1
     WHERE ID_VACUNACION = p_id_vacunacion_anterior;

    INSERT INTO VACUNACIONES (
        ID_VACUNACION, ID_PACIENTE, ID_PRODUCTO, ID_USUARIO,
        FECHA_APLICACION, FECHA_PROXIMA_DOSIS, OBSERVACIONES, ESTADO
    )
    VALUES (
        SEQ_VACUNACIONES.NEXTVAL, v_ant.ID_PACIENTE, v_ant.ID_PRODUCTO, p_id_usuario,
        p_fecha_aplicacion, p_fecha_proxima_dosis, TRIM(p_observaciones), 0
    )
    RETURNING ID_VACUNACION INTO o_id_vacunacion_nueva;

    COMMIT;
    o_mensaje := 'OK: Refuerzo aplicado y nueva dosis programada en la misma transaccion.';
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        o_id_vacunacion_nueva := NULL;
        o_mensaje := 'ERROR al aplicar refuerzo de vacuna: ' || SQLERRM;
END PROC_APLICAR_REFUERZO_VACUNA;
/

CREATE OR REPLACE FUNCTION FUNC_GET_VACUNACIONES (
    p_id_paciente IN VACUNACIONES.ID_PACIENTE%TYPE DEFAULT NULL
) RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT va.ID_VACUNACION,
               va.ID_PACIENTE,
               pa.NOMBRE_PACIENTE,
               es.NOMBRE_ESPECIE,
               cl.NOMBRES || ' ' || cl.APELLIDOS AS DUENO,
               va.ID_PRODUCTO,
               pr.NOMBRE_PRODUCTO AS VACUNA,
               va.ID_USUARIO,
               u.NOMBRES || ' ' || u.APELLIDOS AS VETERINARIO,
               va.FECHA_APLICACION,
               va.FECHA_PROXIMA_DOSIS,
               va.OBSERVACIONES,
               va.ESTADO
          FROM VACUNACIONES va
          JOIN PACIENTES pa ON va.ID_PACIENTE = pa.ID_PACIENTE
          JOIN ESPECIES es ON pa.ID_ESPECIE = es.ID_ESPECIE
          JOIN CLIENTES cl ON pa.ID_CLIENTE = cl.ID_CLIENTE
          JOIN PRODUCTOS pr ON va.ID_PRODUCTO = pr.ID_PRODUCTO
          JOIN USUARIOS u ON va.ID_USUARIO = u.ID_USUARIO
         WHERE (p_id_paciente IS NULL OR va.ID_PACIENTE = p_id_paciente)
         ORDER BY va.FECHA_APLICACION DESC, va.ID_VACUNACION DESC;

    RETURN v_cursor;
END FUNC_GET_VACUNACIONES;
/

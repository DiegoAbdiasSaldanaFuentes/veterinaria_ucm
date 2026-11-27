-- ============================================================================
-- ES3 | Veterinaria UCM | 04 - Gestores Transaccionales: Ventas (POS) y Citas
-- Motor: Oracle Database 21c
-- Requiere: 01_esquema_base_es3.sql, 02_esquema_operativo_es3.sql y 03
-- Nota: Los triggers de stock asociados se definen en 06_reportes_y_triggers_plsql.sql
-- Responsable: Integrante 2 (Logica PL/SQL)
-- ============================================================================

-- ============================================================================
-- GESTOR 1: PUNTO DE VENTA (VENTAS Y DETALLE_VENTAS)
-- ============================================================================

CREATE OR REPLACE PROCEDURE PROC_CREAR_VENTA (
    p_id_cliente IN  VENTAS.ID_CLIENTE%TYPE,
    p_id_usuario IN  VENTAS.ID_USUARIO%TYPE,
    o_id_venta   OUT VENTAS.ID_VENTA%TYPE,
    o_mensaje    OUT VARCHAR2
) IS
    v_usuario_activo NUMBER;
    e_fk_parent EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_parent, -2291);
BEGIN
    SELECT COUNT(*)
      INTO v_usuario_activo
      FROM USUARIOS
     WHERE ID_USUARIO = p_id_usuario
       AND ACTIVO = 1;

    IF v_usuario_activo = 0 THEN
        o_id_venta := NULL;
        o_mensaje := 'ERROR: El usuario vendedor no existe o se encuentra inactivo.';
        RETURN;
    END IF;

    LOCK TABLE VENTAS IN ROW EXCLUSIVE MODE;

    INSERT INTO VENTAS (ID_VENTA, ID_USUARIO, ID_CLIENTE, FECHA_VENTA, ESTADO)
    VALUES (SEQ_VENTAS.NEXTVAL, p_id_usuario, p_id_cliente, SYSTIMESTAMP, 'REGISTRADA')
    RETURNING ID_VENTA INTO o_id_venta;

    COMMIT;
    o_mensaje := 'OK: Venta registrada correctamente.';
EXCEPTION
    WHEN e_fk_parent THEN
        ROLLBACK;
        o_id_venta := NULL;
        o_mensaje := 'ERROR: El cliente especificado no existe.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_id_venta := NULL;
        o_mensaje := 'ERROR al crear venta: ' || SQLERRM;
END PROC_CREAR_VENTA;
/

CREATE OR REPLACE PROCEDURE PROC_ADD_DETALLE_VENTA (
    p_id_venta    IN  DETALLE_VENTAS.ID_VENTA%TYPE,
    p_id_producto IN  DETALLE_VENTAS.ID_PRODUCTO%TYPE,
    p_cantidad    IN  DETALLE_VENTAS.CANTIDAD%TYPE,
    o_mensaje     OUT VARCHAR2
) IS
    CURSOR c_venta IS
        SELECT ESTADO
          FROM VENTAS
         WHERE ID_VENTA = p_id_venta
           FOR UPDATE;

    CURSOR c_producto IS
        SELECT NOMBRE_PRODUCTO, PRECIO_UNITARIO, STOCK, STOCK_MINIMO, ACTIVO, ES_VACUNA
          FROM PRODUCTOS
         WHERE ID_PRODUCTO = p_id_producto
           FOR UPDATE;

    v_estado_venta  VENTAS.ESTADO%TYPE;
    v_prod          c_producto%ROWTYPE;
    v_stock_rest    NUMBER;
BEGIN
    IF p_cantidad IS NULL OR p_cantidad <= 0 THEN
        o_mensaje := 'ERROR: La cantidad vendida debe ser mayor a cero.';
        RETURN;
    END IF;

    -- Validar venta con cursor explicito
    OPEN c_venta;
    FETCH c_venta INTO v_estado_venta;
    IF c_venta%NOTFOUND THEN
        CLOSE c_venta;
        ROLLBACK;
        o_mensaje := 'ERROR: La venta especificada no existe.';
        RETURN;
    END IF;
    CLOSE c_venta;

    IF v_estado_venta <> 'REGISTRADA' THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se pueden agregar productos a una venta anulada.';
        RETURN;
    END IF;

    -- Validar producto y stock con cursor explicito y bloqueo de fila
    OPEN c_producto;
    FETCH c_producto INTO v_prod;
    IF c_producto%NOTFOUND THEN
        CLOSE c_producto;
        ROLLBACK;
        o_mensaje := 'ERROR: Producto no encontrado.';
        RETURN;
    END IF;
    CLOSE c_producto;

    IF v_prod.ES_VACUNA = 1 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: Las vacunas se gestionan en el catálogo clínico.';
        RETURN;
    END IF;

    IF v_prod.ACTIVO = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: El producto se encuentra inactivo.';
        RETURN;
    END IF;

    IF v_prod.STOCK < p_cantidad THEN
        ROLLBACK;
        o_mensaje := 'ERROR: Stock insuficiente para ' || v_prod.NOMBRE_PRODUCTO ||
                     ' (disponible: ' || v_prod.STOCK || ', solicitado: ' || p_cantidad || ').';
        RETURN;
    END IF;

    -- Inserta detalle; el trigger TRG_DESCONTAR_STOCK_VENTA descuenta el stock
    INSERT INTO DETALLE_VENTAS (
        ID_DETALLE_VENTA, ID_VENTA, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO
    )
    VALUES (
        SEQ_DETALLE_VENTAS.NEXTVAL, p_id_venta, p_id_producto, p_cantidad, v_prod.PRECIO_UNITARIO
    );

    COMMIT;

    v_stock_rest := v_prod.STOCK - p_cantidad;
    IF v_stock_rest <= v_prod.STOCK_MINIMO THEN
        o_mensaje := 'OK: Detalle agregado. ALERTA: Stock critico para ' ||
                     v_prod.NOMBRE_PRODUCTO || ' (restante: ' || v_stock_rest || ').';
    ELSE
        o_mensaje := 'OK: Detalle de venta agregado y stock actualizado correctamente.';
    END IF;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_mensaje := 'ERROR: Ese producto ya fue agregado a esta venta.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al agregar detalle de venta: ' || SQLERRM;
END PROC_ADD_DETALLE_VENTA;
/

CREATE OR REPLACE PROCEDURE PROC_ANULAR_VENTA (
    p_id_venta IN  VENTAS.ID_VENTA%TYPE,
    o_mensaje  OUT VARCHAR2
) IS
    CURSOR c_venta IS
        SELECT ESTADO
          FROM VENTAS
         WHERE ID_VENTA = p_id_venta
           FOR UPDATE;

    v_estado VENTAS.ESTADO%TYPE;
BEGIN
    OPEN c_venta;
    FETCH c_venta INTO v_estado;
    IF c_venta%NOTFOUND THEN
        CLOSE c_venta;
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro la venta especificada.';
        RETURN;
    END IF;
    CLOSE c_venta;

    IF v_estado = 'ANULADA' THEN
        ROLLBACK;
        o_mensaje := 'ERROR: La venta ya se encuentra anulada.';
        RETURN;
    END IF;

    -- El trigger TRG_RESTAURAR_STOCK_VENTA_ANULADA devuelve el stock automaticamente
    UPDATE VENTAS
       SET ESTADO = 'ANULADA'
     WHERE ID_VENTA = p_id_venta;

    COMMIT;
    o_mensaje := 'OK: Venta anulada y stock restaurado correctamente.';
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al anular venta: ' || SQLERRM;
END PROC_ANULAR_VENTA;
/

CREATE OR REPLACE FUNCTION FUNC_GET_VENTAS
RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT v.ID_VENTA,
               v.FECHA_VENTA,
               v.ESTADO,
               v.ID_CLIENTE,
               NVL(c.RUT, 'SIN RUT') AS RUT_CLIENTE,
               NVL(c.NOMBRES || ' ' || c.APELLIDOS, 'CONSUMIDOR FINAL') AS CLIENTE,
               v.ID_USUARIO,
               u.NOMBRES || ' ' || u.APELLIDOS AS VENDEDOR,
               COUNT(dv.ID_DETALLE_VENTA) AS CANTIDAD_ITEMS,
               NVL(SUM(dv.CANTIDAD * dv.PRECIO_UNITARIO), 0) AS TOTAL_VENTA
          FROM VENTAS v
          JOIN USUARIOS u ON v.ID_USUARIO = u.ID_USUARIO
          LEFT JOIN CLIENTES c ON v.ID_CLIENTE = c.ID_CLIENTE
          LEFT JOIN DETALLE_VENTAS dv ON v.ID_VENTA = dv.ID_VENTA
         GROUP BY v.ID_VENTA, v.FECHA_VENTA, v.ESTADO, v.ID_CLIENTE,
                  c.RUT, c.NOMBRES, c.APELLIDOS, v.ID_USUARIO, u.NOMBRES, u.APELLIDOS
         ORDER BY v.FECHA_VENTA DESC, v.ID_VENTA DESC;

    RETURN v_cursor;
END FUNC_GET_VENTAS;
/

CREATE OR REPLACE FUNCTION FUNC_GET_DETALLE_VENTA (
    p_id_venta IN DETALLE_VENTAS.ID_VENTA%TYPE
) RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT dv.ID_DETALLE_VENTA,
               dv.ID_VENTA,
               dv.ID_PRODUCTO,
               p.SKU,
               p.NOMBRE_PRODUCTO,
               dv.CANTIDAD,
               dv.PRECIO_UNITARIO,
               (dv.CANTIDAD * dv.PRECIO_UNITARIO) AS SUBTOTAL
          FROM DETALLE_VENTAS dv
          JOIN PRODUCTOS p ON dv.ID_PRODUCTO = p.ID_PRODUCTO
         WHERE dv.ID_VENTA = p_id_venta
         ORDER BY dv.ID_DETALLE_VENTA;

    RETURN v_cursor;
END FUNC_GET_DETALLE_VENTA;
/

-- ============================================================================
-- GESTOR 2: AGENDA Y CITAS MEDICAS
-- ============================================================================

CREATE OR REPLACE PROCEDURE PROC_RESERVAR_CITA (
    p_id_bloque   IN  CITAS.ID_BLOQUE%TYPE,
    p_id_paciente IN  CITAS.ID_PACIENTE%TYPE,
    p_id_servicio IN  CITAS.ID_SERVICIO%TYPE,
    p_motivo      IN  CITAS.MOTIVO%TYPE,
    o_id_cita     OUT CITAS.ID_CITA%TYPE,
    o_mensaje     OUT VARCHAR2
) IS
    CURSOR c_bloque IS
        SELECT HABILITADO
          FROM BLOQUES_AGENDA
         WHERE ID_BLOQUE = p_id_bloque
           FOR UPDATE;

    v_habilitado      BLOQUES_AGENDA.HABILITADO%TYPE;
    v_servicio_activo NUMBER;
    e_fk_parent       EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_parent, -2291);
BEGIN
    OPEN c_bloque;
    FETCH c_bloque INTO v_habilitado;
    IF c_bloque%NOTFOUND THEN
        CLOSE c_bloque;
        ROLLBACK;
        o_id_cita := NULL;
        o_mensaje := 'ERROR: El bloque de agenda no existe.';
        RETURN;
    END IF;
    CLOSE c_bloque;

    IF v_habilitado = 0 THEN
        ROLLBACK;
        o_id_cita := NULL;
        o_mensaje := 'ERROR: El bloque de agenda no esta habilitado.';
        RETURN;
    END IF;

    SELECT COUNT(*)
      INTO v_servicio_activo
      FROM SERVICIOS
     WHERE ID_SERVICIO = p_id_servicio
       AND ACTIVO = 1;

    IF v_servicio_activo = 0 THEN
        ROLLBACK;
        o_id_cita := NULL;
        o_mensaje := 'ERROR: El servicio especificado no existe o esta inactivo.';
        RETURN;
    END IF;

    INSERT INTO CITAS (ID_CITA, ID_BLOQUE, ID_PACIENTE, ID_SERVICIO, ESTADO, MOTIVO)
    VALUES (
        SEQ_CITAS.NEXTVAL, p_id_bloque, p_id_paciente, p_id_servicio,
        'RESERVADA', TRIM(p_motivo)
    )
    RETURNING ID_CITA INTO o_id_cita;

    COMMIT;
    o_mensaje := 'OK: Cita reservada correctamente.';
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_id_cita := NULL;
        o_mensaje := 'ERROR: Ese bloque de agenda ya tiene una cita activa.';
    WHEN e_fk_parent THEN
        ROLLBACK;
        o_id_cita := NULL;
        o_mensaje := 'ERROR: El paciente especificado no existe.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_id_cita := NULL;
        o_mensaje := 'ERROR al reservar cita: ' || SQLERRM;
END PROC_RESERVAR_CITA;
/

CREATE OR REPLACE PROCEDURE PROC_ACTUALIZAR_ESTADO_CITA (
    p_id_cita IN  CITAS.ID_CITA%TYPE,
    p_estado  IN  CITAS.ESTADO%TYPE,
    o_mensaje OUT VARCHAR2
) IS
    v_estado VARCHAR2(12 CHAR) := UPPER(TRIM(p_estado));
BEGIN
    IF v_estado NOT IN ('RESERVADA', 'CANCELADA', 'ATENDIDA', 'NO_ASISTIO') THEN
        o_mensaje := 'ERROR: Estado de cita no valido (use RESERVADA, CANCELADA, ATENDIDA o NO_ASISTIO).';
        RETURN;
    END IF;

    LOCK TABLE CITAS IN ROW EXCLUSIVE MODE;

    UPDATE CITAS
       SET ESTADO = v_estado
     WHERE ID_CITA = p_id_cita;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro la cita especificada.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Estado de cita actualizado correctamente.';
    END IF;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_mensaje := 'ERROR: El bloque ya esta ocupado por otra cita activa.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al actualizar estado de cita: ' || SQLERRM;
END PROC_ACTUALIZAR_ESTADO_CITA;
/

CREATE OR REPLACE FUNCTION FUNC_GET_CITAS
RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT c.ID_CITA,
               c.ID_BLOQUE,
               b.FECHA_HORA_INICIO,
               b.ID_VETERINARIO,
               u.NOMBRES || ' ' || u.APELLIDOS AS VETERINARIO,
               c.ID_PACIENTE,
               pa.NOMBRE_PACIENTE,
               es.NOMBRE_ESPECIE,
               cl.NOMBRES || ' ' || cl.APELLIDOS AS DUENO,
               cl.TELEFONO AS TELEFONO_DUENO,
               c.ID_SERVICIO,
               s.NOMBRE_SERVICIO,
               c.ESTADO,
               c.MOTIVO
          FROM CITAS c
          JOIN BLOQUES_AGENDA b ON c.ID_BLOQUE = b.ID_BLOQUE
          JOIN USUARIOS u ON b.ID_VETERINARIO = u.ID_USUARIO
          JOIN PACIENTES pa ON c.ID_PACIENTE = pa.ID_PACIENTE
          JOIN ESPECIES es ON pa.ID_ESPECIE = es.ID_ESPECIE
          JOIN CLIENTES cl ON pa.ID_CLIENTE = cl.ID_CLIENTE
          JOIN SERVICIOS s ON c.ID_SERVICIO = s.ID_SERVICIO
         ORDER BY b.FECHA_HORA_INICIO DESC, c.ID_CITA DESC;

    RETURN v_cursor;
END FUNC_GET_CITAS;
/

CREATE OR REPLACE FUNCTION FUNC_GET_BLOQUES_DISPONIBLES (
    p_fecha IN DATE DEFAULT NULL
) RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT b.ID_BLOQUE,
               b.ID_VETERINARIO,
               u.NOMBRES || ' ' || u.APELLIDOS AS VETERINARIO,
               b.FECHA_HORA_INICIO
          FROM BLOQUES_AGENDA b
          JOIN USUARIOS u ON b.ID_VETERINARIO = u.ID_USUARIO
         WHERE b.HABILITADO = 1
           AND b.FECHA_HORA_INICIO > SYSDATE
           AND u.ACTIVO = 1
           AND (p_fecha IS NULL OR TRUNC(b.FECHA_HORA_INICIO) = TRUNC(p_fecha))
           AND NOT EXISTS (
               SELECT 1
                 FROM CITAS c
                WHERE c.ID_BLOQUE = b.ID_BLOQUE
                  AND c.ESTADO <> 'CANCELADA'
           )
         ORDER BY b.FECHA_HORA_INICIO ASC;

    RETURN v_cursor;
END FUNC_GET_BLOQUES_DISPONIBLES;
/

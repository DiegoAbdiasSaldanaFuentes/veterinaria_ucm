//lol 

-- ==========================================
-- GESTOR VENTAS (AJUSTADO A 02_ESQUEMA_OPERATIVO)
-- ==========================================

CREATE OR REPLACE PROCEDURE PROC_CREAR_VENTA (
    p_id_cliente IN  NUMBER,
    p_id_usuario IN  NUMBER,
    o_id_venta   OUT NUMBER,
    o_mensaje    OUT VARCHAR2
) AS
BEGIN
    INSERT INTO VENTAS (ID_USUARIO, ID_CLIENTE, FECHA_VENTA, ESTADO)
    VALUES (p_id_usuario, p_id_cliente, SYSTIMESTAMP, 'REGISTRADA')
    RETURNING ID_VENTA INTO o_id_venta;

    o_mensaje := 'Venta registrada correctamente.';
EXCEPTION
    WHEN OTHERS THEN
        o_id_venta := NULL;
        o_mensaje := 'Error al crear venta: ' || SQLERRM;
END PROC_CREAR_VENTA;
/

CREATE OR REPLACE PROCEDURE PROC_ADD_DETALLE_VENTA (
    p_id_venta    IN  NUMBER,
    p_id_producto IN  NUMBER,
    p_cantidad    IN  NUMBER,
    o_mensaje     OUT VARCHAR2
) AS
    v_precio NUMBER(12);
    v_stock  NUMBER(10);
BEGIN
    SELECT PRECIO_UNITARIO, STOCK
      INTO v_precio, v_stock
      FROM PRODUCTOS
     WHERE ID_PRODUCTO = p_id_producto;

    IF v_stock < p_cantidad THEN
        o_mensaje := 'Error: Stock insuficiente para el producto.';
        RETURN;
    END IF;

    INSERT INTO DETALLE_VENTAS (ID_VENTA, ID_PRODUCTO, CANTIDAD, PRECIO_UNITARIO)
    VALUES (p_id_venta, p_id_producto, p_cantidad, v_precio);

    o_mensaje := 'Detalle de venta agregado correctamente.';
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        o_mensaje := 'Error: Producto no encontrado.';
    WHEN DUP_VAL_ON_INDEX THEN
        o_mensaje := 'Error: Ese producto ya fue agregado a esta venta.';
    WHEN OTHERS THEN
        o_mensaje := 'Error al agregar detalle: ' || SQLERRM;
END PROC_ADD_DETALLE_VENTA;
/

-- ==========================================
-- TRIGGER: DESCUENTO DE STOCK EN VENTA
-- ==========================================

CREATE OR REPLACE TRIGGER TRG_DESCONTAR_STOCK_VENTA
AFTER INSERT ON DETALLE_VENTAS
FOR EACH ROW
BEGIN
    UPDATE PRODUCTOS
       SET STOCK = STOCK - :NEW.CANTIDAD
     WHERE ID_PRODUCTO = :NEW.ID_PRODUCTO;
END;
/

-- ==========================================
-- GESTOR CITAS: RESERVAR BLOQUE DISPONIBLE
-- ==========================================

CREATE OR REPLACE PROCEDURE PROC_RESERVAR_CITA (
    p_id_bloque   IN  NUMBER,
    p_id_paciente IN  NUMBER,
    p_id_servicio IN  NUMBER,
    p_motivo      IN  VARCHAR2,
    o_id_cita     OUT NUMBER,
    o_mensaje     OUT VARCHAR2
) AS
    v_habilitado NUMBER(1);
BEGIN
    SELECT HABILITADO
      INTO v_habilitado
      FROM BLOQUES_AGENDA
     WHERE ID_BLOQUE = p_id_bloque;

    IF v_habilitado = 0 THEN
        o_id_cita := NULL;
        o_mensaje := 'Error: El bloque de agenda no esta habilitado.';
        RETURN;
    END IF;

    INSERT INTO CITAS (ID_BLOQUE, ID_PACIENTE, ID_SERVICIO, ESTADO, MOTIVO)
    VALUES (p_id_bloque, p_id_paciente, p_id_servicio, 'RESERVADA', TRIM(p_motivo))
    RETURNING ID_CITA INTO o_id_cita;

    o_mensaje := 'Cita reservada correctamente.';
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        o_id_cita := NULL;
        o_mensaje := 'Error: El bloque de agenda no existe.';
    WHEN DUP_VAL_ON_INDEX THEN
        o_id_cita := NULL;
        o_mensaje := 'Error: Ese bloque ya tiene una cita activa.';
    WHEN OTHERS THEN
        o_id_cita := NULL;
        o_mensaje := 'Error al reservar cita: ' || SQLERRM;
END PROC_RESERVAR_CITA;
/
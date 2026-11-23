//lol 
CREATE OR REPLACE PROCEDURE PROC_CREAR_PROVEEDOR (
    p_razon_social IN  VARCHAR2,
    p_rut          IN  VARCHAR2,
    p_telefono     IN  VARCHAR2,
    p_correo       IN  VARCHAR2,
    o_id_proveedor OUT NUMBER,
    o_mensaje      OUT VARCHAR2
) AS
BEGIN
    INSERT INTO PROVEEDORES (RAZON_SOCIAL, RUT, TELEFONO, CORREO)
    VALUES (TRIM(p_razon_social), UPPER(TRIM(p_rut)), TRIM(p_telefono), TRIM(p_correo))
    RETURNING ID_PROVEEDOR INTO o_id_proveedor;

    o_mensaje := 'Proveedor registrado correctamente.';
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        o_id_proveedor := NULL;
        o_mensaje := 'Error: Ya existe un proveedor con ese RUT.';
    WHEN OTHERS THEN
        o_id_proveedor := NULL;
        o_mensaje := 'Error al registrar proveedor: ' || SQLERRM;
END PROC_CREAR_PROVEEDOR;
/

CREATE OR REPLACE FUNCTION FUNC_GET_PROVEEDORES
RETURN SYS_REFCURSOR
AS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT ID_PROVEEDOR, RAZON_SOCIAL, RUT, TELEFONO, CORREO
          FROM PROVEEDORES
         ORDER BY RAZON_SOCIAL;

    RETURN v_cursor;
END FUNC_GET_PROVEEDORES;
/

CREATE OR REPLACE PROCEDURE PROC_CREAR_PRODUCTO (
    p_id_proveedor    IN  NUMBER,
    p_sku             IN  VARCHAR2,
    p_nombre_producto IN  VARCHAR2,
    p_precio_unitario IN  NUMBER,
    p_stock           IN  NUMBER,
    p_stock_minimo    IN  NUMBER,
    o_id_producto     OUT NUMBER,
    o_mensaje         OUT VARCHAR2
) AS
BEGIN
    INSERT INTO PRODUCTOS (
        ID_PROVEEDOR, SKU, NOMBRE_PRODUCTO, PRECIO_UNITARIO, STOCK, STOCK_MINIMO, ACTIVO
    )
    VALUES (
        p_id_proveedor, UPPER(TRIM(p_sku)), TRIM(p_nombre_producto),
        p_precio_unitario, NVL(p_stock, 0), NVL(p_stock_minimo, 0), 1
    )
    RETURNING ID_PRODUCTO INTO o_id_producto;

    o_mensaje := 'Producto registrado correctamente.';
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        o_id_producto := NULL;
        o_mensaje := 'Error: Ya existe un producto con ese SKU.';
    WHEN OTHERS THEN
        o_id_producto := NULL;
        o_mensaje := 'Error al registrar producto: ' || SQLERRM;
END PROC_CREAR_PRODUCTO;
/

CREATE OR REPLACE PROCEDURE PROC_INGRESAR_STOCK (
    p_id_producto IN  NUMBER,
    p_cantidad    IN  NUMBER,
    o_mensaje     OUT VARCHAR2
) AS
BEGIN
    IF p_cantidad IS NULL OR p_cantidad <= 0 THEN
        o_mensaje := 'Error: La cantidad a ingresar debe ser mayor a cero.';
        RETURN;
    END IF;

    UPDATE PRODUCTOS
       SET STOCK = STOCK + p_cantidad
     WHERE ID_PRODUCTO = p_id_producto
       AND ACTIVO = 1;

    IF SQL%ROWCOUNT = 0 THEN
        o_mensaje := 'Error: Producto no encontrado o inactivo.';
    ELSE
        o_mensaje := 'Stock actualizado correctamente.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        o_mensaje := 'Error al ingresar stock: ' || SQLERRM;
END PROC_INGRESAR_STOCK;
/

CREATE OR REPLACE FUNCTION FUNC_GET_PRODUCTOS
RETURN SYS_REFCURSOR
AS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT p.ID_PRODUCTO,
               p.SKU,
               p.NOMBRE_PRODUCTO,
               p.PRECIO_UNITARIO,
               p.STOCK,
               p.STOCK_MINIMO,
               p.ACTIVO,
               p.ID_PROVEEDOR,
               pr.RAZON_SOCIAL AS PROVEEDOR
          FROM PRODUCTOS p
          LEFT JOIN PROVEEDORES pr ON p.ID_PROVEEDOR = pr.ID_PROVEEDOR
         WHERE p.ACTIVO = 1
         ORDER BY p.NOMBRE_PRODUCTO;

    RETURN v_cursor;
END FUNC_GET_PRODUCTOS;
/

CREATE OR REPLACE PROCEDURE PROC_ACTUALIZAR_ESTADO_CITA (
    p_id_cita IN  NUMBER,
    p_estado  IN  VARCHAR2,
    o_mensaje OUT VARCHAR2
) AS
    v_estado VARCHAR2(12 CHAR) := UPPER(TRIM(p_estado));
BEGIN
    IF v_estado NOT IN ('RESERVADA', 'CANCELADA', 'ATENDIDA', 'NO_ASISTIO') THEN
        o_mensaje := 'Error: Estado de cita no valido.';
        RETURN;
    END IF;

    UPDATE CITAS
       SET ESTADO = v_estado
     WHERE ID_CITA = p_id_cita;

    IF SQL%ROWCOUNT = 0 THEN
        o_mensaje := 'Error: No se encontro la cita especificada.';
    ELSE
        o_mensaje := 'Estado de cita actualizado correctamente.';
    END IF;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        o_mensaje := 'Error: El bloque ya esta ocupado por otra cita activa.';
    WHEN OTHERS THEN
        o_mensaje := 'Error al actualizar estado de cita: ' || SQLERRM;
END PROC_ACTUALIZAR_ESTADO_CITA;
/

CREATE OR REPLACE PROCEDURE PROC_CREAR_FICHA_CLINICA (
    p_id_cita       IN  NUMBER,
    p_diagnostico   IN  VARCHAR2,
    p_observaciones IN  VARCHAR2,
    o_id_ficha      OUT NUMBER,
    o_mensaje       OUT VARCHAR2
) AS
BEGIN
    INSERT INTO FICHAS_CLINICAS (ID_CITA, DIAGNOSTICO, OBSERVACIONES)
    VALUES (p_id_cita, TRIM(p_diagnostico), TRIM(p_observaciones))
    RETURNING ID_FICHA INTO o_id_ficha;

    UPDATE CITAS
       SET ESTADO = 'ATENDIDA'
     WHERE ID_CITA = p_id_cita;

    o_mensaje := 'Ficha clinica registrada correctamente.';
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        o_id_ficha := NULL;
        o_mensaje := 'Error: Esta cita ya tiene una ficha clinica asociada.';
    WHEN OTHERS THEN
        o_id_ficha := NULL;
        o_mensaje := 'Error al registrar ficha clinica: ' || SQLERRM;
END PROC_CREAR_FICHA_CLINICA;
/

CREATE OR REPLACE PROCEDURE PROC_AGREGAR_RECETA (
    p_id_ficha     IN  NUMBER,
    p_id_producto  IN  NUMBER,
    p_indicaciones IN  VARCHAR2,
    o_id_receta    OUT NUMBER,
    o_mensaje      OUT VARCHAR2
) AS
BEGIN
    INSERT INTO RECETAS (ID_FICHA, ID_PRODUCTO, INDICACIONES)
    VALUES (p_id_ficha, p_id_producto, TRIM(p_indicaciones))
    RETURNING ID_RECETA INTO o_id_receta;

    o_mensaje := 'Receta agregada correctamente.';
EXCEPTION
    WHEN OTHERS THEN
        o_id_receta := NULL;
        o_mensaje := 'Error al agregar receta: ' || SQLERRM;
END PROC_AGREGAR_RECETA;
/

CREATE OR REPLACE PROCEDURE PROC_REGISTRAR_VACUNACION (
    p_id_paciente         IN  NUMBER,
    p_id_producto         IN  NUMBER,
    p_id_usuario          IN  NUMBER,
    p_fecha_aplicacion    IN  DATE,
    p_fecha_proxima_dosis IN  DATE,
    p_observaciones       IN  VARCHAR2,
    o_id_vacunacion       OUT NUMBER,
    o_mensaje             OUT VARCHAR2
) AS
BEGIN
    IF p_fecha_proxima_dosis <= p_fecha_aplicacion THEN
        o_id_vacunacion := NULL;
        o_mensaje := 'Error: La fecha de proxima dosis debe ser posterior a la de aplicacion.';
        RETURN;
    END IF;

    INSERT INTO VACUNACIONES (
        ID_PACIENTE, ID_PRODUCTO, ID_USUARIO,
        FECHA_APLICACION, FECHA_PROXIMA_DOSIS, OBSERVACIONES, ESTADO
    )
    VALUES (
        p_id_paciente, p_id_producto, p_id_usuario,
        p_fecha_aplicacion, p_fecha_proxima_dosis, TRIM(p_observaciones), 0
    )
    RETURNING ID_VACUNACION INTO o_id_vacunacion;

    o_mensaje := 'Vacunacion registrada correctamente.';
EXCEPTION
    WHEN OTHERS THEN
        o_id_vacunacion := NULL;
        o_mensaje := 'Error al registrar vacunacion: ' || SQLERRM;
END PROC_REGISTRAR_VACUNACION;
/

CREATE OR REPLACE FUNCTION FUNC_GET_HISTORIAL_PACIENTE (
    p_id_paciente IN NUMBER
) RETURN SYS_REFCURSOR
AS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT c.ID_CITA,
               b.FECHA_HORA_INICIO,
               s.NOMBRE_SERVICIO,
               c.ESTADO AS ESTADO_CITA,
               c.MOTIVO,
               f.ID_FICHA,
               f.DIAGNOSTICO,
               f.OBSERVACIONES
          FROM CITAS c
          JOIN BLOQUES_AGENDA b ON c.ID_BLOQUE = b.ID_BLOQUE
          JOIN SERVICIOS s ON c.ID_SERVICIO = s.ID_SERVICIO
          LEFT JOIN FICHAS_CLINICAS f ON c.ID_CITA = f.ID_CITA
         WHERE c.ID_PACIENTE = p_id_paciente
         ORDER BY b.FECHA_HORA_INICIO DESC;

    RETURN v_cursor;
END FUNC_GET_HISTORIAL_PACIENTE;
/
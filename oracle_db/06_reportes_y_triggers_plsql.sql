-- ============================================================================
-- ES3 | Veterinaria UCM | 06 - Reportes (Dashboards) y Triggers de Control
-- Motor: Oracle Database 21c
-- Requiere: 01, 02, 03, 04 y 05 ejecutados previamente
-- Responsable: Integrante 2 (Logica PL/SQL)
-- ============================================================================

-- ============================================================================
-- 1. REPORTES ESTRATEGICOS (DASHBOARDS CON SYS_REFCURSOR)
-- ============================================================================

-- 1.1 Reporte de Ventas por Mes y Anio
CREATE OR REPLACE FUNCTION FUNC_REPORTE_VENTAS_MES (
    p_mes  IN NUMBER,
    p_anio IN NUMBER
) RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT v.ID_VENTA,
               v.FECHA_VENTA,
               v.ESTADO,
               NVL(c.RUT, 'SIN RUT') AS RUT_CLIENTE,
               NVL(c.NOMBRES || ' ' || c.APELLIDOS, 'CONSUMIDOR FINAL') AS CLIENTE,
               u.NOMBRES || ' ' || u.APELLIDOS AS VENDEDOR,
               COUNT(dv.ID_DETALLE_VENTA) AS CANTIDAD_ITEMS,
               NVL(SUM(dv.CANTIDAD * dv.PRECIO_UNITARIO), 0) AS TOTAL_VENTA
          FROM VENTAS v
          JOIN USUARIOS u ON v.ID_USUARIO = u.ID_USUARIO
          LEFT JOIN CLIENTES c ON v.ID_CLIENTE = c.ID_CLIENTE
          LEFT JOIN DETALLE_VENTAS dv ON v.ID_VENTA = dv.ID_VENTA
         WHERE v.ESTADO = 'REGISTRADA'
           AND EXTRACT(MONTH FROM CAST(v.FECHA_VENTA AS DATE)) = p_mes
           AND EXTRACT(YEAR FROM CAST(v.FECHA_VENTA AS DATE)) = p_anio
         GROUP BY v.ID_VENTA, v.FECHA_VENTA, v.ESTADO,
                  c.RUT, c.NOMBRES, c.APELLIDOS, u.NOMBRES, u.APELLIDOS
         ORDER BY v.FECHA_VENTA DESC, v.ID_VENTA DESC;

    RETURN v_cursor;
END FUNC_REPORTE_VENTAS_MES;
/

-- 1.2 Reporte de Stock Critico (Alertas de Inventario)
CREATE OR REPLACE FUNCTION FUNC_REPORTE_STOCK_CRITICO
RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT p.ID_PRODUCTO,
               p.SKU,
               p.NOMBRE_PRODUCTO,
               p.STOCK,
               p.STOCK_MINIMO,
               (p.STOCK_MINIMO - p.STOCK) AS FALTANTE_SUGERIDO,
               CASE
                   WHEN p.STOCK = 0 THEN 'SIN STOCK'
                   ELSE 'CRITICO'
               END AS ESTADO_STOCK,
               NVL(pr.RAZON_SOCIAL, 'SIN PROVEEDOR') AS PROVEEDOR,
               pr.TELEFONO,
               pr.CORREO
          FROM PRODUCTOS p
          LEFT JOIN PROVEEDORES pr ON p.ID_PROVEEDOR = pr.ID_PROVEEDOR
         WHERE p.ACTIVO = 1
           AND p.STOCK <= p.STOCK_MINIMO
         ORDER BY (p.STOCK_MINIMO - p.STOCK) DESC, p.NOMBRE_PRODUCTO;

    RETURN v_cursor;
END FUNC_REPORTE_STOCK_CRITICO;
/

-- 1.3 Reporte / Recordatorios de Vacunas Pendientes (con filtro opcional de periodo)
-- Cumple contrato Integrante 1: ESTADO = 0 y filtro de periodo por FECHA_PROXIMA_DOSIS.
CREATE OR REPLACE FUNCTION FUNC_REPORTE_VACUNAS_PENDIENTES (
    p_fecha_desde IN DATE DEFAULT NULL,
    p_fecha_hasta IN DATE DEFAULT NULL
) RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT va.ID_VACUNACION,
               va.FECHA_APLICACION,
               va.FECHA_PROXIMA_DOSIS,
               TRUNC(va.FECHA_PROXIMA_DOSIS) - TRUNC(SYSDATE) AS DIAS_RESTANTES,
               CASE
                   WHEN TRUNC(va.FECHA_PROXIMA_DOSIS) < TRUNC(SYSDATE) THEN 'Vencida'
                   WHEN TRUNC(va.FECHA_PROXIMA_DOSIS) = TRUNC(SYSDATE) THEN 'Hoy'
                   ELSE 'Proxima'
               END AS ESTADO_ALERTA,
               va.OBSERVACIONES,
               pa.ID_PACIENTE,
               pa.NOMBRE_PACIENTE,
               es.NOMBRE_ESPECIE,
               cl.NOMBRES || ' ' || cl.APELLIDOS AS DUENO,
               cl.TELEFONO,
               cl.CORREO,
               pr.NOMBRE_PRODUCTO AS VACUNA
          FROM VACUNACIONES va
          JOIN PACIENTES pa ON va.ID_PACIENTE = pa.ID_PACIENTE
          JOIN ESPECIES es ON pa.ID_ESPECIE = es.ID_ESPECIE
          JOIN CLIENTES cl ON pa.ID_CLIENTE = cl.ID_CLIENTE
          JOIN PRODUCTOS pr ON va.ID_PRODUCTO = pr.ID_PRODUCTO
         WHERE va.ESTADO = 0
           AND (p_fecha_desde IS NULL OR TRUNC(va.FECHA_PROXIMA_DOSIS) >= TRUNC(p_fecha_desde))
           AND (p_fecha_hasta IS NULL OR TRUNC(va.FECHA_PROXIMA_DOSIS) <= TRUNC(p_fecha_hasta))
         ORDER BY va.FECHA_PROXIMA_DOSIS ASC;

    RETURN v_cursor;
END FUNC_REPORTE_VACUNAS_PENDIENTES;
/

-- 1.4 Reporte de Rendimiento del Staff (Dashboard adicional Frontend)
CREATE OR REPLACE FUNCTION FUNC_REPORTE_RENDIMIENTO_STAFF (
    p_mes  IN NUMBER DEFAULT NULL,
    p_anio IN NUMBER DEFAULT NULL
) RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT u.ID_USUARIO,
               u.NOMBRES || ' ' || u.APELLIDOS AS STAFF,
               r.NOMBRE_ROL,
               (SELECT COUNT(*)
                  FROM VENTAS v
                 WHERE v.ID_USUARIO = u.ID_USUARIO
                   AND v.ESTADO = 'REGISTRADA'
                   AND (p_mes IS NULL OR EXTRACT(MONTH FROM CAST(v.FECHA_VENTA AS DATE)) = p_mes)
                   AND (p_anio IS NULL OR EXTRACT(YEAR FROM CAST(v.FECHA_VENTA AS DATE)) = p_anio)
               ) AS VENTAS_REGISTRADAS,
               (SELECT NVL(SUM(dv.CANTIDAD * dv.PRECIO_UNITARIO), 0)
                  FROM VENTAS v
                  JOIN DETALLE_VENTAS dv ON v.ID_VENTA = dv.ID_VENTA
                 WHERE v.ID_USUARIO = u.ID_USUARIO
                   AND v.ESTADO = 'REGISTRADA'
                   AND (p_mes IS NULL OR EXTRACT(MONTH FROM CAST(v.FECHA_VENTA AS DATE)) = p_mes)
                   AND (p_anio IS NULL OR EXTRACT(YEAR FROM CAST(v.FECHA_VENTA AS DATE)) = p_anio)
               ) AS MONTO_VENDIDO,
               (SELECT COUNT(*)
                  FROM CITAS c
                  JOIN BLOQUES_AGENDA b ON c.ID_BLOQUE = b.ID_BLOQUE
                 WHERE b.ID_VETERINARIO = u.ID_USUARIO
                   AND c.ESTADO = 'ATENDIDA'
                   AND (p_mes IS NULL OR EXTRACT(MONTH FROM b.FECHA_HORA_INICIO) = p_mes)
                   AND (p_anio IS NULL OR EXTRACT(YEAR FROM b.FECHA_HORA_INICIO) = p_anio)
               ) AS CITAS_ATENDIDAS,
               (SELECT COUNT(*)
                  FROM VACUNACIONES va
                 WHERE va.ID_USUARIO = u.ID_USUARIO
                   AND (p_mes IS NULL OR EXTRACT(MONTH FROM va.FECHA_APLICACION) = p_mes)
                   AND (p_anio IS NULL OR EXTRACT(YEAR FROM va.FECHA_APLICACION) = p_anio)
               ) AS VACUNAS_APLICADAS
          FROM USUARIOS u
          JOIN ROLES r ON u.ID_ROL = r.ID_ROL
         WHERE u.ACTIVO = 1
         ORDER BY MONTO_VENDIDO DESC, CITAS_ATENDIDAS DESC, STAFF ASC;

    RETURN v_cursor;
END FUNC_REPORTE_RENDIMIENTO_STAFF;
/

-- 1.5 Resumen KPI para Dashboard de Inicio
CREATE OR REPLACE FUNCTION FUNC_REPORTE_RESUMEN_DASHBOARD
RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT (SELECT COUNT(*)
                  FROM CITAS c
                  JOIN BLOQUES_AGENDA b ON c.ID_BLOQUE = b.ID_BLOQUE
                 WHERE TRUNC(b.FECHA_HORA_INICIO) = TRUNC(SYSDATE)
                   AND c.ESTADO <> 'CANCELADA') AS CITAS_HOY,
               (SELECT COUNT(*)
                  FROM CITAS c
                  JOIN BLOQUES_AGENDA b ON c.ID_BLOQUE = b.ID_BLOQUE
                 WHERE TRUNC(b.FECHA_HORA_INICIO) = TRUNC(SYSDATE)
                   AND c.ESTADO = 'ATENDIDA') AS ATENCIONES_HOY,
               (SELECT COUNT(*)
                  FROM VACUNACIONES
                 WHERE ESTADO = 0) AS VACUNAS_PENDIENTES,
               (SELECT COUNT(*)
                  FROM VACUNACIONES
                 WHERE ESTADO = 0
                   AND TRUNC(FECHA_PROXIMA_DOSIS) < TRUNC(SYSDATE)) AS VACUNAS_VENCIDAS,
               (SELECT COUNT(*)
                  FROM PRODUCTOS
                 WHERE ACTIVO = 1
                   AND STOCK <= STOCK_MINIMO) AS PRODUCTOS_CRITICOS,
               (SELECT COUNT(*)
                  FROM VENTAS
                 WHERE ESTADO = 'REGISTRADA'
                   AND TRUNC(CAST(FECHA_VENTA AS DATE)) = TRUNC(SYSDATE)) AS VENTAS_HOY_CANTIDAD,
               (SELECT NVL(SUM(dv.CANTIDAD * dv.PRECIO_UNITARIO), 0)
                  FROM VENTAS v
                  JOIN DETALLE_VENTAS dv ON v.ID_VENTA = dv.ID_VENTA
                 WHERE v.ESTADO = 'REGISTRADA'
                   AND TRUNC(CAST(v.FECHA_VENTA AS DATE)) = TRUNC(SYSDATE)) AS VENTAS_HOY_MONTO
          FROM DUAL;

    RETURN v_cursor;
END FUNC_REPORTE_RESUMEN_DASHBOARD;
/

-- ============================================================================
-- 2. TRIGGERS DE MONITOREO, VALIDACION Y CONTROL DE NEGOCIO
-- ============================================================================

-- 2.1 Trigger: Validar estado de venta/producto y descontar stock al vender
CREATE OR REPLACE TRIGGER TRG_DESCONTAR_STOCK_VENTA
BEFORE INSERT ON DETALLE_VENTAS
FOR EACH ROW
DECLARE
    v_estado_venta VENTAS.ESTADO%TYPE;
    v_stock_actual PRODUCTOS.STOCK%TYPE;
    v_activo       PRODUCTOS.ACTIVO%TYPE;
BEGIN
    SELECT ESTADO
      INTO v_estado_venta
      FROM VENTAS
     WHERE ID_VENTA = :NEW.ID_VENTA;

    IF v_estado_venta <> 'REGISTRADA' THEN
        RAISE_APPLICATION_ERROR(-20001, 'No se puede agregar detalle a una venta anulada.');
    END IF;

    SELECT STOCK, ACTIVO
      INTO v_stock_actual, v_activo
      FROM PRODUCTOS
     WHERE ID_PRODUCTO = :NEW.ID_PRODUCTO
       FOR UPDATE;

    IF v_activo = 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'No se puede vender un producto inactivo.');
    END IF;

    IF v_stock_actual < :NEW.CANTIDAD THEN
        RAISE_APPLICATION_ERROR(
            -20003,
            'Stock insuficiente para el producto ID ' || :NEW.ID_PRODUCTO ||
            ' (disponible: ' || v_stock_actual || ', solicitado: ' || :NEW.CANTIDAD || ').'
        );
    END IF;

    UPDATE PRODUCTOS
       SET STOCK = STOCK - :NEW.CANTIDAD
     WHERE ID_PRODUCTO = :NEW.ID_PRODUCTO;
END TRG_DESCONTAR_STOCK_VENTA;
/

-- 2.2 Trigger: Ajustar o devolver stock si se modifica o elimina un detalle de venta activa
CREATE OR REPLACE TRIGGER TRG_VALIDAR_STOCK_MOD_DETALLE
BEFORE UPDATE OF CANTIDAD OR DELETE ON DETALLE_VENTAS
FOR EACH ROW
DECLARE
    v_estado_venta VENTAS.ESTADO%TYPE;
    v_stock_actual PRODUCTOS.STOCK%TYPE;
    v_diferencia   NUMBER;
BEGIN
    SELECT ESTADO
      INTO v_estado_venta
      FROM VENTAS
     WHERE ID_VENTA = NVL(:NEW.ID_VENTA, :OLD.ID_VENTA);

    IF v_estado_venta = 'REGISTRADA' THEN
        IF DELETING THEN
            UPDATE PRODUCTOS
               SET STOCK = STOCK + :OLD.CANTIDAD
             WHERE ID_PRODUCTO = :OLD.ID_PRODUCTO;
        ELSIF UPDATING THEN
            v_diferencia := :NEW.CANTIDAD - :OLD.CANTIDAD;

            IF v_diferencia > 0 THEN
                SELECT STOCK
                  INTO v_stock_actual
                  FROM PRODUCTOS
                 WHERE ID_PRODUCTO = :NEW.ID_PRODUCTO
                   FOR UPDATE;

                IF v_stock_actual < v_diferencia THEN
                    RAISE_APPLICATION_ERROR(-20004, 'Stock insuficiente para aumentar la cantidad del detalle.');
                END IF;
            END IF;

            UPDATE PRODUCTOS
               SET STOCK = STOCK - v_diferencia
             WHERE ID_PRODUCTO = :NEW.ID_PRODUCTO;
        END IF;
    END IF;
END TRG_VALIDAR_STOCK_MOD_DETALLE;
/

-- 2.3 Trigger: Restaurar automaticamente el stock cuando se anula una venta
CREATE OR REPLACE TRIGGER TRG_RESTAURAR_STOCK_VENTA_ANULADA
AFTER UPDATE OF ESTADO ON VENTAS
FOR EACH ROW
WHEN (OLD.ESTADO <> 'ANULADA' AND NEW.ESTADO = 'ANULADA')
DECLARE
    CURSOR c_items IS
        SELECT ID_PRODUCTO, CANTIDAD
          FROM DETALLE_VENTAS
         WHERE ID_VENTA = :NEW.ID_VENTA;
BEGIN
    FOR item IN c_items LOOP
        UPDATE PRODUCTOS
           SET STOCK = STOCK + item.CANTIDAD
         WHERE ID_PRODUCTO = item.ID_PRODUCTO;
    END LOOP;
END TRG_RESTAURAR_STOCK_VENTA_ANULADA;
/

-- 2.4 Trigger: Normalizar RUT (sin puntos, mayuscula) y correo en CLIENTES
CREATE OR REPLACE TRIGGER TRG_NORMALIZAR_CLIENTE
BEFORE INSERT OR UPDATE ON CLIENTES
FOR EACH ROW
BEGIN
    IF :NEW.RUT IS NOT NULL THEN
        :NEW.RUT := NULLIF(REPLACE(UPPER(TRIM(:NEW.RUT)), '.', ''), '');
    END IF;
    IF :NEW.NOMBRES IS NOT NULL THEN
        :NEW.NOMBRES := TRIM(:NEW.NOMBRES);
    END IF;
    IF :NEW.APELLIDOS IS NOT NULL THEN
        :NEW.APELLIDOS := TRIM(:NEW.APELLIDOS);
    END IF;
    IF :NEW.CORREO IS NOT NULL THEN
        :NEW.CORREO := LOWER(TRIM(:NEW.CORREO));
    END IF;
    IF :NEW.TELEFONO IS NOT NULL THEN
        :NEW.TELEFONO := TRIM(:NEW.TELEFONO);
    END IF;
END TRG_NORMALIZAR_CLIENTE;
/

-- 2.5 Trigger: Proteccion de rol Veterinario y fechas en VACUNACIONES
CREATE OR REPLACE TRIGGER TRG_VALIDAR_VACUNACION_ROL
BEFORE INSERT OR UPDATE ON VACUNACIONES
FOR EACH ROW
BEGIN
    IF FUNC_ES_VETERINARIO(:NEW.ID_USUARIO) = 0 THEN
        RAISE_APPLICATION_ERROR(
            -20005,
            'El usuario ID ' || :NEW.ID_USUARIO || ' no esta activo o no tiene rol de Veterinario.'
        );
    END IF;

    IF :NEW.FECHA_PROXIMA_DOSIS <= :NEW.FECHA_APLICACION THEN
        RAISE_APPLICATION_ERROR(
            -20006,
            'La fecha de proxima dosis debe ser posterior a la fecha de aplicacion.'
        );
    END IF;
END TRG_VALIDAR_VACUNACION_ROL;
/

-- ==========================================
-- MANTENEDOR: CLIENTES
-- ==========================================

CREATE OR REPLACE PROCEDURE PROC_CREAR_CLIENTE (
    p_rut       IN  VARCHAR2,
    p_nombres   IN  VARCHAR2,
    p_apellidos IN  VARCHAR2,
    p_telefono  IN  VARCHAR2,
    p_correo    IN  VARCHAR2,
    o_id_cliente OUT NUMBER,
    o_mensaje   OUT VARCHAR2
) AS
BEGIN
    INSERT INTO CLIENTES (RUT, NOMBRES, APELLIDOS, TELEFONO, CORREO)
    VALUES (UPPER(TRIM(p_rut)), TRIM(p_nombres), TRIM(p_apellidos), TRIM(p_telefono), TRIM(p_correo))
    RETURNING ID_CLIENTE INTO o_id_cliente;

    o_mensaje := 'Cliente registrado correctamente.';
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        o_id_cliente := NULL;
        o_mensaje := 'Error: Ya existe un cliente con ese RUT.';
    WHEN OTHERS THEN
        o_id_cliente := NULL;
        o_mensaje := 'Error al registrar cliente: ' || SQLERRM;
END PROC_CREAR_CLIENTE;
/

CREATE OR REPLACE PROCEDURE PROC_ACTUALIZAR_CLIENTE (
    p_id_cliente IN  NUMBER,
    p_telefono   IN  VARCHAR2,
    p_correo     IN  VARCHAR2,
    o_mensaje    OUT VARCHAR2
) AS
BEGIN
    UPDATE CLIENTES
       SET TELEFONO = TRIM(p_telefono),
           CORREO   = TRIM(p_correo)
     WHERE ID_CLIENTE = p_id_cliente;

    IF SQL%ROWCOUNT = 0 THEN
        o_mensaje := 'No se encontro el cliente especificado.';
    ELSE
        o_mensaje := 'Cliente actualizado correctamente.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        o_mensaje := 'Error al actualizar cliente: ' || SQLERRM;
END PROC_ACTUALIZAR_CLIENTE;
/

CREATE OR REPLACE PROCEDURE PROC_ELIMINAR_CLIENTE (
    p_id_cliente IN  NUMBER,
    o_mensaje    OUT VARCHAR2
) AS
BEGIN
    DELETE FROM CLIENTES
     WHERE ID_CLIENTE = p_id_cliente;

    IF SQL%ROWCOUNT = 0 THEN
        o_mensaje := 'No se encontro el cliente a eliminar.';
    ELSE
        o_mensaje := 'Cliente eliminado correctamente.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        o_mensaje := 'Error al eliminar cliente: ' || SQLERRM;
END PROC_ELIMINAR_CLIENTE;
/

CREATE OR REPLACE FUNCTION FUNC_GET_CLIENTES
RETURN SYS_REFCURSOR
AS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT ID_CLIENTE, RUT, NOMBRES, APELLIDOS, TELEFONO, CORREO
          FROM CLIENTES
         ORDER BY ID_CLIENTE;

    RETURN v_cursor;
END FUNC_GET_CLIENTES;
/

-- ==========================================
-- MANTENEDOR: PACIENTES
-- ==========================================

CREATE OR REPLACE PROCEDURE PROC_CREAR_PACIENTE (
    p_id_cliente       IN  NUMBER,
    p_id_especie       IN  NUMBER,
    p_nombre_paciente  IN  VARCHAR2,
    p_fecha_nacimiento IN  DATE,
    o_id_paciente      OUT NUMBER,
    o_mensaje          OUT VARCHAR2
) AS
BEGIN
    INSERT INTO PACIENTES (ID_CLIENTE, ID_ESPECIE, NOMBRE_PACIENTE, FECHA_NACIMIENTO)
    VALUES (p_id_cliente, p_id_especie, TRIM(p_nombre_paciente), p_fecha_nacimiento)
    RETURNING ID_PACIENTE INTO o_id_paciente;

    o_mensaje := 'Paciente registrado correctamente.';
EXCEPTION
    WHEN OTHERS THEN
        o_mensaje := 'Error al registrar paciente: ' || SQLERRM;
END PROC_CREAR_PACIENTE;
/

CREATE OR REPLACE FUNCTION FUNC_GET_PACIENTES_POR_CLIENTE (
    p_id_cliente IN NUMBER
) RETURN SYS_REFCURSOR
AS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT p.ID_PACIENTE,
               p.NOMBRE_PACIENTE,
               p.FECHA_NACIMIENTO,
               p.ID_ESPECIE,
               e.NOMBRE_ESPECIE,
               p.ID_CLIENTE
          FROM PACIENTES p
          JOIN ESPECIES e ON p.ID_ESPECIE = e.ID_ESPECIE
         WHERE p.ID_CLIENTE = p_id_cliente
         ORDER BY p.ID_PACIENTE;

    RETURN v_cursor;
END FUNC_GET_PACIENTES_POR_CLIENTE;
/
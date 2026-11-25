-- ============================================================================
-- ES3 | Veterinaria UCM | 03 - Control de Acceso y Mantenedores (CRUD)
-- Motor: Oracle Database 21c
-- Requiere: 01_esquema_base_es3.sql y 02_esquema_operativo_es3.sql
-- Responsable: Integrante 2 (Logica PL/SQL)
-- ============================================================================

-- ============================================================================
-- 0. CONTROL DE ACCESO (AUTENTICACION Y PERFILES POR ROL)
-- ============================================================================

CREATE OR REPLACE FUNCTION FUNC_LOGIN_USUARIO (
    p_nombre_usuario IN USUARIOS.NOMBRE_USUARIO%TYPE
) RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT u.ID_USUARIO,
               u.ID_ROL,
               r.NOMBRE_ROL,
               u.NOMBRE_USUARIO,
               u.CLAVE_HASH,
               u.NOMBRES,
               u.APELLIDOS,
               u.ACTIVO
          FROM USUARIOS u
          JOIN ROLES r ON u.ID_ROL = r.ID_ROL
         WHERE UPPER(u.NOMBRE_USUARIO) = UPPER(TRIM(p_nombre_usuario));

    RETURN v_cursor;
END FUNC_LOGIN_USUARIO;
/

CREATE OR REPLACE PROCEDURE PROC_VALIDAR_LOGIN (
    p_nombre_usuario IN  USUARIOS.NOMBRE_USUARIO%TYPE,
    p_clave_hash     IN  USUARIOS.CLAVE_HASH%TYPE,
    o_id_usuario     OUT USUARIOS.ID_USUARIO%TYPE,
    o_nombre_rol     OUT ROLES.NOMBRE_ROL%TYPE,
    o_mensaje        OUT VARCHAR2
) IS
    CURSOR c_usuario IS
        SELECT u.ID_USUARIO, u.CLAVE_HASH, u.ACTIVO, r.NOMBRE_ROL
          FROM USUARIOS u
          JOIN ROLES r ON u.ID_ROL = r.ID_ROL
         WHERE UPPER(u.NOMBRE_USUARIO) = UPPER(TRIM(p_nombre_usuario));

    v_reg c_usuario%ROWTYPE;
BEGIN
    OPEN c_usuario;
    FETCH c_usuario INTO v_reg;

    IF c_usuario%NOTFOUND THEN
        CLOSE c_usuario;
        o_id_usuario := NULL;
        o_nombre_rol := NULL;
        o_mensaje := 'ERROR: Usuario o credenciales invalidas.';
        RETURN;
    END IF;
    CLOSE c_usuario;

    IF v_reg.ACTIVO = 0 THEN
        o_id_usuario := NULL;
        o_nombre_rol := NULL;
        o_mensaje := 'ERROR: La cuenta de usuario se encuentra inactiva.';
        RETURN;
    END IF;

    IF v_reg.CLAVE_HASH <> p_clave_hash THEN
        o_id_usuario := NULL;
        o_nombre_rol := NULL;
        o_mensaje := 'ERROR: Usuario o credenciales invalidas.';
        RETURN;
    END IF;

    o_id_usuario := v_reg.ID_USUARIO;
    o_nombre_rol := v_reg.NOMBRE_ROL;
    o_mensaje := 'OK: Autenticacion exitosa.';
EXCEPTION
    WHEN OTHERS THEN
        o_id_usuario := NULL;
        o_nombre_rol := NULL;
        o_mensaje := 'ERROR al validar login: ' || SQLERRM;
END PROC_VALIDAR_LOGIN;
/

-- ============================================================================
-- 1. MANTENEDOR: ROLES
-- ============================================================================

CREATE OR REPLACE PROCEDURE PROC_CREAR_ROL (
    p_nombre_rol IN  ROLES.NOMBRE_ROL%TYPE,
    o_id_rol     OUT ROLES.ID_ROL%TYPE,
    o_mensaje    OUT VARCHAR2
) IS
BEGIN
    LOCK TABLE ROLES IN ROW EXCLUSIVE MODE;

    INSERT INTO ROLES (ID_ROL, NOMBRE_ROL)
    VALUES (SEQ_ROLES.NEXTVAL, TRIM(p_nombre_rol))
    RETURNING ID_ROL INTO o_id_rol;

    COMMIT;
    o_mensaje := 'OK: Rol registrado correctamente.';
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_id_rol := NULL;
        o_mensaje := 'ERROR: Ya existe un rol con ese nombre.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_id_rol := NULL;
        o_mensaje := 'ERROR al registrar rol: ' || SQLERRM;
END PROC_CREAR_ROL;
/

CREATE OR REPLACE PROCEDURE PROC_ACTUALIZAR_ROL (
    p_id_rol     IN  ROLES.ID_ROL%TYPE,
    p_nombre_rol IN  ROLES.NOMBRE_ROL%TYPE,
    o_mensaje    OUT VARCHAR2
) IS
BEGIN
    LOCK TABLE ROLES IN ROW EXCLUSIVE MODE;

    UPDATE ROLES
       SET NOMBRE_ROL = TRIM(p_nombre_rol)
     WHERE ID_ROL = p_id_rol;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el rol especificado.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Rol actualizado correctamente.';
    END IF;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_mensaje := 'ERROR: Ya existe otro rol con ese nombre.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al actualizar rol: ' || SQLERRM;
END PROC_ACTUALIZAR_ROL;
/

CREATE OR REPLACE PROCEDURE PROC_ELIMINAR_ROL (
    p_id_rol  IN  ROLES.ID_ROL%TYPE,
    o_mensaje OUT VARCHAR2
) IS
    e_fk_child EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_child, -2292);
BEGIN
    LOCK TABLE ROLES IN ROW EXCLUSIVE MODE;

    DELETE FROM ROLES
     WHERE ID_ROL = p_id_rol;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el rol a eliminar.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Rol eliminado correctamente.';
    END IF;
EXCEPTION
    WHEN e_fk_child THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se puede eliminar el rol porque tiene usuarios asignados.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al eliminar rol: ' || SQLERRM;
END PROC_ELIMINAR_ROL;
/

CREATE OR REPLACE FUNCTION FUNC_GET_ROLES
RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT ID_ROL, NOMBRE_ROL
          FROM ROLES
         ORDER BY ID_ROL;

    RETURN v_cursor;
END FUNC_GET_ROLES;
/

-- ============================================================================
-- 2. MANTENEDOR: USUARIOS
-- ============================================================================

CREATE OR REPLACE PROCEDURE PROC_CREAR_USUARIO (
    p_id_rol         IN  USUARIOS.ID_ROL%TYPE,
    p_nombre_usuario IN  USUARIOS.NOMBRE_USUARIO%TYPE,
    p_clave_hash     IN  USUARIOS.CLAVE_HASH%TYPE,
    p_nombres        IN  USUARIOS.NOMBRES%TYPE,
    p_apellidos      IN  USUARIOS.APELLIDOS%TYPE,
    o_id_usuario     OUT USUARIOS.ID_USUARIO%TYPE,
    o_mensaje        OUT VARCHAR2
) IS
    e_fk_parent EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_parent, -2291);
BEGIN
    LOCK TABLE USUARIOS IN ROW EXCLUSIVE MODE;

    INSERT INTO USUARIOS (
        ID_USUARIO, ID_ROL, NOMBRE_USUARIO, CLAVE_HASH, NOMBRES, APELLIDOS, ACTIVO
    )
    VALUES (
        SEQ_USUARIOS.NEXTVAL, p_id_rol, TRIM(p_nombre_usuario), p_clave_hash,
        TRIM(p_nombres), TRIM(p_apellidos), 1
    )
    RETURNING ID_USUARIO INTO o_id_usuario;

    COMMIT;
    o_mensaje := 'OK: Usuario registrado correctamente.';
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_id_usuario := NULL;
        o_mensaje := 'ERROR: Ya existe un usuario con ese nombre de usuario.';
    WHEN e_fk_parent THEN
        ROLLBACK;
        o_id_usuario := NULL;
        o_mensaje := 'ERROR: El rol especificado no existe.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_id_usuario := NULL;
        o_mensaje := 'ERROR al registrar usuario: ' || SQLERRM;
END PROC_CREAR_USUARIO;
/

CREATE OR REPLACE PROCEDURE PROC_ACTUALIZAR_USUARIO (
    p_id_usuario IN  USUARIOS.ID_USUARIO%TYPE,
    p_id_rol     IN  USUARIOS.ID_ROL%TYPE,
    p_nombres    IN  USUARIOS.NOMBRES%TYPE,
    p_apellidos  IN  USUARIOS.APELLIDOS%TYPE,
    p_activo     IN  USUARIOS.ACTIVO%TYPE,
    o_mensaje    OUT VARCHAR2,
    p_clave_hash IN  USUARIOS.CLAVE_HASH%TYPE DEFAULT NULL
) IS
    e_fk_parent EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_parent, -2291);
    e_check_viol EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_check_viol, -2290);
BEGIN
    LOCK TABLE USUARIOS IN ROW EXCLUSIVE MODE;

    UPDATE USUARIOS
       SET ID_ROL     = p_id_rol,
           NOMBRES    = TRIM(p_nombres),
           APELLIDOS  = TRIM(p_apellidos),
           ACTIVO     = p_activo,
           CLAVE_HASH = NVL(p_clave_hash, CLAVE_HASH)
     WHERE ID_USUARIO = p_id_usuario;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el usuario especificado.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Usuario actualizado correctamente.';
    END IF;
EXCEPTION
    WHEN e_fk_parent THEN
        ROLLBACK;
        o_mensaje := 'ERROR: El rol especificado no existe.';
    WHEN e_check_viol THEN
        ROLLBACK;
        o_mensaje := 'ERROR: El campo ACTIVO debe ser 0 o 1.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al actualizar usuario: ' || SQLERRM;
END PROC_ACTUALIZAR_USUARIO;
/

CREATE OR REPLACE PROCEDURE PROC_ELIMINAR_USUARIO (
    p_id_usuario IN  USUARIOS.ID_USUARIO%TYPE,
    o_mensaje    OUT VARCHAR2
) IS
    e_fk_child EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_child, -2292);
BEGIN
    LOCK TABLE USUARIOS IN ROW EXCLUSIVE MODE;

    DELETE FROM USUARIOS
     WHERE ID_USUARIO = p_id_usuario;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el usuario a eliminar.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Usuario eliminado correctamente.';
    END IF;
EXCEPTION
    WHEN e_fk_child THEN
        ROLLBACK;
        o_mensaje := 'ERROR: El usuario tiene registros asociados (ventas, agenda o vacunaciones). Desactivelo con ACTIVO = 0.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al eliminar usuario: ' || SQLERRM;
END PROC_ELIMINAR_USUARIO;
/

CREATE OR REPLACE FUNCTION FUNC_GET_USUARIOS
RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT u.ID_USUARIO,
               u.ID_ROL,
               r.NOMBRE_ROL,
               u.NOMBRE_USUARIO,
               u.NOMBRES,
               u.APELLIDOS,
               u.ACTIVO
          FROM USUARIOS u
          JOIN ROLES r ON u.ID_ROL = r.ID_ROL
         ORDER BY u.ID_USUARIO;

    RETURN v_cursor;
END FUNC_GET_USUARIOS;
/

-- ============================================================================
-- 3. MANTENEDOR: CLIENTES
-- ============================================================================

CREATE OR REPLACE PROCEDURE PROC_CREAR_CLIENTE (
    p_rut        IN  CLIENTES.RUT%TYPE,
    p_nombres    IN  CLIENTES.NOMBRES%TYPE,
    p_apellidos  IN  CLIENTES.APELLIDOS%TYPE,
    p_telefono   IN  CLIENTES.TELEFONO%TYPE,
    p_correo     IN  CLIENTES.CORREO%TYPE,
    o_id_cliente OUT CLIENTES.ID_CLIENTE%TYPE,
    o_mensaje    OUT VARCHAR2
) IS
    e_check_viol EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_check_viol, -2290);
BEGIN
    LOCK TABLE CLIENTES IN ROW EXCLUSIVE MODE;

    INSERT INTO CLIENTES (ID_CLIENTE, RUT, NOMBRES, APELLIDOS, TELEFONO, CORREO)
    VALUES (
        SEQ_CLIENTES.NEXTVAL,
        NULLIF(REPLACE(UPPER(TRIM(p_rut)), '.', ''), ''),
        TRIM(p_nombres),
        TRIM(p_apellidos),
        TRIM(p_telefono),
        LOWER(TRIM(p_correo))
    )
    RETURNING ID_CLIENTE INTO o_id_cliente;

    COMMIT;
    o_mensaje := 'OK: Cliente registrado correctamente.';
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_id_cliente := NULL;
        o_mensaje := 'ERROR: Ya existe un cliente registrado con ese RUT.';
    WHEN e_check_viol THEN
        ROLLBACK;
        o_id_cliente := NULL;
        o_mensaje := 'ERROR: Formato de RUT invalido (use formato 12345678-9 sin puntos).';
    WHEN OTHERS THEN
        ROLLBACK;
        o_id_cliente := NULL;
        o_mensaje := 'ERROR al registrar cliente: ' || SQLERRM;
END PROC_CREAR_CLIENTE;
/

CREATE OR REPLACE PROCEDURE PROC_ACTUALIZAR_CLIENTE (
    p_id_cliente IN  CLIENTES.ID_CLIENTE%TYPE,
    p_telefono   IN  CLIENTES.TELEFONO%TYPE,
    p_correo     IN  CLIENTES.CORREO%TYPE,
    o_mensaje    OUT VARCHAR2,
    p_nombres    IN  CLIENTES.NOMBRES%TYPE DEFAULT NULL,
    p_apellidos  IN  CLIENTES.APELLIDOS%TYPE DEFAULT NULL
) IS
BEGIN
    LOCK TABLE CLIENTES IN ROW EXCLUSIVE MODE;

    UPDATE CLIENTES
       SET TELEFONO  = TRIM(p_telefono),
           CORREO    = LOWER(TRIM(p_correo)),
           NOMBRES   = NVL(NULLIF(TRIM(p_nombres), ''), NOMBRES),
           APELLIDOS = NVL(NULLIF(TRIM(p_apellidos), ''), APELLIDOS)
     WHERE ID_CLIENTE = p_id_cliente;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el cliente especificado.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Cliente actualizado correctamente.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al actualizar cliente: ' || SQLERRM;
END PROC_ACTUALIZAR_CLIENTE;
/

CREATE OR REPLACE PROCEDURE PROC_ELIMINAR_CLIENTE (
    p_id_cliente IN  CLIENTES.ID_CLIENTE%TYPE,
    o_mensaje    OUT VARCHAR2
) IS
    e_fk_child EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_child, -2292);
BEGIN
    LOCK TABLE CLIENTES IN ROW EXCLUSIVE MODE;

    DELETE FROM CLIENTES
     WHERE ID_CLIENTE = p_id_cliente;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el cliente a eliminar.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Cliente eliminado correctamente.';
    END IF;
EXCEPTION
    WHEN e_fk_child THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se puede eliminar el cliente porque tiene pacientes o ventas asociadas.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al eliminar cliente: ' || SQLERRM;
END PROC_ELIMINAR_CLIENTE;
/

CREATE OR REPLACE FUNCTION FUNC_GET_CLIENTES
RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT ID_CLIENTE,
               RUT,
               NOMBRES,
               APELLIDOS,
               TELEFONO,
               CORREO
          FROM CLIENTES
         ORDER BY ID_CLIENTE;

    RETURN v_cursor;
END FUNC_GET_CLIENTES;
/

-- ============================================================================
-- 4. MANTENEDOR: ESPECIES
-- ============================================================================

CREATE OR REPLACE PROCEDURE PROC_CREAR_ESPECIE (
    p_nombre_especie IN  ESPECIES.NOMBRE_ESPECIE%TYPE,
    o_id_especie     OUT ESPECIES.ID_ESPECIE%TYPE,
    o_mensaje        OUT VARCHAR2
) IS
BEGIN
    LOCK TABLE ESPECIES IN ROW EXCLUSIVE MODE;

    INSERT INTO ESPECIES (ID_ESPECIE, NOMBRE_ESPECIE)
    VALUES (SEQ_ESPECIES.NEXTVAL, TRIM(p_nombre_especie))
    RETURNING ID_ESPECIE INTO o_id_especie;

    COMMIT;
    o_mensaje := 'OK: Especie registrada correctamente.';
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_id_especie := NULL;
        o_mensaje := 'ERROR: Ya existe una especie con ese nombre.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_id_especie := NULL;
        o_mensaje := 'ERROR al registrar especie: ' || SQLERRM;
END PROC_CREAR_ESPECIE;
/

CREATE OR REPLACE PROCEDURE PROC_ACTUALIZAR_ESPECIE (
    p_id_especie     IN  ESPECIES.ID_ESPECIE%TYPE,
    p_nombre_especie IN  ESPECIES.NOMBRE_ESPECIE%TYPE,
    o_mensaje        OUT VARCHAR2
) IS
BEGIN
    LOCK TABLE ESPECIES IN ROW EXCLUSIVE MODE;

    UPDATE ESPECIES
       SET NOMBRE_ESPECIE = TRIM(p_nombre_especie)
     WHERE ID_ESPECIE = p_id_especie;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro la especie especificada.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Especie actualizada correctamente.';
    END IF;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_mensaje := 'ERROR: Ya existe otra especie con ese nombre.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al actualizar especie: ' || SQLERRM;
END PROC_ACTUALIZAR_ESPECIE;
/

CREATE OR REPLACE PROCEDURE PROC_ELIMINAR_ESPECIE (
    p_id_especie IN  ESPECIES.ID_ESPECIE%TYPE,
    o_mensaje    OUT VARCHAR2
) IS
    e_fk_child EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_child, -2292);
BEGIN
    LOCK TABLE ESPECIES IN ROW EXCLUSIVE MODE;

    DELETE FROM ESPECIES
     WHERE ID_ESPECIE = p_id_especie;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro la especie a eliminar.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Especie eliminada correctamente.';
    END IF;
EXCEPTION
    WHEN e_fk_child THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se puede eliminar la especie porque tiene pacientes asociados.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al eliminar especie: ' || SQLERRM;
END PROC_ELIMINAR_ESPECIE;
/

CREATE OR REPLACE FUNCTION FUNC_GET_ESPECIES
RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT ID_ESPECIE, NOMBRE_ESPECIE
          FROM ESPECIES
         ORDER BY NOMBRE_ESPECIE;

    RETURN v_cursor;
END FUNC_GET_ESPECIES;
/

-- ============================================================================
-- 5. MANTENEDOR: PACIENTES
-- ============================================================================

CREATE OR REPLACE PROCEDURE PROC_CREAR_PACIENTE (
    p_id_cliente       IN  PACIENTES.ID_CLIENTE%TYPE,
    p_id_especie       IN  PACIENTES.ID_ESPECIE%TYPE,
    p_nombre_paciente  IN  PACIENTES.NOMBRE_PACIENTE%TYPE,
    p_fecha_nacimiento IN  PACIENTES.FECHA_NACIMIENTO%TYPE,
    o_id_paciente      OUT PACIENTES.ID_PACIENTE%TYPE,
    o_mensaje          OUT VARCHAR2
) IS
    e_fk_parent EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_parent, -2291);
BEGIN
    LOCK TABLE PACIENTES IN ROW EXCLUSIVE MODE;

    INSERT INTO PACIENTES (
        ID_PACIENTE, ID_CLIENTE, ID_ESPECIE, NOMBRE_PACIENTE, FECHA_NACIMIENTO
    )
    VALUES (
        SEQ_PACIENTES.NEXTVAL, p_id_cliente, p_id_especie,
        TRIM(p_nombre_paciente), p_fecha_nacimiento
    )
    RETURNING ID_PACIENTE INTO o_id_paciente;

    COMMIT;
    o_mensaje := 'OK: Paciente registrado correctamente.';
EXCEPTION
    WHEN e_fk_parent THEN
        ROLLBACK;
        o_id_paciente := NULL;
        o_mensaje := 'ERROR: El cliente o la especie especificada no existe.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_id_paciente := NULL;
        o_mensaje := 'ERROR al registrar paciente: ' || SQLERRM;
END PROC_CREAR_PACIENTE;
/

CREATE OR REPLACE PROCEDURE PROC_ACTUALIZAR_PACIENTE (
    p_id_paciente      IN  PACIENTES.ID_PACIENTE%TYPE,
    p_id_cliente       IN  PACIENTES.ID_CLIENTE%TYPE,
    p_id_especie       IN  PACIENTES.ID_ESPECIE%TYPE,
    p_nombre_paciente  IN  PACIENTES.NOMBRE_PACIENTE%TYPE,
    p_fecha_nacimiento IN  PACIENTES.FECHA_NACIMIENTO%TYPE,
    o_mensaje          OUT VARCHAR2
) IS
    e_fk_parent EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_parent, -2291);
BEGIN
    LOCK TABLE PACIENTES IN ROW EXCLUSIVE MODE;

    UPDATE PACIENTES
       SET ID_CLIENTE       = p_id_cliente,
           ID_ESPECIE       = p_id_especie,
           NOMBRE_PACIENTE  = TRIM(p_nombre_paciente),
           FECHA_NACIMIENTO = p_fecha_nacimiento
     WHERE ID_PACIENTE = p_id_paciente;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el paciente especificado.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Paciente actualizado correctamente.';
    END IF;
EXCEPTION
    WHEN e_fk_parent THEN
        ROLLBACK;
        o_mensaje := 'ERROR: El cliente o la especie especificada no existe.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al actualizar paciente: ' || SQLERRM;
END PROC_ACTUALIZAR_PACIENTE;
/

CREATE OR REPLACE PROCEDURE PROC_ELIMINAR_PACIENTE (
    p_id_paciente IN  PACIENTES.ID_PACIENTE%TYPE,
    o_mensaje     OUT VARCHAR2
) IS
    e_fk_child EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_child, -2292);
BEGIN
    LOCK TABLE PACIENTES IN ROW EXCLUSIVE MODE;

    DELETE FROM PACIENTES
     WHERE ID_PACIENTE = p_id_paciente;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el paciente a eliminar.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Paciente eliminado correctamente.';
    END IF;
EXCEPTION
    WHEN e_fk_child THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se puede eliminar el paciente porque tiene citas o vacunaciones registradas.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al eliminar paciente: ' || SQLERRM;
END PROC_ELIMINAR_PACIENTE;
/

CREATE OR REPLACE FUNCTION FUNC_GET_PACIENTES
RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT p.ID_PACIENTE,
               p.NOMBRE_PACIENTE,
               p.FECHA_NACIMIENTO,
               p.ID_ESPECIE,
               e.NOMBRE_ESPECIE,
               p.ID_CLIENTE,
               c.RUT AS RUT_CLIENTE,
               c.NOMBRES || ' ' || c.APELLIDOS AS DUENO
          FROM PACIENTES p
          JOIN ESPECIES e ON p.ID_ESPECIE = e.ID_ESPECIE
          JOIN CLIENTES c ON p.ID_CLIENTE = c.ID_CLIENTE
         ORDER BY p.ID_PACIENTE;

    RETURN v_cursor;
END FUNC_GET_PACIENTES;
/

CREATE OR REPLACE FUNCTION FUNC_GET_PACIENTES_POR_CLIENTE (
    p_id_cliente IN PACIENTES.ID_CLIENTE%TYPE
) RETURN SYS_REFCURSOR
IS
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

-- ============================================================================
-- 6. MANTENEDOR: PROVEEDORES
-- ============================================================================

CREATE OR REPLACE PROCEDURE PROC_CREAR_PROVEEDOR (
    p_razon_social IN  PROVEEDORES.RAZON_SOCIAL%TYPE,
    p_rut          IN  PROVEEDORES.RUT%TYPE,
    p_telefono     IN  PROVEEDORES.TELEFONO%TYPE,
    p_correo       IN  PROVEEDORES.CORREO%TYPE,
    o_id_proveedor OUT PROVEEDORES.ID_PROVEEDOR%TYPE,
    o_mensaje      OUT VARCHAR2
) IS
    e_check_viol EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_check_viol, -2290);
BEGIN
    LOCK TABLE PROVEEDORES IN ROW EXCLUSIVE MODE;

    INSERT INTO PROVEEDORES (ID_PROVEEDOR, RAZON_SOCIAL, RUT, TELEFONO, CORREO)
    VALUES (
        SEQ_PROVEEDORES.NEXTVAL,
        TRIM(p_razon_social),
        NULLIF(REPLACE(UPPER(TRIM(p_rut)), '.', ''), ''),
        TRIM(p_telefono),
        LOWER(TRIM(p_correo))
    )
    RETURNING ID_PROVEEDOR INTO o_id_proveedor;

    COMMIT;
    o_mensaje := 'OK: Proveedor registrado correctamente.';
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_id_proveedor := NULL;
        o_mensaje := 'ERROR: Ya existe un proveedor registrado con ese RUT.';
    WHEN e_check_viol THEN
        ROLLBACK;
        o_id_proveedor := NULL;
        o_mensaje := 'ERROR: Formato de RUT invalido (use formato 12345678-9 sin puntos).';
    WHEN OTHERS THEN
        ROLLBACK;
        o_id_proveedor := NULL;
        o_mensaje := 'ERROR al registrar proveedor: ' || SQLERRM;
END PROC_CREAR_PROVEEDOR;
/

CREATE OR REPLACE PROCEDURE PROC_ACTUALIZAR_PROVEEDOR (
    p_id_proveedor IN  PROVEEDORES.ID_PROVEEDOR%TYPE,
    p_razon_social IN  PROVEEDORES.RAZON_SOCIAL%TYPE,
    p_rut          IN  PROVEEDORES.RUT%TYPE,
    p_telefono     IN  PROVEEDORES.TELEFONO%TYPE,
    p_correo       IN  PROVEEDORES.CORREO%TYPE,
    o_mensaje      OUT VARCHAR2
) IS
    e_check_viol EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_check_viol, -2290);
BEGIN
    LOCK TABLE PROVEEDORES IN ROW EXCLUSIVE MODE;

    UPDATE PROVEEDORES
       SET RAZON_SOCIAL = TRIM(p_razon_social),
           RUT          = NULLIF(REPLACE(UPPER(TRIM(p_rut)), '.', ''), ''),
           TELEFONO     = TRIM(p_telefono),
           CORREO       = LOWER(TRIM(p_correo))
     WHERE ID_PROVEEDOR = p_id_proveedor;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el proveedor especificado.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Proveedor actualizado correctamente.';
    END IF;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_mensaje := 'ERROR: Ya existe otro proveedor con ese RUT.';
    WHEN e_check_viol THEN
        ROLLBACK;
        o_mensaje := 'ERROR: Formato de RUT invalido (use formato 12345678-9 sin puntos).';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al actualizar proveedor: ' || SQLERRM;
END PROC_ACTUALIZAR_PROVEEDOR;
/

CREATE OR REPLACE PROCEDURE PROC_ELIMINAR_PROVEEDOR (
    p_id_proveedor IN  PROVEEDORES.ID_PROVEEDOR%TYPE,
    o_mensaje      OUT VARCHAR2
) IS
    e_fk_child EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_child, -2292);
BEGIN
    LOCK TABLE PROVEEDORES IN ROW EXCLUSIVE MODE;

    DELETE FROM PROVEEDORES
     WHERE ID_PROVEEDOR = p_id_proveedor;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el proveedor a eliminar.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Proveedor eliminado correctamente.';
    END IF;
EXCEPTION
    WHEN e_fk_child THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se puede eliminar el proveedor porque tiene productos asociados.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al eliminar proveedor: ' || SQLERRM;
END PROC_ELIMINAR_PROVEEDOR;
/

CREATE OR REPLACE FUNCTION FUNC_GET_PROVEEDORES
RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT ID_PROVEEDOR,
               RAZON_SOCIAL,
               RUT,
               TELEFONO,
               CORREO
          FROM PROVEEDORES
         ORDER BY RAZON_SOCIAL;

    RETURN v_cursor;
END FUNC_GET_PROVEEDORES;
/

-- ============================================================================
-- 7. MANTENEDOR: PRODUCTOS
-- ============================================================================

CREATE OR REPLACE PROCEDURE PROC_CREAR_PRODUCTO (
    p_id_proveedor    IN  PRODUCTOS.ID_PROVEEDOR%TYPE,
    p_sku             IN  PRODUCTOS.SKU%TYPE,
    p_nombre_producto IN  PRODUCTOS.NOMBRE_PRODUCTO%TYPE,
    p_precio_unitario IN  PRODUCTOS.PRECIO_UNITARIO%TYPE,
    p_stock           IN  PRODUCTOS.STOCK%TYPE,
    p_stock_minimo    IN  PRODUCTOS.STOCK_MINIMO%TYPE,
    o_id_producto     OUT PRODUCTOS.ID_PRODUCTO%TYPE,
    o_mensaje         OUT VARCHAR2
) IS
    e_fk_parent EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_parent, -2291);
    e_check_viol EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_check_viol, -2290);
BEGIN
    LOCK TABLE PRODUCTOS IN ROW EXCLUSIVE MODE;

    INSERT INTO PRODUCTOS (
        ID_PRODUCTO, ID_PROVEEDOR, SKU, NOMBRE_PRODUCTO,
        PRECIO_UNITARIO, STOCK, STOCK_MINIMO, ACTIVO
    )
    VALUES (
        SEQ_PRODUCTOS.NEXTVAL, p_id_proveedor, UPPER(TRIM(p_sku)),
        TRIM(p_nombre_producto), p_precio_unitario,
        NVL(p_stock, 0), NVL(p_stock_minimo, 0), 1
    )
    RETURNING ID_PRODUCTO INTO o_id_producto;

    COMMIT;
    o_mensaje := 'OK: Producto registrado correctamente.';
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_id_producto := NULL;
        o_mensaje := 'ERROR: Ya existe un producto con ese SKU.';
    WHEN e_fk_parent THEN
        ROLLBACK;
        o_id_producto := NULL;
        o_mensaje := 'ERROR: El proveedor especificado no existe.';
    WHEN e_check_viol THEN
        ROLLBACK;
        o_id_producto := NULL;
        o_mensaje := 'ERROR: Precio, stock y stock minimo no pueden ser negativos.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_id_producto := NULL;
        o_mensaje := 'ERROR al registrar producto: ' || SQLERRM;
END PROC_CREAR_PRODUCTO;
/

CREATE OR REPLACE PROCEDURE PROC_ACTUALIZAR_PRODUCTO (
    p_id_producto     IN  PRODUCTOS.ID_PRODUCTO%TYPE,
    p_id_proveedor    IN  PRODUCTOS.ID_PROVEEDOR%TYPE,
    p_sku             IN  PRODUCTOS.SKU%TYPE,
    p_nombre_producto IN  PRODUCTOS.NOMBRE_PRODUCTO%TYPE,
    p_precio_unitario IN  PRODUCTOS.PRECIO_UNITARIO%TYPE,
    p_stock           IN  PRODUCTOS.STOCK%TYPE,
    p_stock_minimo    IN  PRODUCTOS.STOCK_MINIMO%TYPE,
    p_activo          IN  PRODUCTOS.ACTIVO%TYPE,
    o_mensaje         OUT VARCHAR2
) IS
    e_fk_parent EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_parent, -2291);
    e_check_viol EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_check_viol, -2290);
BEGIN
    LOCK TABLE PRODUCTOS IN ROW EXCLUSIVE MODE;

    UPDATE PRODUCTOS
       SET ID_PROVEEDOR    = p_id_proveedor,
           SKU             = UPPER(TRIM(p_sku)),
           NOMBRE_PRODUCTO = TRIM(p_nombre_producto),
           PRECIO_UNITARIO = p_precio_unitario,
           STOCK           = p_stock,
           STOCK_MINIMO    = p_stock_minimo,
           ACTIVO          = p_activo
     WHERE ID_PRODUCTO = p_id_producto;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el producto especificado.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Producto actualizado correctamente.';
    END IF;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_mensaje := 'ERROR: Ya existe otro producto con ese SKU.';
    WHEN e_fk_parent THEN
        ROLLBACK;
        o_mensaje := 'ERROR: El proveedor especificado no existe.';
    WHEN e_check_viol THEN
        ROLLBACK;
        o_mensaje := 'ERROR: Valores invalidos para precio, stock o estado activo.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al actualizar producto: ' || SQLERRM;
END PROC_ACTUALIZAR_PRODUCTO;
/

CREATE OR REPLACE PROCEDURE PROC_ELIMINAR_PRODUCTO (
    p_id_producto IN  PRODUCTOS.ID_PRODUCTO%TYPE,
    o_mensaje     OUT VARCHAR2
) IS
    e_fk_child EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_child, -2292);
BEGIN
    LOCK TABLE PRODUCTOS IN ROW EXCLUSIVE MODE;

    DELETE FROM PRODUCTOS
     WHERE ID_PRODUCTO = p_id_producto;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el producto a eliminar.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Producto eliminado correctamente.';
    END IF;
EXCEPTION
    WHEN e_fk_child THEN
        ROLLBACK;
        o_mensaje := 'ERROR: El producto tiene ventas, recetas o vacunaciones asociadas. Desactivelo con ACTIVO = 0.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al eliminar producto: ' || SQLERRM;
END PROC_ELIMINAR_PRODUCTO;
/

CREATE OR REPLACE FUNCTION FUNC_GET_PRODUCTOS
RETURN SYS_REFCURSOR
IS
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
               NVL(pr.RAZON_SOCIAL, 'SIN PROVEEDOR') AS PROVEEDOR
          FROM PRODUCTOS p
          LEFT JOIN PROVEEDORES pr ON p.ID_PROVEEDOR = pr.ID_PROVEEDOR
         WHERE p.ACTIVO = 1
         ORDER BY p.NOMBRE_PRODUCTO;

    RETURN v_cursor;
END FUNC_GET_PRODUCTOS;
/

-- ============================================================================
-- 8. MANTENEDOR: SERVICIOS
-- ============================================================================

CREATE OR REPLACE PROCEDURE PROC_CREAR_SERVICIO (
    p_nombre_servicio IN  SERVICIOS.NOMBRE_SERVICIO%TYPE,
    o_id_servicio     OUT SERVICIOS.ID_SERVICIO%TYPE,
    o_mensaje         OUT VARCHAR2
) IS
BEGIN
    LOCK TABLE SERVICIOS IN ROW EXCLUSIVE MODE;

    INSERT INTO SERVICIOS (ID_SERVICIO, NOMBRE_SERVICIO, ACTIVO)
    VALUES (SEQ_SERVICIOS.NEXTVAL, TRIM(p_nombre_servicio), 1)
    RETURNING ID_SERVICIO INTO o_id_servicio;

    COMMIT;
    o_mensaje := 'OK: Servicio registrado correctamente.';
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_id_servicio := NULL;
        o_mensaje := 'ERROR: Ya existe un servicio con ese nombre.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_id_servicio := NULL;
        o_mensaje := 'ERROR al registrar servicio: ' || SQLERRM;
END PROC_CREAR_SERVICIO;
/

CREATE OR REPLACE PROCEDURE PROC_ACTUALIZAR_SERVICIO (
    p_id_servicio     IN  SERVICIOS.ID_SERVICIO%TYPE,
    p_nombre_servicio IN  SERVICIOS.NOMBRE_SERVICIO%TYPE,
    p_activo          IN  SERVICIOS.ACTIVO%TYPE,
    o_mensaje         OUT VARCHAR2
) IS
    e_check_viol EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_check_viol, -2290);
BEGIN
    LOCK TABLE SERVICIOS IN ROW EXCLUSIVE MODE;

    UPDATE SERVICIOS
       SET NOMBRE_SERVICIO = TRIM(p_nombre_servicio),
           ACTIVO          = p_activo
     WHERE ID_SERVICIO = p_id_servicio;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el servicio especificado.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Servicio actualizado correctamente.';
    END IF;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_mensaje := 'ERROR: Ya existe otro servicio con ese nombre.';
    WHEN e_check_viol THEN
        ROLLBACK;
        o_mensaje := 'ERROR: El campo ACTIVO debe ser 0 o 1.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al actualizar servicio: ' || SQLERRM;
END PROC_ACTUALIZAR_SERVICIO;
/

CREATE OR REPLACE PROCEDURE PROC_ELIMINAR_SERVICIO (
    p_id_servicio IN  SERVICIOS.ID_SERVICIO%TYPE,
    o_mensaje     OUT VARCHAR2
) IS
    e_fk_child EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_child, -2292);
BEGIN
    LOCK TABLE SERVICIOS IN ROW EXCLUSIVE MODE;

    DELETE FROM SERVICIOS
     WHERE ID_SERVICIO = p_id_servicio;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el servicio a eliminar.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Servicio eliminado correctamente.';
    END IF;
EXCEPTION
    WHEN e_fk_child THEN
        ROLLBACK;
        o_mensaje := 'ERROR: El servicio tiene citas asociadas. Desactivelo con ACTIVO = 0.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al eliminar servicio: ' || SQLERRM;
END PROC_ELIMINAR_SERVICIO;
/

CREATE OR REPLACE FUNCTION FUNC_GET_SERVICIOS
RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT ID_SERVICIO, NOMBRE_SERVICIO, ACTIVO
          FROM SERVICIOS
         ORDER BY NOMBRE_SERVICIO;

    RETURN v_cursor;
END FUNC_GET_SERVICIOS;
/

-- ============================================================================
-- 9. MANTENEDOR: BLOQUES_AGENDA
-- ============================================================================

CREATE OR REPLACE PROCEDURE PROC_CREAR_BLOQUE_AGENDA (
    p_id_veterinario    IN  BLOQUES_AGENDA.ID_VETERINARIO%TYPE,
    p_fecha_hora_inicio IN  BLOQUES_AGENDA.FECHA_HORA_INICIO%TYPE,
    p_habilitado        IN  BLOQUES_AGENDA.HABILITADO%TYPE,
    o_id_bloque         OUT BLOQUES_AGENDA.ID_BLOQUE%TYPE,
    o_mensaje           OUT VARCHAR2
) IS
    v_es_vet NUMBER;
    e_check_viol EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_check_viol, -2290);
BEGIN
    SELECT COUNT(*)
      INTO v_es_vet
      FROM USUARIOS u
      JOIN ROLES r ON u.ID_ROL = r.ID_ROL
     WHERE u.ID_USUARIO = p_id_veterinario
       AND u.ACTIVO = 1
       AND UPPER(r.NOMBRE_ROL) LIKE '%VETERINARI%';

    IF v_es_vet = 0 THEN
        o_id_bloque := NULL;
        o_mensaje := 'ERROR: El usuario especificado no existe, esta inactivo o no tiene rol de Veterinario.';
        RETURN;
    END IF;

    LOCK TABLE BLOQUES_AGENDA IN ROW EXCLUSIVE MODE;

    INSERT INTO BLOQUES_AGENDA (
        ID_BLOQUE, ID_VETERINARIO, FECHA_HORA_INICIO, HABILITADO
    )
    VALUES (
        SEQ_BLOQUES_AGENDA.NEXTVAL, p_id_veterinario, p_fecha_hora_inicio, NVL(p_habilitado, 1)
    )
    RETURNING ID_BLOQUE INTO o_id_bloque;

    COMMIT;
    o_mensaje := 'OK: Bloque de agenda registrado correctamente.';
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_id_bloque := NULL;
        o_mensaje := 'ERROR: El veterinario ya tiene un bloque registrado en esa fecha y hora.';
    WHEN e_check_viol THEN
        ROLLBACK;
        o_id_bloque := NULL;
        o_mensaje := 'ERROR: La hora de inicio debe ser en punto (:00) o media hora (:30) sin segundos.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_id_bloque := NULL;
        o_mensaje := 'ERROR al registrar bloque de agenda: ' || SQLERRM;
END PROC_CREAR_BLOQUE_AGENDA;
/

CREATE OR REPLACE PROCEDURE PROC_ACTUALIZAR_BLOQUE_AGENDA (
    p_id_bloque         IN  BLOQUES_AGENDA.ID_BLOQUE%TYPE,
    p_fecha_hora_inicio IN  BLOQUES_AGENDA.FECHA_HORA_INICIO%TYPE,
    p_habilitado        IN  BLOQUES_AGENDA.HABILITADO%TYPE,
    o_mensaje           OUT VARCHAR2
) IS
    e_check_viol EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_check_viol, -2290);
BEGIN
    LOCK TABLE BLOQUES_AGENDA IN ROW EXCLUSIVE MODE;

    UPDATE BLOQUES_AGENDA
       SET FECHA_HORA_INICIO = p_fecha_hora_inicio,
           HABILITADO        = p_habilitado
     WHERE ID_BLOQUE = p_id_bloque;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el bloque de agenda especificado.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Bloque de agenda actualizado correctamente.';
    END IF;
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        o_mensaje := 'ERROR: Ya existe un bloque para ese veterinario en esa fecha y hora.';
    WHEN e_check_viol THEN
        ROLLBACK;
        o_mensaje := 'ERROR: La hora debe ser en punto (:00) o media hora (:30), y HABILITADO 0 o 1.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al actualizar bloque de agenda: ' || SQLERRM;
END PROC_ACTUALIZAR_BLOQUE_AGENDA;
/

CREATE OR REPLACE PROCEDURE PROC_ELIMINAR_BLOQUE_AGENDA (
    p_id_bloque IN  BLOQUES_AGENDA.ID_BLOQUE%TYPE,
    o_mensaje   OUT VARCHAR2
) IS
    e_fk_child EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_child, -2292);
BEGIN
    LOCK TABLE BLOQUES_AGENDA IN ROW EXCLUSIVE MODE;

    DELETE FROM BLOQUES_AGENDA
     WHERE ID_BLOQUE = p_id_bloque;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro el bloque de agenda a eliminar.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Bloque de agenda eliminado correctamente.';
    END IF;
EXCEPTION
    WHEN e_fk_child THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se puede eliminar el bloque porque tiene citas asociadas. Deshabilitelo con HABILITADO = 0.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al eliminar bloque de agenda: ' || SQLERRM;
END PROC_ELIMINAR_BLOQUE_AGENDA;
/

CREATE OR REPLACE FUNCTION FUNC_GET_BLOQUES_AGENDA
RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT b.ID_BLOQUE,
               b.ID_VETERINARIO,
               u.NOMBRES || ' ' || u.APELLIDOS AS VETERINARIO,
               b.FECHA_HORA_INICIO,
               b.HABILITADO,
               CASE
                   WHEN EXISTS (
                       SELECT 1
                         FROM CITAS c
                        WHERE c.ID_BLOQUE = b.ID_BLOQUE
                          AND c.ESTADO <> 'CANCELADA'
                   ) THEN 1
                   ELSE 0
               END AS OCUPADO
          FROM BLOQUES_AGENDA b
          JOIN USUARIOS u ON b.ID_VETERINARIO = u.ID_USUARIO
         ORDER BY b.FECHA_HORA_INICIO ASC;

    RETURN v_cursor;
END FUNC_GET_BLOQUES_AGENDA;
/

-- ============================================================================
-- 10. MANTENEDORES COMPLETOS: FICHAS_CLINICAS Y RECETAS
-- (La creacion transaccional esta en 05_productos_y_clinico_plsql.sql)
-- ============================================================================

CREATE OR REPLACE PROCEDURE PROC_ACTUALIZAR_FICHA_CLINICA (
    p_id_ficha      IN  FICHAS_CLINICAS.ID_FICHA%TYPE,
    p_diagnostico   IN  FICHAS_CLINICAS.DIAGNOSTICO%TYPE,
    p_observaciones IN  FICHAS_CLINICAS.OBSERVACIONES%TYPE,
    o_mensaje       OUT VARCHAR2
) IS
BEGIN
    LOCK TABLE FICHAS_CLINICAS IN ROW EXCLUSIVE MODE;

    UPDATE FICHAS_CLINICAS
       SET DIAGNOSTICO   = TRIM(p_diagnostico),
           OBSERVACIONES = TRIM(p_observaciones)
     WHERE ID_FICHA = p_id_ficha;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro la ficha clinica especificada.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Ficha clinica actualizada correctamente.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al actualizar ficha clinica: ' || SQLERRM;
END PROC_ACTUALIZAR_FICHA_CLINICA;
/

CREATE OR REPLACE PROCEDURE PROC_ELIMINAR_FICHA_CLINICA (
    p_id_ficha IN  FICHAS_CLINICAS.ID_FICHA%TYPE,
    o_mensaje  OUT VARCHAR2
) IS
    e_fk_child EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_child, -2292);
BEGIN
    LOCK TABLE FICHAS_CLINICAS IN ROW EXCLUSIVE MODE;

    DELETE FROM FICHAS_CLINICAS
     WHERE ID_FICHA = p_id_ficha;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro la ficha clinica a eliminar.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Ficha clinica eliminada correctamente.';
    END IF;
EXCEPTION
    WHEN e_fk_child THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se puede eliminar la ficha porque tiene recetas asociadas.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al eliminar ficha clinica: ' || SQLERRM;
END PROC_ELIMINAR_FICHA_CLINICA;
/

CREATE OR REPLACE FUNCTION FUNC_GET_FICHAS_CLINICAS
RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT f.ID_FICHA,
               f.ID_CITA,
               b.FECHA_HORA_INICIO AS FECHA_ATENCION,
               pa.ID_PACIENTE,
               pa.NOMBRE_PACIENTE,
               cl.NOMBRES || ' ' || cl.APELLIDOS AS DUENO,
               u.NOMBRES || ' ' || u.APELLIDOS AS VETERINARIO,
               s.NOMBRE_SERVICIO,
               f.DIAGNOSTICO,
               f.OBSERVACIONES
          FROM FICHAS_CLINICAS f
          JOIN CITAS c ON f.ID_CITA = c.ID_CITA
          JOIN BLOQUES_AGENDA b ON c.ID_BLOQUE = b.ID_BLOQUE
          JOIN PACIENTES pa ON c.ID_PACIENTE = pa.ID_PACIENTE
          JOIN CLIENTES cl ON pa.ID_CLIENTE = cl.ID_CLIENTE
          JOIN USUARIOS u ON b.ID_VETERINARIO = u.ID_USUARIO
          JOIN SERVICIOS s ON c.ID_SERVICIO = s.ID_SERVICIO
         ORDER BY b.FECHA_HORA_INICIO DESC, f.ID_FICHA DESC;

    RETURN v_cursor;
END FUNC_GET_FICHAS_CLINICAS;
/

CREATE OR REPLACE PROCEDURE PROC_ACTUALIZAR_RECETA (
    p_id_receta    IN  RECETAS.ID_RECETA%TYPE,
    p_id_producto  IN  RECETAS.ID_PRODUCTO%TYPE,
    p_indicaciones IN  RECETAS.INDICACIONES%TYPE,
    o_mensaje      OUT VARCHAR2
) IS
    e_fk_parent EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_fk_parent, -2291);
BEGIN
    LOCK TABLE RECETAS IN ROW EXCLUSIVE MODE;

    UPDATE RECETAS
       SET ID_PRODUCTO  = p_id_producto,
           INDICACIONES = TRIM(p_indicaciones)
     WHERE ID_RECETA = p_id_receta;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro la receta especificada.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Receta actualizada correctamente.';
    END IF;
EXCEPTION
    WHEN e_fk_parent THEN
        ROLLBACK;
        o_mensaje := 'ERROR: El producto especificado no existe.';
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al actualizar receta: ' || SQLERRM;
END PROC_ACTUALIZAR_RECETA;
/

CREATE OR REPLACE PROCEDURE PROC_ELIMINAR_RECETA (
    p_id_receta IN  RECETAS.ID_RECETA%TYPE,
    o_mensaje   OUT VARCHAR2
) IS
BEGIN
    LOCK TABLE RECETAS IN ROW EXCLUSIVE MODE;

    DELETE FROM RECETAS
     WHERE ID_RECETA = p_id_receta;

    IF SQL%ROWCOUNT = 0 THEN
        ROLLBACK;
        o_mensaje := 'ERROR: No se encontro la receta a eliminar.';
    ELSE
        COMMIT;
        o_mensaje := 'OK: Receta eliminada correctamente.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        o_mensaje := 'ERROR al eliminar receta: ' || SQLERRM;
END PROC_ELIMINAR_RECETA;
/

CREATE OR REPLACE FUNCTION FUNC_GET_RECETAS
RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT r.ID_RECETA,
               r.ID_FICHA,
               pa.ID_PACIENTE,
               pa.NOMBRE_PACIENTE,
               r.ID_PRODUCTO,
               pr.NOMBRE_PRODUCTO AS MEDICAMENTO,
               r.INDICACIONES
          FROM RECETAS r
          JOIN FICHAS_CLINICAS f ON r.ID_FICHA = f.ID_FICHA
          JOIN CITAS c ON f.ID_CITA = c.ID_CITA
          JOIN PACIENTES pa ON c.ID_PACIENTE = pa.ID_PACIENTE
          JOIN PRODUCTOS pr ON r.ID_PRODUCTO = pr.ID_PRODUCTO
         ORDER BY r.ID_RECETA DESC;

    RETURN v_cursor;
END FUNC_GET_RECETAS;
/

CREATE OR REPLACE FUNCTION FUNC_GET_RECETAS_POR_FICHA (
    p_id_ficha IN RECETAS.ID_FICHA%TYPE
) RETURN SYS_REFCURSOR
IS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT r.ID_RECETA,
               r.ID_FICHA,
               r.ID_PRODUCTO,
               pr.SKU,
               pr.NOMBRE_PRODUCTO AS MEDICAMENTO,
               r.INDICACIONES
          FROM RECETAS r
          JOIN PRODUCTOS pr ON r.ID_PRODUCTO = pr.ID_PRODUCTO
         WHERE r.ID_FICHA = p_id_ficha
         ORDER BY r.ID_RECETA;

    RETURN v_cursor;
END FUNC_GET_RECETAS_POR_FICHA;
/

-- Ejecutar como script, con la aplicación detenida, sobre un esquema existente.
WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK

DECLARE
    v_columnas NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_columnas FROM USER_TAB_COLUMNS
     WHERE TABLE_NAME = 'PRODUCTOS' AND COLUMN_NAME = 'ES_VACUNA';

    IF v_columnas = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE PRODUCTOS ADD (
            ES_VACUNA NUMBER(1) DEFAULT 0 NOT NULL
            CONSTRAINT CK_PRODUCTOS_ES_VACUNA CHECK (ES_VACUNA IN (0, 1))
        )';
    END IF;
END;
/

-- Preservar los IDs usados por vacunaciones, recetas y ventas históricas.
UPDATE PRODUCTOS p
   SET ES_VACUNA = 1
 WHERE ES_VACUNA = 0
   AND (p.SKU IN ('VAC-RAB-001', 'VAC-OCT-002', 'VAC-TRI-003')
        OR EXISTS (SELECT 1 FROM VACUNACIONES v WHERE v.ID_PRODUCTO = p.ID_PRODUCTO));
COMMIT;

@@08_separar_catalogo_vacunas.sql

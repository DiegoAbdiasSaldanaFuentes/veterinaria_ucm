# Oracle local · Veterinaria ES3

Levanta **Oracle Database XE 21c** en Docker y ejecuta los scripts desde **Visual Studio Code** con la extensión **Oracle SQL Developer for VS Code**. Cada integrante trabaja con su propio esquema local `ES3`. Los scripts y este README están en `oracle_db/` en la rama `feature/db-oracle`.

## 1. Requisitos

- **Docker Desktop** abierto y en ejecución.
- **Visual Studio Code** con la extensión oficial de Oracle. En **Extensions** (`Ctrl+Shift+X` en Windows), busca `Oracle sql developer` e instálala. 

El comando de abajo usa la misma imagen x86-64 que se probó en Windows. 

## 2. Crear el contenedor Oracle

En la terminal integrada de VS Code o en PowerShell, comprueba que Docker esté disponible.

```powershell
docker info
```

Para la **primera instalación**, reemplaza `REEMPLAZA_CON_TU_CLAVE` con una contraseña local para `ES3` y ejecuta este comando en una sola línea.

```powershell
docker run -d --name oracle-es3 -p 127.0.0.1:1521:1521 -v oracle-es3-data:/opt/oracle/oradata -e ORACLE_RANDOM_PASSWORD=yes -e APP_USER=ES3 -e APP_USER_PASSWORD=REEMPLAZA_CON_TU_CLAVE --health-cmd=healthcheck.sh gvenzl/oracle-xe:21-slim-faststart
```

El volumen `oracle-es3-data` guarda los datos entre reinicios. La contraseña de conexión es la que elegiste para `ES3`. Guárdala localmente y déjala fuera del repositorio. La imagen crea el usuario en `XEPDB1` durante la primera inicialización del volumen. [Documentación de la imagen](https://github.com/gvenzl/oci-oracle-xe#environment-variables)

Comprueba el estado. Cuando aparezca `healthy`, pasa al paso 3. Si aún dice `health: starting`, espera y vuelve a consultar.

```powershell
docker ps --filter name=oracle-es3
```

## 3. Conectar desde VS Code

Abre el panel **Oracle SQL Developer**, selecciona **New Connection** o el botón **+** y completa estos campos.

| Campo                 | Valor                                    |
| --------------------- | ---------------------------------------- |
| Connection Name       | `ES3 Local`                            |
| Username              | `ES3`                                  |
| Password              | La que elegiste en `APP_USER_PASSWORD` |
| Role                  | `Default`                              |
| Connection Type       | `Basic`                                |
| Hostname              | `127.0.0.1`                            |
| Port                  | `1521`                                 |
| Tipo de identificador | `Service Name`                         |
| Service Name          | `XEPDB1`                               |

Pulsa **Test** y luego **Connect** cuando la prueba sea exitosa. Abre una hoja SQL de esa conexión y ejecuta esta consulta con **Execute SQL** (`Ctrl+Enter` en Windows).

```sql
SELECT USER AS USUARIO,
       SYS_CONTEXT('USERENV', 'CON_NAME') AS CONTENEDOR
FROM DUAL;
```

El resultado esperado es **`ES3` / `XEPDB1`**.

## 4. Ejecutar los scripts

Abre cada archivo de `oracle_db/` en VS Code, selecciona la conexión **ES3 Local** y ejecuta el archivo completo con **Execute SQL as Script** (`F5`).

| Orden | Archivo                                                       | Crea                    |
| ----- | ------------------------------------------------------------- | ----------------------- |
| 1     | [01_esquema_base_es3.sql](./01_esquema_base_es3.sql)           | 5 tablas y 5 secuencias |
| 2     | [02_esquema_operativo_es3.sql](./02_esquema_operativo_es3.sql) | 9 tablas y 9 secuencias |

Revisa **Script Output** después de cada archivo. Continúa al `02` cuando el `01` termine sin errores. Si ya ejecutaste el `01` correctamente en ese esquema, empieza en el `02`. Cada archivo se aplica una vez por esquema. Si una sentencia falla, revisa el primer error y los objetos ya creados antes de reintentar.

En una hoja SQL de la misma conexión, comprueba las tablas del proyecto.

```sql
SELECT COUNT(*) AS TABLAS_ES3
FROM USER_TABLES
WHERE TABLE_NAME IN (
    'ROLES', 'USUARIOS', 'CLIENTES', 'ESPECIES', 'PACIENTES',
    'PROVEEDORES', 'PRODUCTOS', 'VENTAS', 'DETALLE_VENTAS',
    'SERVICIOS', 'BLOQUES_AGENDA', 'CITAS', 'FICHAS_CLINICAS', 'RECETAS'
);
```

El resultado esperado es **14**. El siguiente control comprueba el índice único que evita que dos citas sin cancelar ocupen el mismo bloque.

```sql
SELECT INDEX_NAME, UNIQUENESS, STATUS
FROM USER_INDEXES
WHERE INDEX_NAME = 'UX_CITAS_BLOQUE_OCUPADO';
```

Debe aparecer una fila con `UNIQUE` y `VALID`.

## 5. Volver a trabajar otro día

Una vez abierto Docker Desktop, inicia el contenedor existente, espera a que aparezca como `healthy` y vuelve a conectar **ES3 Local**.

```powershell
docker start oracle-es3
docker ps --filter name=oracle-es3
```

Para detenerlo al terminar, ejecuta `docker stop oracle-es3`. Los datos quedan en el volumen.

### Si algo falla

| Síntoma                                   | Qué revisar                                                                                                                                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Docker indica que `oracle-es3` ya existe | Ejecuta `docker ps -a --filter name=oracle-es3`. Si está detenido, usa `docker start oracle-es3`.                                                                                                                   |
| El puerto local `1521` ya está ocupado  | Si estás creando el contenedor por primera vez, cambia el mapeo a `127.0.0.1:1522:1521` y usa `1522` en VS Code.                                                                                                    |
| La prueba de conexión falla               | Revisa el estado con `docker ps --filter name=oracle-es3` y los últimos mensajes con `docker logs --tail 50 oracle-es3`. Comprueba el puerto, el servicio `XEPDB1`, el usuario `ES3` y la contraseña asignada. |
| Aparece `ORA-00955`                      | Ya existe un objeto con ese nombre en el esquema. Revisa qué sentencias del script se ejecutaron antes de continuar.                                                                                                    |

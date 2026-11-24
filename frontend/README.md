# Sistema de Gestión Integral para Clínicas Veterinarias

![React](https://img.shields.io/badge/React-19.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.3.8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-26.12.1-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-API_REST-000000?style=for-the-badge&logo=express&logoColor=white)
![Oracle](https://img.shields.io/badge/Oracle_Database-21c-F80000?style=for-the-badge&logo=oracle&logoColor=white)

Aplicación web Full-Stack desarrollada para digitalizar y optimizar la operación diaria de una clínica veterinaria, reemplazando los registros manuales en papel por una plataforma centralizada. El sistema integra gestión clínica, **control y recordatorios automáticos de vacunación**, punto de venta (POS), control de inventario y reportes gerenciales en tiempo real.

> Proyecto desarrollado en el marco de la asignatura de **Base de Datos** — Universidad Católica del Maule (UCM).

---

## Tabla de Contenidos

1. [Arquitectura del Sistema](#-arquitectura-del-sistema)
2. [Características Principales](#-características-principales)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Estructura del Repositorio](#-estructura-del-repositorio)
5. [Instalación y Ejecución Local](#-instalación-y-ejecución-local)
6. [Flujo de Trabajo con Git](#-flujo-de-trabajo-con-git)
7. [Equipo de Desarrollo](#-equipo-de-desarrollo)
8. [Contacto](#-contacto)

---

## Arquitectura del Sistema

El proyecto implementa una **arquitectura Cliente-Servidor en 3 capas** centrada en la base de datos (*Database-Centric Architecture*). Toda la lógica de negocio crítica, integridad referencial y transacciones complejas residen directamente en **Oracle Database (PL/SQL)**, manteniendo el servidor Node.js como una pasarela REST ligera y desacoplada.

```text
┌─────────────────────────┐      HTTP / JSON       ┌─────────────────────────┐       oracledb        ┌──────────────────────────────┐
│   Frontend (Cliente)    │ ◄────────────────────► │   Backend (API REST)    │ ◄───────────────────► │   Oracle Database 21c        │
│   React 19 + Vite 8     │                        │   Node.js + Express     │                       │   3FN + PL/SQL               │
│   Dashboards & Vistas   │                        │   Pasarela de Endpoints │                       │   Procedures, Functions,     │
└─────────────────────────┘                        └─────────────────────────┘                       │   SYS_REFCURSOR & Triggers   │
                                                                                                     └──────────────────────────────┘
```

---

## Características Principales

### 💉 Gestión Clínica y Control de Vacunación
* **Historial de Pacientes:** Registro completo de dueños (`CLIENTES`), mascotas (`PACIENTES`), especies, fichas clínicas y recetas médicas.
* **Registro de Vacunaciones:** Control detallado de dosis aplicadas vinculadas directamente al inventario de medicamentos (`PRODUCTOS`) y al veterinario tratante.
* **Alertas y Recordatorios de Próximas Dosis:** Consultas automatizadas mediante cursores en Oracle (`SYS_REFCURSOR`) que identifican mascotas con vacunas próximas a vencer o vencidas, facilitando el contacto oportuno con sus dueños.

### 🛒 Punto de Venta (POS) e Inventario
* **Gestión Comercial:** Registro transaccional de ventas de productos y servicios veterinarios.
* **Control Automático de Stock:** Descuento de unidades y validaciones de disponibilidad ejecutadas a nivel de base de datos mediante Procedimientos Almacenados y Triggers, previniendo inconsistencias de inventario.

### 🔐 Control de Acceso y Mantenedores (CRUD)
* **10 Mantenedores completos** para entidades maestras (Roles, Usuarios, Clientes, Pacientes, Especies, Proveedores, Productos, Servicios, Fichas Clínicas y Recetas).
* **Navegación segmentada por roles** (Administrador, Veterinario, Recepción/Ventas) para restringir vistas y operaciones según el perfil del usuario.

### 📊 Reportes y Dashboards
* Visualización gráfica interactiva orientada a la toma de decisiones:
  * Auditoría mensual de ingresos (tienda vs. servicios clínicos).
  * Monitor de alertas de stock crítico.
  * Panel de seguimiento de vacunaciones y actividad clínica.

---

## Stack Tecnológico

| Capa | Tecnologías y Herramientas |
| :--- | :--- |
| **Frontend** | React `v19.3.1`, Vite `v8.3.8`, React Router, Axios, Bootstrap 5, Chart.js / Recharts |
| **Backend** | Node.js `v26.12.1`, Express, `oracledb`, `cors`, `dotenv` |
| **Base de Datos** | Oracle Database `21c` (Modelo en 3FN, Secuencias, Procedimientos Almacenados, Funciones, Cursores y Triggers) |
| **Control de Versiones** | Git, GitHub y GitHub Desktop |

---

## Estructura del Repositorio

```text
veterinaria_ucm/
├── database/          # Scripts DDL (tablas, constraints, secuencias) y lógica PL/SQL
├── backend/           # Servidor Express, conexión a Oracle (oracledb) y rutas API REST
├── frontend/          # Aplicación SPA desarrollada con Vite y React
├── docs/              # Modelo Entidad-Relación (MER), documentación y presentación
├── CONTRATOS.md       # Contratos de integración (firmas PL/SQL y esquemas JSON)
├── .gitignore         # Exclusión de dependencias locales y variables sensibles
└── README.md          # Documentación principal del proyecto
```

---

## Instalación y Ejecución Local

### Prerrequisitos
* [Node.js v26.12.1](https://nodejs.org/)
* [Oracle Database 21c](https://www.oracle.com/database/technologies/oracle21c-windows-downloads.html) (local o vía contenedor Docker)
* Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/<TU-USUARIO>/veterinaria_ucm.git
cd veterinaria_ucm
```

### 2. Configurar la Base de Datos (Oracle 21c)
1. Conectarse a la instancia de Oracle (vía SQL Developer o VS Code).
2. Ejecutar los scripts ubicados en la carpeta `/database` en orden:
   * Primero el script DDL (tablas, restricciones y secuencias).
   * Luego los scripts de lógica PL/SQL (procedimientos, funciones, cursores y triggers).

### 3. Configurar y levantar el Backend (Node.js)
```bash
cd backend
npm install
```

Crear un archivo `.env` dentro de `/backend` con las credenciales locales de Oracle:
```env
PORT=3000
DB_USER=tu_usuario_oracle
DB_PASSWORD=tu_password_oracle
DB_CONNECT_STRING=localhost:1521/XE
```

Iniciar el servidor:
```bash
npm start
```

### 4. Configurar y levantar el Frontend (Vite + React)
En una nueva terminal desde la raíz del proyecto:
```bash
cd frontend
npm install
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`.

---

## Flujo de Trabajo con Git

El desarrollo colaborativo se organiza mediante ramas dedicadas por capa funcional, integrando los avances a través de `develop` antes de pasar a producción (`main`):

| Rama | Responsabilidad |
| :--- | :--- |
| `main` | Versión estable y lista para entrega |
| `develop` | Rama de integración continua del equipo |
| `feature/db-schema` | Diseño MER (3FN), tablas, constraints y secuencias en Oracle |
| `feature/plsql-logica` | Procedimientos almacenados, funciones, cursores y triggers |
| `feature/node-api` | Servidor Express, pool de conexiones `oracledb` y rutas REST |
| `feature/react-frontend` | Vistas, formularios, dashboards y consumo de API en React |

---

## Equipo de Desarrollo

| Integrante | Rol en el Proyecto | Área Principal |
| :--- | :--- | :--- |
| **Diego Abdias Saldaña Fuentes** | Líder de Proyecto & Frontend Developer | React + Vite, arquitectura base del repositorio e integración |
| **Benjamín Vásquez** | Backend Developer | API REST en Node.js / Express y conexión con `oracledb` |
| **Juan Sánchez** | Especialista PL/SQL | Procedimientos almacenados, funciones, cursores y triggers |
| **Gabriel** | Arquitecto de Datos | Modelo Entidad-Relación (3FN), scripts DDL y configuración DB |

---

## Contacto

Si tienes preguntas sobre el proyecto, sugerencias o deseas conectar por oportunidades profesionales:

* **Diego Abdias Saldaña Fuentes**
* **Correo electrónico:** [saldanafuentesabdiasdiego@gmail.com](mailto:saldanafuentesabdiasdiego@gmail.com)

---

*Desarrollado con dedicación por el equipo de Patitas y Cía. — 2026.*
import { Outlet, Link } from 'react-router-dom';
import { useConfig } from '../context/useConfig';
import { useAuth } from '../context/useAuth';

export default function Layout() {
  const { modulos } = useConfig();
  const { usuario, logout } = useAuth();

  const rol = (usuario?.nombre_rol || '').toLowerCase();
  const esAdmin = rol.includes('admin');
  const esVet = rol.includes('veterinari');
  const esRecep = rol.includes('recep');

  const isActivo = (id) => {
    const modulo = modulos.find((m) => m.id === id);
    return modulo ? modulo.activo : false;
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <div className="text-white p-3 d-flex flex-column" style={{ width: '260px', backgroundColor: '#003366' }}>
        <h4 className="text-primary mb-2">Veterinaria</h4>
        <div className="small text-light opacity-75 mb-3 pb-2 border-bottom border-secondary">
          <div>{usuario?.nombres} {usuario?.apellidos}</div>
          <span className="badge bg-warning text-dark mt-1">{usuario?.nombre_rol}</span>
        </div>

        <nav className="nav flex-column gap-1 flex-grow-1">
          <Link to="/" className="nav-link text-white py-1">Inicio</Link>

          <div className="text-uppercase text-info small fw-bold mt-2 px-3">Mantenedores</div>
          {(esAdmin || esRecep) && (
            <>
              <Link to="/clientes" className="nav-link text-white py-1">Clientes</Link>
              <Link to="/pacientes" className="nav-link text-white py-1">Pacientes</Link>
            </>
          )}
          {esAdmin && (
            <>
              <Link to="/especies" className="nav-link text-white py-1">Especies</Link>
              <Link to="/productos" className="nav-link text-white py-1">Productos</Link>
              <Link to="/proveedores" className="nav-link text-white py-1">Proveedores</Link>
              <Link to="/servicios" className="nav-link text-white py-1">Servicios</Link>
              <Link to="/usuarios" className="nav-link text-white py-1">Usuarios</Link>
              <Link to="/roles" className="nav-link text-white py-1">Roles</Link>
            </>
          )}
          {(esAdmin || esVet) && (
            <>
              <Link to="/fichas" className="nav-link text-white py-1">Fichas Clínicas</Link>
              <Link to="/recetas" className="nav-link text-white py-1">Recetas Médicas</Link>
            </>
          )}

          <div className="text-uppercase text-info small fw-bold mt-2 px-3">Herramientas</div>
          {isActivo('ventas') && <Link to="/ventas" className="nav-link text-white py-1">Punto de Venta</Link>}
          {isActivo('citas') && <Link to="/citas" className="nav-link text-white py-1">Agendar Citas</Link>}
          {isActivo('clinica') && <Link to="/clinica" className="nav-link text-white py-1">Gestión Clínica</Link>}
          {isActivo('inventario') && <Link to="/inventario" className="nav-link text-white py-1">Ingreso Inventario</Link>}
          {isActivo('vacunacion') && <Link to="/vacunacion" className="nav-link text-white py-1">Registro Vacunación</Link>}
          {isActivo('recordatorios') && <Link to="/recordatorios" className="nav-link text-white py-1">Recordatorios Vacunas</Link>}
          {isActivo('auditoria') && <Link to="/auditoria" className="nav-link text-white py-1">Auditoría Financiera</Link>}
          {isActivo('stock_critico') && <Link to="/stock-critico" className="nav-link text-white py-1">Stock Crítico</Link>}
          {isActivo('rendimiento') && <Link to="/rendimiento" className="nav-link text-white py-1">Rendimiento Staff</Link>}

          <div className="text-uppercase text-info small fw-bold mt-2 px-3">Sistema</div>
          <Link to="/ajustes" className="nav-link text-white py-1">Ajustes</Link>
        </nav>

        <button type="button" onClick={logout} className="btn btn-outline-light btn-sm mt-3">
          Cerrar Sesión
        </button>
      </div>

      <div className="flex-grow-1 bg-light">
        <Outlet />
      </div>
    </div>
  );
}
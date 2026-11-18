import { Outlet, Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';

export default function Layout() {
  const { modulos } = useConfig();

  const isActivo = (id) => {
    const modulo = modulos.find(m => m.id === id);
    return modulo ? modulo.activo : false;
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <div className="text-white p-3" style={{ width: '250px', backgroundColor: '#003366' }}>
        <h4 className="text-primary mb-4"><i className="fas fa-paw"></i> Veterinaria</h4>
        <nav className="nav flex-column gap-2">
          <Link to="/" className="nav-link text-white">Inicio</Link>
          
          {/* Módulos Base (CRUDs): Siempre visibles si quieres, o puedes condicionarlos también */}
          <Link to="/clientes" className="nav-link text-white">Gestión de Clientes</Link>
          <Link to="/pacientes" className="nav-link text-white">Gestión de Pacientes</Link>
          
          {/* Módulos Condicionales según la selección inicial */}
          {isActivo('ventas') && <Link to="/ventas" className="nav-link text-white">Punto de Venta</Link>}
          {isActivo('clinica') && <Link to="/clinica" className="nav-link text-white">Gestión Clínica</Link>}
          {isActivo('inventario') && <Link to="/inventario" className="nav-link text-white">Ingreso Inventario</Link>}
          {isActivo('citas') && <Link to="/citas" className="nav-link text-white">Agendar Citas</Link>}
          {isActivo('auditoria') && (
            <>
              <Link to="/auditoria" className="nav-link text-white">Auditoría Financiera</Link>
              <Link to="/stock-critico" className="nav-link text-white">Stock Crítico</Link>
              <Link to="/rendimiento" className="nav-link text-white">Rendimiento Staff</Link>
            </>
          )}
        </nav>
      </div>

      <div className="flex-grow-1 bg-light">
        <Outlet /> 
      </div>
    </div>
  );
}
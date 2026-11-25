import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { obtenerResumenInicio } from '../../services/dashboardService';

export default function Inicio() {
const { modulos } = useConfig();
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');

  const isActivo = (id) => {
    const modulo = modulos.find(m => m.id === id);
    return modulo ? modulo.activo : false;
  };

  useEffect(() => {
    obtenerResumenInicio()
      .then(res => {
        if (res.success) setResumen(res.data);
        else setError(res.message);
      })
      .catch(err => setError(err.message || 'No se pudo cargar el resumen'));
  }, []);

  if (error) {
    return <div className="p-4"><div className="alert alert-danger">{error}</div></div>;
  }

  if (!resumen) {
    return <div className="p-4">Cargando resumen...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 fw-bold" style={{ color: '#003366' }}>Panel Principal</h2>

      <div className="row g-3 mb-4">
        {isActivo('citas') && (
          <div className="col-md-3">
            <div className="card shadow-sm" style={{ border: 'none', borderLeft: '4px solid #003366' }}>
              <div className="card-body">
                <p className="text-secondary mb-1 small">Citas para Hoy</p>
                <h3 className="fw-bold mb-0">{resumen.kpis.citas_hoy}</h3>
              </div>
            </div>
          </div>
        )}

        {isActivo('clinica') && (
          <div className="col-md-3">
            <div className="card shadow-sm" style={{ border: 'none', borderLeft: '4px solid #198754' }}>
              <div className="card-body">
                <p className="text-secondary mb-1 small">Atenciones Hoy</p>
                <h3 className="fw-bold mb-0">{resumen.kpis.atenciones_hoy}</h3>
              </div>
            </div>
          </div>
        )}

        {isActivo('vacunacion') && (
          <div className="col-md-3">
            <div className="card shadow-sm" style={{ border: 'none', borderLeft: '4px solid #ffcc00' }}>
              <div className="card-body">
                <p className="text-secondary mb-1 small">Vacunas Pendientes</p>
                <h3 className="fw-bold mb-0">{resumen.kpis.vacunas_pendientes}</h3>
              </div>
            </div>
          </div>
        )}

        {(isActivo('inventario') || isActivo('auditoria')) && (
          <div className="col-md-3">
            <div className="card shadow-sm" style={{ border: 'none', borderLeft: '4px solid #dc3545' }}>
              <div className="card-body">
                <p className="text-secondary mb-1 small">Stock Crítico</p>
                <h3 className="fw-bold mb-0">{resumen.kpis.productos_criticos}</h3>
              </div>
            </div>
          </div>
        )}

        {isActivo('ventas') && (
          <div className="col-md-3">
            <div className="card shadow-sm" style={{ border: 'none', borderLeft: '4px solid #0066cc' }}>
              <div className="card-body">
                <p className="text-secondary mb-1 small">Ventas del Día</p>
                <h3 className="fw-bold mb-0">${resumen.kpis.ventas_hoy.toLocaleString('es-CL')}</h3>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="row g-4">
        {isActivo('citas') && (
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: '#003366' }}>
                <span className="fw-bold">Próximas Citas</span>
                <Link to="/citas" className="btn btn-sm fw-bold" style={{ backgroundColor: '#ffcc00', color: '#003366' }}>
                  Agendar
                </Link>
              </div>
              <div className="card-body p-0">
                <table className="table table-sm table-striped mb-0">
                  <thead>
                    <tr>
                      <th className="ps-3">Hora</th>
                      <th>Mascota</th>
                      <th>Motivo</th>
                      <th>Veterinario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.proximas_citas.map(cita => (
                      <tr key={cita.id}>
                        <td className="ps-3 fw-bold">{cita.hora}</td>
                        <td>{cita.mascota}</td>
                        <td>{cita.motivo}</td>
                        <td>{cita.veterinario}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {isActivo('vacunacion') && (
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: '#003366' }}>
                <span className="fw-bold">Recordatorios de Vacunación</span>
                <Link to="/recordatorios" className="btn btn-sm fw-bold" style={{ backgroundColor: '#ffcc00', color: '#003366' }}>
                  Ver todo
                </Link>
              </div>
              <div className="card-body p-0">
                <table className="table table-sm table-striped mb-0">
                  <thead>
                    <tr>
                      <th className="ps-3">Mascota</th>
                      <th>Vacuna</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.recordatorios_vacunas.map(item => (
                      <tr key={item.id}>
                        <td className="ps-3">{item.mascota}</td>
                        <td>{item.vacuna}</td>
                        <td>{item.fecha}</td>
                        <td>
                          <span className={`badge ${item.estado === 'Vencida' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                            {item.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {(isActivo('inventario') || isActivo('auditoria')) && (
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: '#0066cc' }}>
                <span className="fw-bold">Alertas de Stock Crítico</span>
                <Link to="/stock-critico" className="btn btn-sm btn-light fw-bold">
                  Revisar
                </Link>
              </div>
              <div className="card-body p-0">
                <table className="table table-sm table-striped mb-0">
                  <thead>
                    <tr>
                      <th className="ps-3">Producto</th>
                      <th>Stock Actual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.stock_critico.map(item => (
                      <tr key={item.id}>
                        <td className="ps-3">{item.producto}</td>
                        <td><span className="badge bg-danger">{item.stock} un.</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
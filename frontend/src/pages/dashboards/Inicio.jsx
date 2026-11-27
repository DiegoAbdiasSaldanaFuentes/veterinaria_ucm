import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../context/useConfig';
import { obtenerResumenInicio, obtenerStockCritico } from '../../services/dashboardService';
import { getCitas } from '../../services/gestoresService';
import { obtenerRecordatorios } from '../../services/vacunacionService';

export default function Inicio() {
  const { modulos } = useConfig();
  const [resumen, setResumen] = useState(null);
  const [proximasCitas, setProximasCitas] = useState([]);
  const [recordatoriosVacunas, setRecordatoriosVacunas] = useState([]);
  const [stockCritico, setStockCritico] = useState([]);
  const [error, setError] = useState('');

  const isActivo = (id) => {
    const modulo = modulos.find((m) => m.id === id);
    return modulo ? modulo.activo : false;
  };

  useEffect(() => {
    let cancelado = false;

    const verCitas = modulos.some((m) => m.id === 'citas' && m.activo);
    const verVacunas = modulos.some((m) => m.id === 'vacunacion' && m.activo);
    const verStock = modulos.some(
      (m) => (m.id === 'inventario' || m.id === 'auditoria') && m.activo
    );

    async function cargarPanel() {
      try {
        const [resR, resC, resV, resS] = await Promise.all([
          obtenerResumenInicio(),
          verCitas ? getCitas() : Promise.resolve({ success: true, data: [] }),
          verVacunas ? obtenerRecordatorios() : Promise.resolve({ success: true, data: [] }),
          verStock ? obtenerStockCritico() : Promise.resolve({ success: true, data: [] }),
        ]);

        if (cancelado) return;

        if (resR.success) {
          setResumen(resR.data);
          setError('');
        } else {
          setError(resR.message);
        }

        if (resC.success && Array.isArray(resC.data)) {
          setProximasCitas(resC.data.slice(0, 5));
        }
        if (resV.success && Array.isArray(resV.data)) {
          setRecordatoriosVacunas(resV.data.slice(0, 5));
        }
        if (resS.success && Array.isArray(resS.data)) {
          setStockCritico(resS.data.slice(0, 5));
        }
      } catch (err) {
        if (!cancelado) {
          setError(err.message || 'No se pudo cargar el resumen');
        }
      }
    }

    cargarPanel();

    return () => {
      cancelado = true;
    };
  }, [modulos]);

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
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
                <h3 className="fw-bold mb-0">{resumen.citas_hoy ?? 0}</h3>
              </div>
            </div>
          </div>
        )}

        {isActivo('clinica') && (
          <div className="col-md-3">
            <div className="card shadow-sm" style={{ border: 'none', borderLeft: '4px solid #198754' }}>
              <div className="card-body">
                <p className="text-secondary mb-1 small">Atenciones Hoy</p>
                <h3 className="fw-bold mb-0">{resumen.atenciones_hoy ?? 0}</h3>
              </div>
            </div>
          </div>
        )}

        {isActivo('vacunacion') && (
          <div className="col-md-3">
            <div className="card shadow-sm" style={{ border: 'none', borderLeft: '4px solid #ffcc00' }}>
              <div className="card-body">
                <p className="text-secondary mb-1 small">Vacunas Pendientes</p>
                <h3 className="fw-bold mb-0">{resumen.vacunas_pendientes ?? 0}</h3>
              </div>
            </div>
          </div>
        )}

        {(isActivo('inventario') || isActivo('auditoria')) && (
          <div className="col-md-3">
            <div className="card shadow-sm" style={{ border: 'none', borderLeft: '4px solid #dc3545' }}>
              <div className="card-body">
                <p className="text-secondary mb-1 small">Stock Crítico</p>
                <h3 className="fw-bold mb-0">{resumen.productos_criticos ?? 0}</h3>
              </div>
            </div>
          </div>
        )}

        {isActivo('ventas') && (
          <div className="col-md-3">
            <div className="card shadow-sm" style={{ border: 'none', borderLeft: '4px solid #0066cc' }}>
              <div className="card-body">
                <p className="text-secondary mb-1 small">Ventas del Día</p>
                <h3 className="fw-bold mb-0">
                  ${Number(resumen.ventas_hoy_monto ?? 0).toLocaleString('es-CL')}
                </h3>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="row g-4">
        {isActivo('citas') && (
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100">
              <div
                className="card-header text-white d-flex justify-content-between align-items-center"
                style={{ backgroundColor: '#003366' }}
              >
                <span className="fw-bold">Próximas Citas</span>
                <Link to="/citas" className="btn btn-sm fw-bold" style={{ backgroundColor: '#ffcc00', color: '#003366' }}>
                  Agendar
                </Link>
              </div>
              <div className="card-body p-0">
                <table className="table table-sm table-striped mb-0">
                  <thead>
                    <tr>
                      <th className="ps-3">Fecha / Hora</th>
                      <th>Mascota</th>
                      <th>Motivo</th>
                      <th>Veterinario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proximasCitas.map((cita) => (
                      <tr key={cita.id_cita}>
                        <td className="ps-3 fw-bold">
                          {cita.fecha_hora_inicio ? String(cita.fecha_hora_inicio).slice(0, 16) : '-'}
                        </td>
                        <td>{cita.nombre_paciente}</td>
                        <td>{cita.motivo || '-'}</td>
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
              <div
                className="card-header text-white d-flex justify-content-between align-items-center"
                style={{ backgroundColor: '#003366' }}
              >
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
                    {recordatoriosVacunas.map((item) => (
                      <tr key={item.id_vacunacion}>
                        <td className="ps-3">{item.nombre_paciente}</td>
                        <td>{item.vacuna}</td>
                        <td>{item.fecha_proxima_dosis ? String(item.fecha_proxima_dosis).slice(0, 10) : '-'}</td>
                        <td>
                          <span className={`badge ${item.estado_alerta === 'Vencida' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                            {item.estado_alerta}
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
              <div
                className="card-header text-white d-flex justify-content-between align-items-center"
                style={{ backgroundColor: '#0066cc' }}
              >
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
                    {stockCritico.map((item) => (
                      <tr key={item.id_producto}>
                        <td className="ps-3">{item.nombre_producto}</td>
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
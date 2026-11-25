import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerRecordatorios, aplicarRefuerzoVacuna } from '../../services/vacunacionService';

export default function RecordatoriosVacunacion() {
  const { usuario } = useAuth();
  const [recordatorios, setRecordatorios] = useState([]);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [refuerzoId, setRefuerzoId] = useState(null);
  const [formRefuerzo, setFormRefuerzo] = useState({
    fecha_aplicacion: '',
    fecha_proxima_dosis: '',
    observaciones: '',
  });

  const cargar = async () => {
    try {
      const res = await obtenerRecordatorios(desde || null, hasta || null);
      if (res.success) setRecordatorios(res.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirRefuerzo = (item) => {
    setRefuerzoId(item.id_vacunacion);
    setFormRefuerzo({
      fecha_aplicacion: new Date().toISOString().slice(0, 10),
      fecha_proxima_dosis: '',
      observaciones: '',
    });
  };

  const guardarRefuerzo = async (e) => {
    e.preventDefault();
    try {
      const res = await aplicarRefuerzoVacuna(refuerzoId, {
        ...formRefuerzo,
        id_usuario: usuario?.id_usuario,
      });
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) {
        setRefuerzoId(null);
        cargar();
      }
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Recordatorios de Vacunación</h2>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <div className="card shadow-sm p-3 mb-4" style={{ maxWidth: '620px' }}>
        <div className="d-flex gap-2 align-items-end flex-wrap">
          <div>
            <label className="form-label small text-secondary">Desde</label>
            <input type="date" className="form-control" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div>
            <label className="form-label small text-secondary">Hasta</label>
            <input type="date" className="form-control" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
          <button type="button" className="btn btn-primary" onClick={cargar}>Filtrar</button>
        </div>
      </div>

      <div className="card shadow-sm p-4">
        <table className="table table-striped">
          <thead className="table-dark">
            <tr>
              <th>Mascota</th>
              <th>Vacuna</th>
              <th>Próxima Dosis</th>
              <th>Estado</th>
              <th>Dueño</th>
              <th>Teléfono</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {recordatorios.length === 0 ? (
              <tr><td colSpan="7" className="text-center">No hay recordatorios pendientes</td></tr>
            ) : (
              recordatorios.map((item) => (
                <tr key={item.id_vacunacion || item.id}>
                  <td>{item.mascota}</td>
                  <td>{item.vacuna}</td>
                  <td>{item.fecha_proxima_dosis}</td>
                  <td>
                    <span className={`badge ${item.estado === 'Vencida' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                      {item.estado}
                    </span>
                  </td>
                  <td>{item.dueno}</td>
                  <td>{item.telefono}</td>
                  <td>
                    <button type="button" className="btn btn-sm btn-success" onClick={() => abrirRefuerzo(item)}>
                      Aplicar Refuerzo
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {refuerzoId && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Aplicar Refuerzo (Vacunación #{refuerzoId})</h5>
                <button type="button" className="btn-close" onClick={() => setRefuerzoId(null)}></button>
              </div>
              <form onSubmit={guardarRefuerzo}>
                <div className="modal-body">
                  <label className="form-label small">Fecha Aplicación</label>
                  <input type="date" className="form-control mb-2" value={formRefuerzo.fecha_aplicacion} onChange={(e) => setFormRefuerzo({ ...formRefuerzo, fecha_aplicacion: e.target.value })} required />
                  <label className="form-label small">Fecha Próxima Dosis</label>
                  <input type="date" className="form-control mb-2" value={formRefuerzo.fecha_proxima_dosis} onChange={(e) => setFormRefuerzo({ ...formRefuerzo, fecha_proxima_dosis: e.target.value })} required />
                  <label className="form-label small">Observaciones</label>
                  <input type="text" className="form-control" value={formRefuerzo.observaciones} onChange={(e) => setFormRefuerzo({ ...formRefuerzo, observaciones: e.target.value })} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setRefuerzoId(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-success">Confirmar Refuerzo</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
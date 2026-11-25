import { useState, useEffect } from 'react';
import { getFichas, actualizarFicha, eliminarFicha } from '../../services/mantenedoresService';

export default function FichasMedicas() {
  const [fichas, setFichas] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [formData, setFormData] = useState({ diagnostico: '', observaciones: '' });

  const cargar = async () => {
    try {
      const res = await getFichas();
      if (res.success) setFichas(res.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirEditar = (f) => {
    setEditId(f.id_ficha);
    setFormData({ diagnostico: f.diagnostico || '', observaciones: f.observaciones || '' });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await actualizarFicha(editId, formData);
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) {
        setMostrarModal(false);
        cargar();
      }
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta ficha clínica?')) return;
    try {
      const res = await eliminarFicha(id);
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) cargar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Fichas Clínicas</h2>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>Ficha #</th><th>Cita #</th><th>Paciente</th><th>Veterinario</th><th>Servicio</th><th>Diagnóstico</th><th>Observaciones</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {fichas.map((f) => (
            <tr key={f.id_ficha}>
              <td>{f.id_ficha}</td>
              <td>{f.id_cita}</td>
              <td>{f.nombre_paciente}</td>
              <td>{f.veterinario}</td>
              <td>{f.nombre_servicio}</td>
              <td>{f.diagnostico}</td>
              <td>{f.observaciones}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => abrirEditar(f)}>Editar</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(f.id_ficha)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Ficha #{editId}</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <textarea placeholder="Diagnóstico" className="form-control mb-2" rows="3" value={formData.diagnostico} onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })} required />
                  <textarea placeholder="Observaciones" className="form-control" rows="2" value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-success">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
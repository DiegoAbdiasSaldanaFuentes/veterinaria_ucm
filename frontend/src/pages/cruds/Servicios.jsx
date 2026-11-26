import { useState, useEffect } from 'react';
import { getServicios, crearServicio, actualizarServicio, eliminarServicio } from '../../services/mantenedoresService';

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ nombre_servicio: '', activo: 1 });
  const [mensaje, setMensaje] = useState(null);

  const cargar = async () => {
    try {
      const res = await getServicios();
      if (res.success) setServicios(res.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  useEffect(() => {
    let activo = true;
    getServicios()
      .then((res) => {
        if (activo && res.success) setServicios(res.data);
      })
      .catch((err) => {
        if (activo) setMensaje({ tipo: 'danger', texto: err.message });
      });
    return () => {
      activo = false;
    };
  }, []);

  const abrirNuevo = () => {
    setEditId(null);
    setFormData({ nombre_servicio: '', activo: 1 });
    setMostrarModal(true);
  };

  const abrirEditar = (s) => {
    setEditId(s.id_servicio);
    setFormData({ nombre_servicio: s.nombre_servicio, activo: s.activo });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editId
        ? await actualizarServicio(editId, formData)
        : await crearServicio(formData);
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
    if (!window.confirm('¿Eliminar este servicio?')) return;
    try {
      const res = await eliminarServicio(id);
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) cargar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Servicios</h2>
        <button className="btn btn-primary" onClick={abrirNuevo}>Nuevo Servicio</button>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>ID</th><th>Servicio</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {servicios.map((s) => (
            <tr key={s.id_servicio}>
              <td>{s.id_servicio}</td>
              <td>{s.nombre_servicio}</td>
              <td>
                <span className={`badge ${s.activo === 1 ? 'bg-success' : 'bg-secondary'}`}>
                  {s.activo === 1 ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => abrirEditar(s)}>Editar</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(s.id_servicio)}>Eliminar</button>
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
                <h5 className="modal-title">{editId ? 'Editar Servicio' : 'Nuevo Servicio'}</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" placeholder="Nombre del servicio" className="form-control mb-2" value={formData.nombre_servicio} onChange={(e) => setFormData({ ...formData, nombre_servicio: e.target.value })} required />
                  {editId && (
                    <select className="form-select" value={formData.activo} onChange={(e) => setFormData({ ...formData, activo: Number(e.target.value) })}>
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  )}
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
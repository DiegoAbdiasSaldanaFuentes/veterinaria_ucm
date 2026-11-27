import { useState, useEffect } from 'react';
import { getProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from '../../services/mantenedoresService';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [formData, setFormData] = useState({ razon_social: '', rut: '', telefono: '', correo: '' });

  const cargar = async () => {
    try {
      const res = await getProveedores();
      if (res.success) setProveedores(res.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  useEffect(() => {
    let activo = true;
    getProveedores()
      .then((res) => {
        if (activo && res.success) setProveedores(res.data);
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
    setFormData({ razon_social: '', rut: '', telefono: '', correo: '' });
    setMostrarModal(true);
  };

  const abrirEditar = (p) => {
    setEditId(p.id_proveedor);
    setFormData({ razon_social: p.razon_social || '', rut: p.rut || '', telefono: p.telefono || '', correo: p.correo || '' });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editId
        ? await actualizarProveedor(editId, formData)
        : await crearProveedor(formData);
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
    if (!window.confirm('¿Eliminar este proveedor?')) return;
    try {
      const res = await eliminarProveedor(id);
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) cargar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Proveedores</h2>
        <button className="btn btn-primary" onClick={abrirNuevo}>Nuevo Proveedor</button>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>RUT</th><th>Razón Social</th><th>Teléfono</th><th>Correo</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {proveedores.map((p) => (
            <tr key={p.id_proveedor}>
              <td>{p.rut}</td>
              <td>{p.razon_social}</td>
              <td>{p.telefono}</td>
              <td>{p.correo}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => abrirEditar(p)}>Editar</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(p.id_proveedor)}>Eliminar</button>
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
                <h5 className="modal-title">{editId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" placeholder="Razón Social" className="form-control mb-2" value={formData.razon_social} onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })} required />
                  <input type="text" placeholder="RUT (ej: 77777777-7)" className="form-control mb-2" value={formData.rut} onChange={(e) => setFormData({ ...formData, rut: e.target.value })} />
                  <input type="text" placeholder="Teléfono" className="form-control mb-2" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                  <input type="email" placeholder="Correo" className="form-control mb-2" value={formData.correo} onChange={(e) => setFormData({ ...formData, correo: e.target.value })} />
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
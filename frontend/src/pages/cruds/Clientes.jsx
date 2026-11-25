import { useState, useEffect } from 'react';
import { getClientes, crearCliente, actualizarCliente, eliminarCliente } from '../../services/mantenedoresService';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [formData, setFormData] = useState({ rut: '', nombres: '', apellidos: '', telefono: '', correo: '' });

  const cargar = async () => {
    try {
      const res = await getClientes();
      if (res.success) setClientes(res.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => {
    setEditId(null);
    setFormData({ rut: '', nombres: '', apellidos: '', telefono: '', correo: '' });
    setMostrarModal(true);
  };

  const abrirEditar = (c) => {
    setEditId(c.id_cliente);
    setFormData({
      rut: c.rut || '',
      nombres: c.nombres || '',
      apellidos: c.apellidos || '',
      telefono: c.telefono || '',
      correo: c.correo || '',
    });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editId
        ? await actualizarCliente(editId, formData)
        : await crearCliente(formData);
      if (res.success) {
        setMensaje({ tipo: 'success', texto: res.message });
        setMostrarModal(false);
        cargar();
      } else {
        setMensaje({ tipo: 'danger', texto: res.message });
      }
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try {
      const res = await eliminarCliente(id);
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) cargar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Clientes</h2>
        <button className="btn btn-primary" onClick={abrirNuevo}>Nuevo Cliente</button>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>RUT</th><th>Nombres</th><th>Apellidos</th><th>Teléfono</th><th>Correo</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id_cliente}>
              <td>{c.rut}</td>
              <td>{c.nombres}</td>
              <td>{c.apellidos}</td>
              <td>{c.telefono}</td>
              <td>{c.correo}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => abrirEditar(c)}>Editar</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(c.id_cliente)}>Eliminar</button>
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
                <h5 className="modal-title">{editId ? 'Editar Cliente' : 'Nuevo Cliente'}</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" name="rut" placeholder="RUT (ej: 12345678-9)" className="form-control mb-2" value={formData.rut} onChange={(e) => setFormData({ ...formData, rut: e.target.value })} disabled={!!editId} required />
                  <input type="text" name="nombres" placeholder="Nombres" className="form-control mb-2" value={formData.nombres} onChange={(e) => setFormData({ ...formData, nombres: e.target.value })} required />
                  <input type="text" name="apellidos" placeholder="Apellidos" className="form-control mb-2" value={formData.apellidos} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} required />
                  <input type="text" name="telefono" placeholder="Teléfono" className="form-control mb-2" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                  <input type="email" name="correo" placeholder="Correo" className="form-control mb-2" value={formData.correo} onChange={(e) => setFormData({ ...formData, correo: e.target.value })} />
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
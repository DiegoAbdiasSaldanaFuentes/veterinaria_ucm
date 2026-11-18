import { useState } from 'react';

export default function Clientes() {
  const [clientes, setClientes] = useState([
    { id: 1, rut: '11.111.111-1', nombres: 'Juan', apellidos: 'Pérez', telefono: '987654321', correo: 'juan@mail.com' },
    { id: 2, rut: '22.222.222-2', nombres: 'María', apellidos: 'Gómez', telefono: '912345678', correo: 'maria@mail.com' }
  ]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState({ rut: '', nombres: '', apellidos: '', telefono: '', correo: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientes([...clientes, { ...formData, id: Date.now() }]);
    setMostrarModal(false);
    setFormData({ rut: '', nombres: '', apellidos: '', telefono: '', correo: '' });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Clientes</h2>
        <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>Nuevo Cliente</button>
      </div>
      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>RUT</th><th>Nombres</th><th>Apellidos</th><th>Teléfono</th><th>Correo</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.id}>
              <td>{cliente.rut}</td><td>{cliente.nombres}</td><td>{cliente.apellidos}</td><td>{cliente.telefono}</td><td>{cliente.correo}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2">Editar</button>
                <button className="btn btn-sm btn-danger">Eliminar</button>
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
                <h5 className="modal-title">Formulario Cliente</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" name="rut" placeholder="RUT" className="form-control mb-2" value={formData.rut} onChange={handleChange} required />
                  <input type="text" name="nombres" placeholder="Nombres" className="form-control mb-2" value={formData.nombres} onChange={handleChange} required />
                  <input type="text" name="apellidos" placeholder="Apellidos" className="form-control mb-2" value={formData.apellidos} onChange={handleChange} required />
                  <input type="text" name="telefono" placeholder="Teléfono" className="form-control mb-2" value={formData.telefono} onChange={handleChange} required />
                  <input type="email" name="correo" placeholder="Correo" className="form-control mb-2" value={formData.correo} onChange={handleChange} required />
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
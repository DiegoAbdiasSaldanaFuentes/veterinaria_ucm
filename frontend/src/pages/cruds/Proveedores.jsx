import { useState } from 'react';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([
    { id: 1, rut_empresa: '77.777.777-7', razon_social: 'Distribuidora Vet', telefono: '988888888', correo_contacto: 'ventas@vet.cl' }
  ]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState({ rut_empresa: '', razon_social: '', telefono: '', correo_contacto: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setProveedores([...proveedores, { ...formData, id: Date.now() }]);
    setMostrarModal(false);
    setFormData({ rut_empresa: '', razon_social: '', telefono: '', correo_contacto: '' });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Proveedores</h2>
        <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>Nuevo Proveedor</button>
      </div>
      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>RUT Empresa</th><th>Razón Social</th><th>Teléfono</th><th>Correo</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {proveedores.map(proveedor => (
            <tr key={proveedor.id}>
              <td>{proveedor.rut_empresa}</td><td>{proveedor.razon_social}</td><td>{proveedor.telefono}</td><td>{proveedor.correo_contacto}</td>
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
                <h5 className="modal-title">Formulario Proveedor</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" name="rut_empresa" placeholder="RUT Empresa" className="form-control mb-2" value={formData.rut_empresa} onChange={handleChange} required />
                  <input type="text" name="razon_social" placeholder="Razón Social" className="form-control mb-2" value={formData.razon_social} onChange={handleChange} required />
                  <input type="text" name="telefono" placeholder="Teléfono" className="form-control mb-2" value={formData.telefono} onChange={handleChange} required />
                  <input type="email" name="correo_contacto" placeholder="Correo" className="form-control mb-2" value={formData.correo_contacto} onChange={handleChange} required />
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
import { useState } from 'react';

export default function Roles() {
  const [roles, setRoles] = useState([
    { id: 1, nombre_rol: 'Administrador', descripcion: 'Acceso total' },
    { id: 2, nombre_rol: 'Veterinario', descripcion: 'Acceso clínico' }
  ]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState({ nombre_rol: '', descripcion: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setRoles([...roles, { ...formData, id: Date.now() }]);
    setMostrarModal(false);
    setFormData({ nombre_rol: '', descripcion: '' });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Roles</h2>
        <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>Nuevo Rol</button>
      </div>
      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>Nombre Rol</th><th>Descripción</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {roles.map(rol => (
            <tr key={rol.id}>
              <td>{rol.nombre_rol}</td><td>{rol.descripcion}</td>
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
                <h5 className="modal-title">Formulario Rol</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" name="nombre_rol" placeholder="Nombre Rol" className="form-control mb-2" value={formData.nombre_rol} onChange={handleChange} required />
                  <input type="text" name="descripcion" placeholder="Descripción" className="form-control mb-2" value={formData.descripcion} onChange={handleChange} required />
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
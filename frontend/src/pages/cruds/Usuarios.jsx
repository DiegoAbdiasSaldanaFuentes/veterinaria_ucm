import { useState } from 'react';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([
    { id: 1, rut: '11.111.111-1', nombre_completo: 'Juan Pérez', correo: 'juan@mail.com', password: '123', rol_id: '1' }
  ]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState({ rut: '', nombre_completo: '', correo: '', password: '', rol_id: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setUsuarios([...usuarios, { ...formData, id: Date.now() }]);
    setMostrarModal(false);
    setFormData({ rut: '', nombre_completo: '', correo: '', password: '', rol_id: '' });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Usuarios</h2>
        <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>Nuevo Usuario</button>
      </div>
      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>RUT</th><th>Nombre</th><th>Correo</th><th>ID Rol</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {usuarios.map(usuario => (
            <tr key={usuario.id}>
              <td>{usuario.rut}</td><td>{usuario.nombre_completo}</td><td>{usuario.correo}</td><td>{usuario.rol_id}</td>
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
                <h5 className="modal-title">Formulario Usuario</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" name="rut" placeholder="RUT" className="form-control mb-2" value={formData.rut} onChange={handleChange} required />
                  <input type="text" name="nombre_completo" placeholder="Nombre Completo" className="form-control mb-2" value={formData.nombre_completo} onChange={handleChange} required />
                  <input type="email" name="correo" placeholder="Correo" className="form-control mb-2" value={formData.correo} onChange={handleChange} required />
                  <input type="password" name="password" placeholder="Contraseña" className="form-control mb-2" value={formData.password} onChange={handleChange} required />
                  <select name="rol_id" className="form-control mb-2" value={formData.rol_id} onChange={handleChange} required>
                    <option value="">Seleccione Rol</option>
                    <option value="1">Administrador</option>
                    <option value="2">Veterinario</option>
                  </select>
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
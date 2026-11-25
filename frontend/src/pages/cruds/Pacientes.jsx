import { useState } from 'react';

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([
    { id: 1, nombre: 'Max', cliente_id: '1', especie_raza_id: '1', fecha_nacimiento: '2020-05-10', sexo: 'M' }
  ]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', cliente_id: '', especie_raza_id: '', fecha_nacimiento: '', sexo: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setPacientes([...pacientes, { ...formData, id: Date.now() }]);
    setMostrarModal(false);
    setFormData({ nombre: '', cliente_id: '', especie_raza_id: '', fecha_nacimiento: '', sexo: '' });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Pacientes</h2>
        <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>Nuevo Paciente</button>
      </div>
      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>Nombre</th><th>ID Cliente</th><th>ID Especie/Raza</th><th>Nacimiento</th><th>Sexo</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {pacientes.map(paciente => (
            <tr key={paciente.id}>
              <td>{paciente.nombre}</td><td>{paciente.cliente_id}</td><td>{paciente.especie_raza_id}</td><td>{paciente.fecha_nacimiento}</td><td>{paciente.sexo}</td>
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
                <h5 className="modal-title">Formulario Paciente</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" name="nombre" placeholder="Nombre Mascota" className="form-control mb-2" value={formData.nombre} onChange={handleChange} required />
                  <select name="cliente_id" className="form-control mb-2" value={formData.cliente_id} onChange={handleChange} required>
                    <option value="">Seleccione Cliente</option>
                    <option value="1">Juan Pérez</option>
                  </select>
                  <select name="especie_raza_id" className="form-control mb-2" value={formData.especie_raza_id} onChange={handleChange} required>
                    <option value="">Seleccione Especie/Raza</option>
                    <option value="1">Perro - Golden Retriever</option>
                  </select>
                  <input type="date" name="fecha_nacimiento" className="form-control mb-2" value={formData.fecha_nacimiento} onChange={handleChange} required />
                  <select name="sexo" className="form-control mb-2" value={formData.sexo} onChange={handleChange} required>
                    <option value="">Seleccione Sexo</option>
                    <option value="M">Macho</option>
                    <option value="H">Hembra</option>
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
import { useState } from 'react';

export default function EspeciesRazas() {
  const [especiesRazas, setEspeciesRazas] = useState([
    { id: 1, especie: 'Perro', raza: 'Golden Retriever' }
  ]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState({ especie: '', raza: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setEspeciesRazas([...especiesRazas, { ...formData, id: Date.now() }]);
    setMostrarModal(false);
    setFormData({ especie: '', raza: '' });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Especies y Razas</h2>
        <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>Nueva Especie/Raza</button>
      </div>
      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>Especie</th><th>Raza</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {especiesRazas.map(item => (
            <tr key={item.id}>
              <td>{item.especie}</td><td>{item.raza}</td>
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
                <h5 className="modal-title">Formulario Especie/Raza</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" name="especie" placeholder="Especie" className="form-control mb-2" value={formData.especie} onChange={handleChange} required />
                  <input type="text" name="raza" placeholder="Raza" className="form-control mb-2" value={formData.raza} onChange={handleChange} required />
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
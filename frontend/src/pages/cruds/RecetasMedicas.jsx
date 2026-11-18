import { useState } from 'react';

export default function RecetasMedicas() {
  const [recetas, setRecetas] = useState([
    { id: 1, ficha_medica_id: '1', medicamentos: 'Meloxicam 5mg', indicaciones: '1 al día' }
  ]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState({ ficha_medica_id: '', medicamentos: '', indicaciones: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setRecetas([...recetas, { ...formData, id: Date.now() }]);
    setMostrarModal(false);
    setFormData({ ficha_medica_id: '', medicamentos: '', indicaciones: '' });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Recetas Médicas</h2>
        <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>Nueva Receta</button>
      </div>
      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>ID Ficha Médica</th><th>Medicamentos</th><th>Indicaciones</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {recetas.map(receta => (
            <tr key={receta.id}>
              <td>{receta.ficha_medica_id}</td><td>{receta.medicamentos}</td><td>{receta.indicaciones}</td>
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
                <h5 className="modal-title">Formulario Receta Médica</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <select name="ficha_medica_id" className="form-control mb-2" value={formData.ficha_medica_id} onChange={handleChange} required>
                    <option value="">Seleccione Ficha Médica</option>
                    <option value="1">Ficha #1</option>
                  </select>
                  <input type="text" name="medicamentos" placeholder="Medicamentos" className="form-control mb-2" value={formData.medicamentos} onChange={handleChange} required />
                  <input type="text" name="indicaciones" placeholder="Indicaciones" className="form-control mb-2" value={formData.indicaciones} onChange={handleChange} required />
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
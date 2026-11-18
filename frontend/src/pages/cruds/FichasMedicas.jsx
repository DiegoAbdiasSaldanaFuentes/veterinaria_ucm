import { useState } from 'react';

export default function FichasMedicas() {
  const [fichas, setFichas] = useState([
    { id: 1, paciente_id: '1', veterinario_id: '1', diagnostico: 'Sano', observaciones: 'Ninguna' }
  ]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState({ paciente_id: '', veterinario_id: '', diagnostico: '', observaciones: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFichas([...fichas, { ...formData, id: Date.now() }]);
    setMostrarModal(false);
    setFormData({ paciente_id: '', veterinario_id: '', diagnostico: '', observaciones: '' });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Fichas Médicas</h2>
        <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>Nueva Ficha</button>
      </div>
      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>ID Paciente</th><th>ID Veterinario</th><th>Diagnóstico</th><th>Observaciones</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {fichas.map(ficha => (
            <tr key={ficha.id}>
              <td>{ficha.paciente_id}</td><td>{ficha.veterinario_id}</td><td>{ficha.diagnostico}</td><td>{ficha.observaciones}</td>
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
                <h5 className="modal-title">Formulario Ficha Médica</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <select name="paciente_id" className="form-control mb-2" value={formData.paciente_id} onChange={handleChange} required>
                    <option value="">Seleccione Paciente</option>
                    <option value="1">Max</option>
                  </select>
                  <select name="veterinario_id" className="form-control mb-2" value={formData.veterinario_id} onChange={handleChange} required>
                    <option value="">Seleccione Veterinario</option>
                    <option value="1">Dr. Carlos</option>
                  </select>
                  <input type="text" name="diagnostico" placeholder="Diagnóstico" className="form-control mb-2" value={formData.diagnostico} onChange={handleChange} required />
                  <input type="text" name="observaciones" placeholder="Observaciones" className="form-control mb-2" value={formData.observaciones} onChange={handleChange} required />
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
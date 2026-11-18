import { useState } from 'react';

export default function Servicios() {
  const [servicios, setServicios] = useState([
    { id: 1, nombre_servicio: 'Consulta General', descripcion: 'Chequeo básico', costo_base: 15000 }
  ]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState({ nombre_servicio: '', descripcion: '', costo_base: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setServicios([...servicios, { ...formData, id: Date.now() }]);
    setMostrarModal(false);
    setFormData({ nombre_servicio: '', descripcion: '', costo_base: '' });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Servicios</h2>
        <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>Nuevo Servicio</button>
      </div>
      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>Servicio</th><th>Descripción</th><th>Costo Base</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {servicios.map(servicio => (
            <tr key={servicio.id}>
              <td>{servicio.nombre_servicio}</td><td>{servicio.descripcion}</td><td>{servicio.costo_base}</td>
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
                <h5 className="modal-title">Formulario Servicio</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" name="nombre_servicio" placeholder="Nombre Servicio" className="form-control mb-2" value={formData.nombre_servicio} onChange={handleChange} required />
                  <input type="text" name="descripcion" placeholder="Descripción" className="form-control mb-2" value={formData.descripcion} onChange={handleChange} required />
                  <input type="number" name="costo_base" placeholder="Costo Base" className="form-control mb-2" value={formData.costo_base} onChange={handleChange} required />
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
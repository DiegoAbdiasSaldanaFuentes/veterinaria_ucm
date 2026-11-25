import { useState, useEffect } from 'react';
import { obtenerVacunaciones, registrarVacunacion } from '../../services/vacunacionService';

export default function GestorVacunacion() {
  const pacientesMock = [
    { id: 1, nombre: 'Max (Dueño: Juan Pérez)' },
    { id: 2, nombre: 'Luna (Dueña: María Gómez)' }
  ];

  const vacunasMock = [
    { id: 101, nombre: 'Vacuna Antirrábica' },
    { id: 102, nombre: 'Vacuna Óctuple' }
  ];

  const [historial, setHistorial] = useState([]);
  const [formData, setFormData] = useState({
    paciente_id: '',
    producto_id: '',
    fecha_aplicacion: '',
    fecha_proxima_dosis: '',
    observaciones: ''
  });

  useEffect(() => {
    obtenerVacunaciones().then(res => {
      if (res.success) setHistorial(res.data);
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      paciente_id: parseInt(formData.paciente_id),
      producto_id: parseInt(formData.producto_id),
      fecha_aplicacion: formData.fecha_aplicacion,
      fecha_proxima_dosis: formData.fecha_proxima_dosis,
      observaciones: formData.observaciones
    };

    const res = await registrarVacunacion(payload);
    if (res.success) {
      const paciente = pacientesMock.find(p => p.id === payload.paciente_id);
      const vacuna = vacunasMock.find(v => v.id === payload.producto_id);
      setHistorial([
        ...historial,
        {
          ...res.data,
          paciente_nombre: paciente ? paciente.nombre : payload.paciente_id,
          vacuna_nombre: vacuna ? vacuna.nombre : payload.producto_id
        }
      ]);
      setFormData({
        paciente_id: '',
        producto_id: '',
        fecha_aplicacion: '',
        fecha_proxima_dosis: '',
        observaciones: ''
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Registro de Vacunación</h2>

      <div className="card shadow-sm p-4 mb-4" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label text-secondary">Paciente</label>
              <select className="form-select" name="paciente_id" value={formData.paciente_id} onChange={handleChange} required>
                <option value="">Seleccione Paciente...</option>
                {pacientesMock.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label text-secondary">Vacuna (Producto)</label>
              <select className="form-select" name="producto_id" value={formData.producto_id} onChange={handleChange} required>
                <option value="">Seleccione Vacuna...</option>
                {vacunasMock.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label text-secondary">Fecha de Aplicación</label>
              <input type="date" className="form-control" name="fecha_aplicacion" value={formData.fecha_aplicacion} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label text-secondary">Fecha Próxima Dosis</label>
              <input type="date" className="form-control" name="fecha_proxima_dosis" value={formData.fecha_proxima_dosis} onChange={handleChange} required />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary">Observaciones</label>
            <textarea className="form-control" name="observaciones" rows="2" value={formData.observaciones} onChange={handleChange}></textarea>
          </div>

          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary">Registrar Vacunación</button>
          </div>
        </form>
      </div>

      <div className="card shadow-sm p-4">
        <h5 className="mb-3">Historial de Vacunaciones</h5>
        <table className="table table-striped">
          <thead className="table-dark">
            <tr>
              <th>Paciente</th>
              <th>Vacuna</th>
              <th>Fecha Aplicación</th>
              <th>Próxima Dosis</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {historial.map(item => (
              <tr key={item.id}>
                <td>{item.paciente_nombre}</td>
                <td>{item.vacuna_nombre}</td>
                <td>{item.fecha_aplicacion}</td>
                <td>{item.fecha_proxima_dosis}</td>
                <td>{item.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
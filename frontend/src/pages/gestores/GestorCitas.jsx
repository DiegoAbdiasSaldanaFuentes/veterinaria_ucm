import { useState } from 'react';

export default function GestorCitas() {
  const pacientesMock = [
    { id: 1, nombre: 'Max (Dueño: Juan Pérez)' },
    { id: 2, nombre: 'Luna (Dueña: María Gómez)' }
  ];
  
  const veterinariosMock = [
    { id: 1, nombre: 'Dr. Carlos Castro' },
    { id: 2, nombre: 'Dra. Andrea Muñoz' }
  ];

  const [formData, setFormData] = useState({
    paciente_id: '',
    veterinario_id: '',
    fecha: '',
    hora: '',
    motivo: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const agendarCita = (e) => {
    e.preventDefault();

    // ESTRUCTURA DE CONTRATO HTTP
    const payload = {
      paciente_id: parseInt(formData.paciente_id),
      veterinario_id: parseInt(formData.veterinario_id),
      fecha_hora: `${formData.fecha} ${formData.hora}`,
      motivo: formData.motivo
    };

    console.log("Enviando POST a /api/citas:", payload);
    alert("Solicitud enviada. Oracle validará la disponibilidad mediante un Procedimiento Almacenado.");
    
    setFormData({ paciente_id: '', veterinario_id: '', fecha: '', hora: '', motivo: '' });
  };

  return (
    <div>
      <h2 className="mb-4">Agendamiento de Citas</h2>

      <div className="card shadow-sm p-4" style={{ maxWidth: '600px' }}>
        <form onSubmit={agendarCita}>
          <div className="mb-3">
            <label className="form-label text-secondary">Paciente</label>
            <select className="form-select" name="paciente_id" value={formData.paciente_id} onChange={handleChange} required>
              <option value="">Seleccione Paciente...</option>
              {pacientesMock.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary">Veterinario Solicitado</label>
            <select className="form-select" name="veterinario_id" value={formData.veterinario_id} onChange={handleChange} required>
              <option value="">Seleccione Veterinario...</option>
              {veterinariosMock.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
            </select>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label text-secondary">Fecha</label>
              <input type="date" className="form-control" name="fecha" value={formData.fecha} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label text-secondary">Hora</label>
              <input type="time" className="form-control" name="hora" value={formData.hora} onChange={handleChange} required />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary">Motivo de la Consulta</label>
            <input type="text" className="form-control" name="motivo" value={formData.motivo} onChange={handleChange} placeholder="Ej: Vacunación anual" required />
          </div>

          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary">Agendar Cita</button>
          </div>
        </form>
      </div>
    </div>
  );
}
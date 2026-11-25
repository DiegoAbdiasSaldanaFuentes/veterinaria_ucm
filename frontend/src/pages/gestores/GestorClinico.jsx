import { useState } from 'react';

export default function GestorClinico() {
  const pacientesMock = [
    { id: 1, nombre: 'Max (Golden Retriever) - Dueño: Juan Pérez' },
    { id: 2, nombre: 'Luna (Gato Siamés) - Dueña: María Gómez' }
  ];
  
  const veterinariosMock = [
    { id: 1, nombre: 'Dr. Carlos Castro (Veterinario Jefe)' },
    { id: 2, nombre: 'Dra. Andrea Muñoz (Especialista)' }
  ];

  const serviciosMock = [
    { id: 1, nombre: 'Consulta General', costo: 15000 },
    { id: 2, nombre: 'Vacunación Antirrábica', costo: 12000 },
    { id: 3, nombre: 'Control Sano', costo: 10000 }
  ];

  const [formData, setFormData] = useState({
    paciente_id: '',
    veterinario_id: '',
    servicio_id: '',
    peso: '',
    diagnostico: '',
    tratamiento: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const registrarConsulta = (e) => {
    e.preventDefault();
    
    const payload = {
      paciente_id: parseInt(formData.paciente_id),
      veterinario_id: parseInt(formData.veterinario_id),
      servicio_id: parseInt(formData.servicio_id),
      peso_kg: parseFloat(formData.peso),
      diagnostico: formData.diagnostico,
      tratamiento: formData.tratamiento
    };

    console.log("Enviando POST a /api/fichas-clinicas:", payload);
    alert("Atención enviada. Oracle ejecutará el procedimiento PROC_CREAR_FICHA_CLINICA.");
    
    // Limpiar formulario
    setFormData({ paciente_id: '', veterinario_id: '', servicio_id: '', peso: '', diagnostico: '', tratamiento: '' });
  };

  return (
    <div>
      <h2 className="mb-4">Gestión Clínica (Nueva Atención)</h2>
      
      <div className="card shadow-sm p-4" style={{ maxWidth: '800px' }}>
        <form onSubmit={registrarConsulta}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label text-secondary">Paciente (Mascota)</label>
              <select className="form-select" name="paciente_id" value={formData.paciente_id} onChange={handleChange} required>
                <option value="">Seleccione Paciente...</option>
                {pacientesMock.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label text-secondary">Veterinario Tratante</label>
              <select className="form-select" name="veterinario_id" value={formData.veterinario_id} onChange={handleChange} required>
                <option value="">Seleccione Veterinario...</option>
                {veterinariosMock.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label text-secondary">Servicio Realizado</label>
              <select className="form-select" name="servicio_id" value={formData.servicio_id} onChange={handleChange} required>
                <option value="">Seleccione Servicio...</option>
                {serviciosMock.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label text-secondary">Peso Actual (Kg)</label>
              <input type="number" step="0.1" min="0.1" className="form-control" name="peso" value={formData.peso} onChange={handleChange} placeholder="Ej: 4.5" required />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary">Diagnóstico / Anamnesis</label>
            <textarea className="form-control" name="diagnostico" rows="3" value={formData.diagnostico} onChange={handleChange} required></textarea>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary">Tratamiento Indicado (Receta)</label>
            <textarea className="form-control" name="tratamiento" rows="3" value={formData.tratamiento} onChange={handleChange}></textarea>
          </div>

          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-success btn-lg">Registrar Ficha Clínica</button>
          </div>
        </form>
      </div>
    </div>
  );
}
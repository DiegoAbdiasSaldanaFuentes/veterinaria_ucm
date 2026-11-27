import { useState, useEffect } from 'react';
import { getPacientes, getServicios, getUsuarios } from '../../services/mantenedoresService';
import { crearBloqueAgenda, getBloquesDisponibles, getCitas, reservarCita, actualizarEstadoCita } from '../../services/gestoresService';

export default function GestorCitas() {
  const [veterinarios, setVeterinarios] = useState([]);
  const [horario, setHorario] = useState({ veterinario: '', fecha: '', hora: '' });
  const [guardandoBloque, setGuardandoBloque] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [bloques, setBloques] = useState([]);
  const [citas, setCitas] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [formData, setFormData] = useState({
    id_paciente: '',
    id_servicio: '',
    id_bloque: '',
    motivo: '',
  });

  const cargar = async () => {
    try {
      const [resPa, resSe, resBl, resCi] = await Promise.all([
        getPacientes(),
        getServicios(),
        getBloquesDisponibles(),
        getCitas(),
      ]);
      if (resPa.success) setPacientes(resPa.data);
      if (resSe.success) setServicios(resSe.data.filter((s) => s.activo === 1));
      if (resBl.success) setBloques(resBl.data);
      if (resCi.success) setCitas(resCi.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  useEffect(() => {
    let activo = true;
    Promise.all([getPacientes(), getServicios(), getBloquesDisponibles(), getCitas()])
      .then(([resPa, resSe, resBl, resCi]) => {
        if (!activo) return;
        if (resPa.success) setPacientes(resPa.data);
        if (resSe.success) setServicios(resSe.data.filter((s) => s.activo === 1));
        if (resBl.success) setBloques(resBl.data);
        if (resCi.success) setCitas(resCi.data);
      })
      .catch((err) => {
        if (activo) setMensaje({ tipo: 'danger', texto: err.message });
      });
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;
    getUsuarios().then(({ data }) => {
      if (activo) setVeterinarios(data.filter((u) => u.activo === 1 && /veterinari/i.test(u.nombre_rol)));
    }).catch((err) => {
      if (activo) setMensaje({ tipo: 'danger', texto: err.message });
    });
    return () => { activo = false; };
  }, []);

  const guardarBloque = async (e) => {
    e.preventDefault();
    const fechaHora = `${horario.fecha}T${horario.hora}`;
    if (!/:(00|30)$/.test(horario.hora) || new Date(fechaHora) <= new Date()) {
      setMensaje({ tipo: 'danger', texto: 'El bloque debe ser futuro y comenzar en punto o a la media hora.' });
      return;
    }

    setGuardandoBloque(true);
    try {
      const res = await crearBloqueAgenda({
        id_veterinario: Number(horario.veterinario),
        fecha_hora_inicio: fechaHora,
      });
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) {
        setHorario((anterior) => ({ ...anterior, hora: '' }));
        await cargar();
      }
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    } finally {
      setGuardandoBloque(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const agendarCita = async (e) => {
    e.preventDefault();
    const pac = pacientes.find((p) => p.id_paciente === Number(formData.id_paciente));
    const srv = servicios.find((s) => s.id_servicio === Number(formData.id_servicio));

    try {
      const res = await reservarCita({
        id_bloque: Number(formData.id_bloque),
        id_paciente: Number(formData.id_paciente),
        paciente_nombre: pac ? pac.nombre_paciente : '',
        dueno_nombre: pac ? pac.dueno : '',
        id_servicio: Number(formData.id_servicio),
        servicio_nombre: srv ? srv.nombre_servicio : '',
        motivo: formData.motivo,
      });
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) {
        setFormData({ id_paciente: '', id_servicio: '', id_bloque: '', motivo: '' });
        cargar();
      }
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  const cambiarEstado = async (idCita, estado) => {
    try {
      const res = await actualizarEstadoCita(idCita, estado);
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) cargar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Agendamiento de Citas</h2>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <details className="card shadow-sm p-3 mb-4" style={{ maxWidth: '650px' }}>
        <summary className="fw-semibold">Configurar bloque de agenda</summary>
        <form className="mt-3" onSubmit={guardarBloque}>
          <label className="form-label" htmlFor="bloque-vet">Veterinario</label>
          <select id="bloque-vet" className="form-select mb-3" value={horario.veterinario} onChange={(e) => setHorario({ ...horario, veterinario: e.target.value })} required>
            <option value="">{veterinarios.length ? 'Selecciona un veterinario' : 'No hay veterinarios activos'}</option>
            {veterinarios.map((v) => <option key={v.id_usuario} value={v.id_usuario}>{v.nombres} {v.apellidos}</option>)}
          </select>
          <label className="form-label" htmlFor="bloque-fecha">Fecha</label>
          <input id="bloque-fecha" type="date" className="form-control mb-3" value={horario.fecha} onChange={(e) => setHorario({ ...horario, fecha: e.target.value })} required />
          <label className="form-label" htmlFor="bloque-hora">Hora de inicio (:00 o :30)</label>
          <input id="bloque-hora" type="time" step="1800" className="form-control mb-3" value={horario.hora} onChange={(e) => setHorario({ ...horario, hora: e.target.value })} required />
          <button className="btn btn-outline-primary" disabled={guardandoBloque || !veterinarios.length}>Guardar bloque</button>
        </form>
      </details>

      <div className="card shadow-sm p-4 mb-4" style={{ maxWidth: '650px' }}>
        <form onSubmit={agendarCita}>
          <div className="mb-3">
            <label className="form-label text-secondary">Paciente</label>
            <select className="form-select" name="id_paciente" value={formData.id_paciente} onChange={handleChange} required>
              <option value="">Seleccione Paciente...</option>
              {pacientes.map((p) => (
                <option key={p.id_paciente} value={p.id_paciente}>
                  {p.nombre_paciente} ({p.nombre_especie}) - Dueño: {p.dueno}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary">Servicio</label>
            <select className="form-select" name="id_servicio" value={formData.id_servicio} onChange={handleChange} required>
              <option value="">Seleccione Servicio...</option>
              {servicios.map((s) => (
                <option key={s.id_servicio} value={s.id_servicio}>{s.nombre_servicio}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary">Bloque Disponible (Veterinario / Fecha y Hora)</label>
            <select className="form-select" name="id_bloque" value={formData.id_bloque} onChange={handleChange} required>
              <option value="">{bloques.length ? 'Selecciona un bloque' : 'No hay bloques disponibles. Configura un bloque arriba.'}</option>
              {bloques.map((b) => (
                <option key={b.id_bloque} value={b.id_bloque}>
                  {b.fecha_hora_inicio} — {b.veterinario}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary">Motivo de la Consulta</label>
            <input type="text" className="form-control" name="motivo" value={formData.motivo} onChange={handleChange} placeholder="Ej: Vacunación anual" />
          </div>

          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary" disabled={!bloques.length}>Agendar Cita</button>
          </div>
        </form>
      </div>

      <div className="card shadow-sm p-3">
        <h5 className="mb-3">Citas Registradas</h5>
        <table className="table table-striped table-sm">
          <thead className="table-dark">
            <tr><th>Fecha/Hora</th><th>Paciente</th><th>Servicio</th><th>Veterinario</th><th>Estado</th><th>Cambiar Estado</th></tr>
          </thead>
          <tbody>
            {citas.map((c) => (
              <tr key={c.id_cita}>
                <td>{c.fecha_hora_inicio}</td>
                <td>{c.nombre_paciente}</td>
                <td>{c.nombre_servicio}</td>
                <td>{c.veterinario}</td>
                <td><span className="badge bg-info text-dark">{c.estado}</span></td>
                <td>
                  <select
                    className="form-select form-select-sm"
                    value={c.estado}
                    onChange={(e) => cambiarEstado(c.id_cita, e.target.value)}
                  >
                    <option value="RESERVADA">RESERVADA</option>
                    <option value="ATENDIDA">ATENDIDA</option>
                    <option value="CANCELADA">CANCELADA</option>
                    <option value="NO_ASISTIO">NO_ASISTIO</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
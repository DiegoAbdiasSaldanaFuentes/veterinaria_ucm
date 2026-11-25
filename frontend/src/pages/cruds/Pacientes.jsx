import { useState, useEffect } from 'react';
import { getPacientes, crearPaciente, actualizarPaciente, eliminarPaciente, getClientes, getEspecies } from '../../services/mantenedoresService';

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [formData, setFormData] = useState({ id_cliente: '', id_especie: '', nombre_paciente: '', fecha_nacimiento: '' });

  const cargar = async () => {
    try {
      const [resPa, resCl, resEs] = await Promise.all([getPacientes(), getClientes(), getEspecies()]);
      if (resPa.success) setPacientes(resPa.data);
      if (resCl.success) setClientes(resCl.data);
      if (resEs.success) setEspecies(resEs.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => {
    setEditId(null);
    setFormData({ id_cliente: '', id_especie: '', nombre_paciente: '', fecha_nacimiento: '' });
    setMostrarModal(true);
  };

  const abrirEditar = (p) => {
    setEditId(p.id_paciente);
    setFormData({
      id_cliente: p.id_cliente,
      id_especie: p.id_especie,
      nombre_paciente: p.nombre_paciente,
      fecha_nacimiento: p.fecha_nacimiento ? String(p.fecha_nacimiento).slice(0, 10) : '',
    });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editId
        ? await actualizarPaciente(editId, formData)
        : await crearPaciente(formData);
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) {
        setMostrarModal(false);
        cargar();
      }
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este paciente?')) return;
    try {
      const res = await eliminarPaciente(id);
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) cargar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Pacientes</h2>
        <button className="btn btn-primary" onClick={abrirNuevo}>Nuevo Paciente</button>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>Nombre</th><th>Especie</th><th>Dueño</th><th>Nacimiento</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {pacientes.map((p) => (
            <tr key={p.id_paciente}>
              <td>{p.nombre_paciente}</td>
              <td>{p.nombre_especie}</td>
              <td>{p.dueno}</td>
              <td>{p.fecha_nacimiento ? String(p.fecha_nacimiento).slice(0, 10) : '-'}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => abrirEditar(p)}>Editar</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(p.id_paciente)}>Eliminar</button>
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
                <h5 className="modal-title">{editId ? 'Editar Paciente' : 'Nuevo Paciente'}</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" placeholder="Nombre Mascota" className="form-control mb-2" value={formData.nombre_paciente} onChange={(e) => setFormData({ ...formData, nombre_paciente: e.target.value })} required />
                  <select className="form-select mb-2" value={formData.id_cliente} onChange={(e) => setFormData({ ...formData, id_cliente: e.target.value })} required>
                    <option value="">Seleccione Dueño (Cliente)</option>
                    {clientes.map((c) => <option key={c.id_cliente} value={c.id_cliente}>{c.nombres} {c.apellidos}</option>)}
                  </select>
                  <select className="form-select mb-2" value={formData.id_especie} onChange={(e) => setFormData({ ...formData, id_especie: e.target.value })} required>
                    <option value="">Seleccione Especie</option>
                    {especies.map((es) => <option key={es.id_especie} value={es.id_especie}>{es.nombre_especie}</option>)}
                  </select>
                  <input type="date" className="form-control mb-2" value={formData.fecha_nacimiento} onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })} />
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
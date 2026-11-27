import { useState, useEffect } from 'react';
import { getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario, getRoles } from '../../services/mantenedoresService';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [formData, setFormData] = useState({
    id_rol: '',
    nombre_usuario: '',
    clave: '',
    nombres: '',
    apellidos: '',
    activo: 1,
  });

  const cargar = async () => {
    try {
      const [resU, resR] = await Promise.all([getUsuarios(), getRoles()]);
      if (resU.success) setUsuarios(resU.data);
      if (resR.success) setRoles(resR.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  useEffect(() => {
    let activo = true;
    Promise.all([getUsuarios(), getRoles()])
      .then(([resU, resR]) => {
        if (!activo) return;
        if (resU.success) setUsuarios(resU.data);
        if (resR.success) setRoles(resR.data);
      })
      .catch((err) => {
        if (activo) setMensaje({ tipo: 'danger', texto: err.message });
      });
    return () => {
      activo = false;
    };
  }, []);

  const abrirNuevo = () => {
    setEditId(null);
    setFormData({ id_rol: roles[0]?.id_rol || '', nombre_usuario: '', clave: '', nombres: '', apellidos: '', activo: 1 });
    setMostrarModal(true);
  };

  const abrirEditar = (u) => {
    setEditId(u.id_usuario);
    setFormData({
      id_rol: u.id_rol,
      nombre_usuario: u.nombre_usuario,
      clave: '',
      nombres: u.nombres,
      apellidos: u.apellidos,
      activo: u.activo ?? 1,
    });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = editId
        ? { ...formData, clave: formData.clave || null }
        : formData;
      const res = editId
        ? await actualizarUsuario(editId, payload)
        : await crearUsuario(payload);
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
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      const res = await eliminarUsuario(id);
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) cargar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Usuarios</h2>
        <button className="btn btn-primary" onClick={abrirNuevo}>Nuevo Usuario</button>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>Usuario</th><th>Nombres</th><th>Apellidos</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id_usuario}>
              <td>{u.nombre_usuario}</td>
              <td>{u.nombres}</td>
              <td>{u.apellidos}</td>
              <td>{u.nombre_rol}</td>
              <td>
                <span className={`badge ${u.activo === 1 ? 'bg-success' : 'bg-secondary'}`}>
                  {u.activo === 1 ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => abrirEditar(u)}>Editar</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(u.id_usuario)}>Eliminar</button>
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
                <h5 className="modal-title">{editId ? 'Editar Usuario' : 'Nuevo Usuario'}</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" placeholder="Nombre de usuario" className="form-control mb-2" value={formData.nombre_usuario} onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })} disabled={!!editId} required />
                  <input type="text" placeholder="Nombres" className="form-control mb-2" value={formData.nombres} onChange={(e) => setFormData({ ...formData, nombres: e.target.value })} required />
                  <input type="text" placeholder="Apellidos" className="form-control mb-2" value={formData.apellidos} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} required />
                  {!editId && (
                    <input type="password" placeholder="Contraseña" className="form-control mb-2" value={formData.clave} onChange={(e) => setFormData({ ...formData, clave: e.target.value })} required />
                  )}
                  <select className="form-select mb-2" value={formData.id_rol} onChange={(e) => setFormData({ ...formData, id_rol: e.target.value })} required>
                    <option value="">Seleccione Rol</option>
                    {roles.map((r) => <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>)}
                  </select>
                  {editId && (
                    <select className="form-select" value={formData.activo} onChange={(e) => setFormData({ ...formData, activo: Number(e.target.value) })}>
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  )}
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

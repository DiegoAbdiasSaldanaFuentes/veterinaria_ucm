import { useState, useEffect } from 'react';
import { getRoles, crearRol, actualizarRol, eliminarRol } from '../../services/mantenedoresService';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nombreRol, setNombreRol] = useState('');
  const [mensaje, setMensaje] = useState(null);

  const cargar = async () => {
    try {
      const res = await getRoles();
      if (res.success) setRoles(res.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  useEffect(() => {
    let activo = true;
    getRoles()
      .then((res) => {
        if (activo && res.success) setRoles(res.data);
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
    setNombreRol('');
    setMostrarModal(true);
  };

  const abrirEditar = (rol) => {
    setEditId(rol.id_rol);
    setNombreRol(rol.nombre_rol);
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editId
        ? await actualizarRol(editId, { nombre_rol: nombreRol })
        : await crearRol({ nombre_rol: nombreRol });
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
    if (!window.confirm('¿Eliminar este rol?')) return;
    try {
      const res = await eliminarRol(id);
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) cargar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Roles</h2>
        <button className="btn btn-primary" onClick={abrirNuevo}>Nuevo Rol</button>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>ID</th><th>Nombre Rol</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {roles.map((rol) => (
            <tr key={rol.id_rol}>
              <td>{rol.id_rol}</td>
              <td>{rol.nombre_rol}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => abrirEditar(rol)}>Editar</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(rol.id_rol)}>Eliminar</button>
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
                <h5 className="modal-title">{editId ? 'Editar Rol' : 'Nuevo Rol'}</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" placeholder="Nombre del rol (ej: Veterinario)" className="form-control" value={nombreRol} onChange={(e) => setNombreRol(e.target.value)} required />
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
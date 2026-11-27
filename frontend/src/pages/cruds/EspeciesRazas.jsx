import { useState, useEffect } from 'react';
import { getEspecies, crearEspecie, actualizarEspecie, eliminarEspecie } from '../../services/mantenedoresService';

export default function EspeciesRazas() {
  const [especies, setEspecies] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nombreEspecie, setNombreEspecie] = useState('');
  const [mensaje, setMensaje] = useState(null);

  const cargar = async () => {
    try {
      const res = await getEspecies();
      if (res.success) setEspecies(res.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

useEffect(() => {
    let activo = true;
    getEspecies()
      .then((res) => {
        if (activo && res.success) setEspecies(res.data);
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
    setNombreEspecie('');
    setMostrarModal(true);
  };

  const abrirEditar = (item) => {
    setEditId(item.id_especie);
    setNombreEspecie(item.nombre_especie);
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editId
        ? await actualizarEspecie(editId, { nombre_especie: nombreEspecie })
        : await crearEspecie({ nombre_especie: nombreEspecie });
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
    if (!window.confirm('¿Eliminar esta especie?')) return;
    try {
      const res = await eliminarEspecie(id);
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) cargar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Especies</h2>
        <button className="btn btn-primary" onClick={abrirNuevo}>Nueva Especie</button>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>ID</th><th>Nombre Especie</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {especies.map((item) => (
            <tr key={item.id_especie}>
              <td>{item.id_especie}</td>
              <td>{item.nombre_especie}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => abrirEditar(item)}>Editar</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(item.id_especie)}>Eliminar</button>
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
                <h5 className="modal-title">{editId ? 'Editar Especie' : 'Nueva Especie'}</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" placeholder="Nombre de la especie (ej: Canino)" className="form-control" value={nombreEspecie} onChange={(e) => setNombreEspecie(e.target.value)} required />
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
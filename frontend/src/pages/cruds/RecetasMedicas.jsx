import { useState, useEffect } from 'react';
import { getRecetas, actualizarReceta, eliminarReceta, getProductos } from '../../services/mantenedoresService';

export default function RecetasMedicas() {
  const [recetas, setRecetas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [formData, setFormData] = useState({ id_producto: '', indicaciones: '' });

  const cargar = async () => {
    try {
      const [resR, resP] = await Promise.all([getRecetas(), getProductos()]);
      if (resR.success) setRecetas(resR.data);
      if (resP.success) setProductos(resP.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  useEffect(() => {
    let activo = true;
    Promise.all([getRecetas(), getProductos()])
      .then(([resR, resP]) => {
        if (!activo) return;
        if (resR.success) setRecetas(resR.data);
        if (resP.success) setProductos(resP.data);
      })
      .catch((err) => {
        if (activo) setMensaje({ tipo: 'danger', texto: err.message });
      });
    return () => {
      activo = false;
    };
  }, []);

  const abrirEditar = (r) => {
    setEditId(r.id_receta);
    setFormData({ id_producto: r.id_producto, indicaciones: r.indicaciones });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await actualizarReceta(editId, formData);
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
    if (!window.confirm('¿Eliminar esta receta?')) return;
    try {
      const res = await eliminarReceta(id);
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) cargar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Recetas Médicas</h2>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>Receta #</th><th>Ficha #</th><th>Paciente</th><th>Medicamento</th><th>Indicaciones</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {recetas.map((r) => (
            <tr key={r.id_receta}>
              <td>{r.id_receta}</td>
              <td>{r.id_ficha}</td>
              <td>{r.nombre_paciente}</td>
              <td>{r.medicamento}</td>
              <td>{r.indicaciones}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => abrirEditar(r)}>Editar</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(r.id_receta)}>Eliminar</button>
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
                <h5 className="modal-title">Editar Receta #{editId}</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <select className="form-select mb-2" value={formData.id_producto} onChange={(e) => setFormData({ ...formData, id_producto: e.target.value })} required>
                    <option value="">Seleccione Producto/Medicamento</option>
                    {productos.map((p) => <option key={p.id_producto} value={p.id_producto}>{p.nombre_producto}</option>)}
                  </select>
                  <input type="text" placeholder="Indicaciones" className="form-control" value={formData.indicaciones} onChange={(e) => setFormData({ ...formData, indicaciones: e.target.value })} required />
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
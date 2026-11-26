import { useState, useEffect } from 'react';
import { getProductos, crearProducto, actualizarProducto, eliminarProducto, getProveedores } from '../../services/mantenedoresService';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [formData, setFormData] = useState({
    id_proveedor: '',
    sku: '',
    nombre_producto: '',
    precio_unitario: '',
    stock: 0,
    stock_minimo: 0,
    activo: 1,
  });

  const cargar = async () => {
    try {
      const [resPr, resPv] = await Promise.all([getProductos(), getProveedores()]);
      if (resPr.success) setProductos(resPr.data);
      if (resPv.success) setProveedores(resPv.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  useEffect(() => {
    let activo = true;
    Promise.all([getProductos(), getProveedores()])
      .then(([resPr, resPv]) => {
        if (!activo) return;
        if (resPr.success) setProductos(resPr.data);
        if (resPv.success) setProveedores(resPv.data);
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
    setFormData({ id_proveedor: '', sku: '', nombre_producto: '', precio_unitario: '', stock: 0, stock_minimo: 0, activo: 1 });
    setMostrarModal(true);
  };

  const abrirEditar = (p) => {
    setEditId(p.id_producto);
    setFormData({
      id_proveedor: p.id_proveedor || '',
      sku: p.sku,
      nombre_producto: p.nombre_producto,
      precio_unitario: p.precio_unitario,
      stock: p.stock,
      stock_minimo: p.stock_minimo,
      activo: p.activo ?? 1,
    });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editId
        ? await actualizarProducto(editId, formData)
        : await crearProducto(formData);
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
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      const res = await eliminarProducto(id);
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) cargar();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Productos</h2>
        <button className="btn btn-primary" onClick={abrirNuevo}>Nuevo Producto</button>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>SKU</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Mínimo</th><th>Proveedor</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id_producto}>
              <td>{p.sku}</td>
              <td>{p.nombre_producto}</td>
              <td>${Number(p.precio_unitario).toLocaleString('es-CL')}</td>
              <td>{p.stock}</td>
              <td>{p.stock_minimo}</td>
              <td>{p.proveedor || 'SIN PROVEEDOR'}</td>
              <td>
                <span className={`badge ${p.activo === 1 ? 'bg-success' : 'bg-secondary'}`}>
                  {p.activo === 1 ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => abrirEditar(p)}>Editar</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(p.id_producto)}>Eliminar</button>
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
                <h5 className="modal-title">{editId ? 'Editar Producto' : 'Nuevo Producto'}</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" placeholder="SKU (ej: MED-001)" className="form-control mb-2" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} required />
                  <input type="text" placeholder="Nombre Producto" className="form-control mb-2" value={formData.nombre_producto} onChange={(e) => setFormData({ ...formData, nombre_producto: e.target.value })} required />
                  <input type="number" min="0" placeholder="Precio Unitario" className="form-control mb-2" value={formData.precio_unitario} onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value })} required />
                  <input type="number" min="0" placeholder="Stock" className="form-control mb-2" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
                  <input type="number" min="0" placeholder="Stock Mínimo" className="form-control mb-2" value={formData.stock_minimo} onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })} required />
                  <select className="form-select mb-2" value={formData.id_proveedor} onChange={(e) => setFormData({ ...formData, id_proveedor: e.target.value })}>
                    <option value="">Sin Proveedor</option>
                    {proveedores.map((pv) => <option key={pv.id_proveedor} value={pv.id_proveedor}>{pv.razon_social}</option>)}
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
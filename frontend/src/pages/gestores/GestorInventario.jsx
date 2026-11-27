import { useState, useEffect } from 'react';
import { getProductos, getProveedores } from '../../services/mantenedoresService';
import { ingresarStock, ajustarStock } from '../../services/gestoresService';

export default function GestorInventario() {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [mensaje, setMensaje] = useState(null);

  const [ingresoForm, setIngresoForm] = useState({ id_producto: '', cantidad: '' });
  const [ajusteForm, setAjusteForm] = useState({ id_producto: '', nuevo_stock: '', nuevo_stock_minimo: '' });

  const cargar = async () => {
    try {
      const [resPv, resPr] = await Promise.all([getProveedores(), getProductos()]);
      if (resPv.success) setProveedores(resPv.data);
      if (resPr.success) setProductos(resPr.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  useEffect(() => {
    let activo = true;
    Promise.all([getProveedores(), getProductos()])
      .then(([resPv, resPr]) => {
        if (!activo) return;
        if (resPv.success) setProveedores(resPv.data);
        if (resPr.success) setProductos(resPr.data);
      })
      .catch((err) => {
        if (activo) setMensaje({ tipo: 'danger', texto: err.message });
      });
    return () => {
      activo = false;
    };
  }, []);

  const productosFiltrados = filtroProveedor
    ? productos.filter((p) => Number(p.id_proveedor) === Number(filtroProveedor))
    : productos;

  const procesarIngreso = async (e) => {
    e.preventDefault();
    try {
      const res = await ingresarStock({
        id_producto: Number(ingresoForm.id_producto),
        cantidad: Number(ingresoForm.cantidad),
      });
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) {
        setIngresoForm({ id_producto: '', cantidad: '' });
        cargar();
      }
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  const procesarAjuste = async (e) => {
    e.preventDefault();
    try {
      const res = await ajustarStock({
        id_producto: Number(ajusteForm.id_producto),
        nuevo_stock: Number(ajusteForm.nuevo_stock),
        nuevo_stock_minimo: Number(ajusteForm.nuevo_stock_minimo),
      });
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) {
        setAjusteForm({ id_producto: '', nuevo_stock: '', nuevo_stock_minimo: '' });
        cargar();
      }
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Gestión de Inventario</h2>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h5 className="mb-3">Ingreso de Stock</h5>
            <form onSubmit={procesarIngreso}>
              <div className="mb-3">
                <label className="form-label text-secondary">Filtrar por Proveedor (visual)</label>
                <select className="form-select" value={filtroProveedor} onChange={(e) => setFiltroProveedor(e.target.value)}>
                  <option value="">Todos los Proveedores</option>
                  {proveedores.map((pv) => (
                    <option key={pv.id_proveedor} value={pv.id_proveedor}>{pv.razon_social}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary">Producto</label>
                <select className="form-select" value={ingresoForm.id_producto} onChange={(e) => setIngresoForm({ ...ingresoForm, id_producto: e.target.value })} required>
                  <option value="">Seleccione Producto...</option>
                  {productosFiltrados.map((p) => (
                    <option key={p.id_producto} value={p.id_producto}>{p.nombre_producto} (Stock actual: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary">Cantidad a Ingresar</label>
                <input type="number" min="1" className="form-control" value={ingresoForm.cantidad} onChange={(e) => setIngresoForm({ ...ingresoForm, cantidad: e.target.value })} required />
              </div>

              <button type="submit" className="btn btn-primary">Registrar Ingreso</button>
            </form>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h5 className="mb-3">Ajuste Directo de Stock y Mínimo</h5>
            <form onSubmit={procesarAjuste}>
              <div className="mb-3">
                <label className="form-label text-secondary">Producto</label>
                <select className="form-select" value={ajusteForm.id_producto} onChange={(e) => setAjusteForm({ ...ajusteForm, id_producto: e.target.value })} required>
                  <option value="">Seleccione Producto...</option>
                  {productos.map((p) => (
                    <option key={p.id_producto} value={p.id_producto}>{p.nombre_producto}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary">Nuevo Stock</label>
                <input type="number" min="0" className="form-control" value={ajusteForm.nuevo_stock} onChange={(e) => setAjusteForm({ ...ajusteForm, nuevo_stock: e.target.value })} required />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary">Nuevo Stock Mínimo</label>
                <input type="number" min="0" className="form-control" value={ajusteForm.nuevo_stock_minimo} onChange={(e) => setAjusteForm({ ...ajusteForm, nuevo_stock_minimo: e.target.value })} required />
              </div>

              <button type="submit" className="btn btn-warning">Aplicar Ajuste</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
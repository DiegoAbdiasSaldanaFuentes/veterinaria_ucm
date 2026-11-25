import { useState, useEffect } from 'react';
import { obtenerStockCritico } from '../../services/dashboardService';

export default function ControlInventario() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerStockCritico()
      .then((res) => {
        if (res.success) setItems(res.data);
        else setError(res.message);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-4">
      <h2 className="mb-4">Control de Inventario (Stock Crítico)</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card shadow-sm p-4">
        <table className="table table-striped">
          <thead className="table-danger">
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Stock</th>
              <th>Mínimo</th>
              <th>Faltante</th>
              <th>Proveedor</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="7" className="text-center">No hay productos en stock crítico</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id_producto}>
                  <td>{item.sku}</td>
                  <td>{item.nombre_producto}</td>
                  <td><strong>{item.stock}</strong></td>
                  <td>{item.stock_minimo}</td>
                  <td>{item.faltante_sugerido}</td>
                  <td>{item.proveedor}</td>
                  <td><span className="badge bg-danger">{item.estado_stock || 'CRITICO'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
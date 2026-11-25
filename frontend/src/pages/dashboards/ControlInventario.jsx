import { useState } from 'react';

export default function ControlInventario() {
  const [stockCritico] = useState([
    { id: 101, codigo: '123456789', nombre: 'Meloxicam 5mg', stock: 5 },
    { id: 104, codigo: '987654321', nombre: 'Pipeta Antipulgas', stock: 2 }
  ]);

  return (
    <div>
      <h2 className="mb-4">Control de Inventario (Stock Crítico)</h2>
      <div className="card shadow-sm p-4">
        <table className="table table-striped">
          <thead className="table-danger">
            <tr><th>Código</th><th>Producto</th><th>Stock Actual</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {stockCritico.length === 0 ? (
              <tr><td colSpan="4" className="text-center">No hay productos en stock crítico</td></tr>
            ) : (
              stockCritico.map(item => (
                <tr key={item.id}>
                  <td>{item.codigo}</td>
                  <td>{item.nombre}</td>
                  <td><strong>{item.stock}</strong></td>
                  <td><span className="badge bg-danger">Crítico</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
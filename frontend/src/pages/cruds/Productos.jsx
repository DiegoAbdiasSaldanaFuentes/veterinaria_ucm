import { useState } from 'react';

export default function Productos() {
  const [productos, setProductos] = useState([
    { id: 1, codigo_barras: '123456789', nombre: 'Meloxicam 5mg', categoria: 'Medicamento', precio_unitario: 12000, stock_actual: 5, proveedor_id: '1' }
  ]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState({ codigo_barras: '', nombre: '', categoria: '', precio_unitario: '', stock_actual: '', proveedor_id: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setProductos([...productos, { ...formData, id: Date.now() }]);
    setMostrarModal(false);
    setFormData({ codigo_barras: '', nombre: '', categoria: '', precio_unitario: '', stock_actual: '', proveedor_id: '' });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Productos</h2>
        <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>Nuevo Producto</button>
      </div>
      <table className="table table-striped">
        <thead className="table-dark">
          <tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>ID Proveedor</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {productos.map(producto => (
            <tr key={producto.id}>
              <td>{producto.codigo_barras}</td><td>{producto.nombre}</td><td>{producto.categoria}</td><td>{producto.precio_unitario}</td><td>{producto.stock_actual}</td><td>{producto.proveedor_id}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2">Editar</button>
                <button className="btn btn-sm btn-danger">Eliminar</button>
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
                <h5 className="modal-title">Formulario Producto</h5>
                <button type="button" className="btn-close" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input type="text" name="codigo_barras" placeholder="Código de Barras" className="form-control mb-2" value={formData.codigo_barras} onChange={handleChange} required />
                  <input type="text" name="nombre" placeholder="Nombre" className="form-control mb-2" value={formData.nombre} onChange={handleChange} required />
                  <input type="text" name="categoria" placeholder="Categoría" className="form-control mb-2" value={formData.categoria} onChange={handleChange} required />
                  <input type="number" name="precio_unitario" placeholder="Precio Unitario" className="form-control mb-2" value={formData.precio_unitario} onChange={handleChange} required />
                  <input type="number" name="stock_actual" placeholder="Stock Actual" className="form-control mb-2" value={formData.stock_actual} onChange={handleChange} required />
                  <select name="proveedor_id" className="form-control mb-2" value={formData.proveedor_id} onChange={handleChange} required>
                    <option value="">Seleccione Proveedor</option>
                    <option value="1">Distribuidora Vet</option>
                  </select>
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
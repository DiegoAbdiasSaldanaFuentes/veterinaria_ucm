import { useState } from 'react';

export default function GestorVentas() {

  const clientesMock = [
    { id: 1, nombre: 'Juan Pérez (11.111.111-1)' },
    { id: 2, nombre: 'María Gómez (22.222.222-2)' }
  ];
  
  const productosMock = [
    { id: 101, nombre: 'Meloxicam 5mg', precio: 12000 },
    { id: 102, nombre: 'Hueso de Goma Gde.', precio: 4500 },
    { id: 103, nombre: 'Vacuna Antirrábica', precio: 8000 }
  ];

  const [clienteId, setClienteId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [carrito, setCarrito] = useState([]);

  const agregarAlCarrito = () => {
    if (!productoId || cantidad < 1) return;
    const prodSeleccionado = productosMock.find(p => p.id === parseInt(productoId));
    
    setCarrito([...carrito, { ...prodSeleccionado, cantidad: parseInt(cantidad) }]);
    setProductoId('');
    setCantidad(1);
  };

  const procesarVenta = () => {
    if (!clienteId || carrito.length === 0) {
      alert("Seleccione un cliente y agregue productos al carrito.");
      return;
    }

    const payload = {
      cliente_id: parseInt(clienteId),
      detalle: carrito.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad
      }))
    };

    console.log("Enviando POST a /api/ventas:", payload);
    alert("Venta enviada al backend. Oracle ejecutará el Procedimiento Almacenado.");
    
    setCarrito([]);
    setClienteId('');
  };

  const totalVisual = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  return (
    <div>
      <h2 className="mb-4">Punto de Venta</h2>
      
      <div className="row">
        {/* Panel de Selección */}
        <div className="col-md-5">
          <div className="card shadow-sm p-3 mb-4">
            <h5 className="mb-3">1. Datos de la Venta</h5>
            <select className="form-select mb-3" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Seleccione un Cliente...</option>
              {clientesMock.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>

            <h5 className="mb-3 mt-4">2. Agregar Productos</h5>
            <select className="form-select mb-2" value={productoId} onChange={(e) => setProductoId(e.target.value)}>
              <option value="">Seleccione un Producto...</option>
              {productosMock.map(p => <option key={p.id} value={p.id}>{p.nombre} - ${p.precio}</option>)}
            </select>
            
            <div className="d-flex gap-2">
              <input type="number" className="form-control" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Cant." style={{ width: '100px' }} />
              <button className="btn btn-primary flex-grow-1" onClick={agregarAlCarrito}>Agregar</button>
            </div>
          </div>
        </div>

        {/* Panel del Carrito */}
        <div className="col-md-7">
          <div className="card shadow-sm p-3">
            <h5 className="mb-3">Detalle del Carrito</h5>
            <table className="table table-sm">
              <thead className="table-light">
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {carrito.length === 0 ? (
                  <tr><td colSpan="4" className="text-center text-muted">Carrito vacío</td></tr>
                ) : (
                  carrito.map((item, index) => (
                    <tr key={index}>
                      <td>{item.nombre}</td>
                      <td>{item.cantidad}</td>
                      <td>${(item.precio * item.cantidad).toLocaleString('es-CL')}</td>
                      <td>
                        <button className="btn btn-sm btn-danger text-white" onClick={() => setCarrito(carrito.filter((_, i) => i !== index))}><i className="fas fa-trash"></i> X</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
              <h4 className="mb-0">Total: ${totalVisual.toLocaleString('es-CL')}</h4>
              <button className="btn btn-success btn-lg" onClick={procesarVenta} disabled={carrito.length === 0 || !clienteId}>Procesar Venta</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
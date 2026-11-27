import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { USE_MOCKS } from '../../services/api';
import { getClientes, getProductos } from '../../services/mantenedoresService';
import { getVentas, crearVenta, agregarDetalleVenta, anularVenta } from '../../services/gestoresService';

export default function GestorVentas() {
  const { usuario } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [carrito, setCarrito] = useState([]);
  const [mensaje, setMensaje] = useState(null);

  const cargarDatos = async () => {
    try {
      const [resC, resP, resV] = await Promise.all([getClientes(), getProductos(), getVentas()]);
      if (resC.success) setClientes(resC.data);
      if (resP.success) setProductos(resP.data);
      if (resV.success) setVentas(resV.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  useEffect(() => {
    let activo = true;
    Promise.all([getClientes(), getProductos(), getVentas()])
      .then(([resC, resP, resV]) => {
        if (!activo) return;
        if (resC.success) setClientes(resC.data);
        if (resP.success) setProductos(resP.data);
        if (resV.success) setVentas(resV.data);
      })
      .catch((err) => {
        if (activo) setMensaje({ tipo: 'danger', texto: err.message });
      });
    return () => {
      activo = false;
    };
  }, []);

  const agregarAlCarrito = () => {
    const cant = Number(cantidad);
    if (!productoId || cant < 1) return;
    const prod = productos.find((p) => p.id_producto === Number(productoId));
    if (!prod) return;

    const existente = carrito.find((item) => item.id_producto === prod.id_producto);
    if (existente) {
      setCarrito(
        carrito.map((item) =>
          item.id_producto === prod.id_producto
            ? { ...item, cantidad: item.cantidad + cant }
            : item
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          id_producto: prod.id_producto,
          nombre: prod.nombre_producto,
          precio: Number(prod.precio_unitario),
          cantidad: cant,
        },
      ]);
    }
    setProductoId('');
    setCantidad(1);
  };

  const totalVisual = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const procesarVenta = async () => {
    if (carrito.length === 0) return;
    const cli = clientes.find((c) => c.id_cliente === Number(clienteId));
    const payload = {
      id_cliente: clienteId ? Number(clienteId) : null,
      cliente_nombre: cli ? `${cli.nombres} ${cli.apellidos}` : 'CONSUMIDOR FINAL',
      id_usuario: usuario?.id_usuario,
      vendedor_nombre: usuario ? `${usuario.nombres} ${usuario.apellidos}` : '',
      total_estimado: totalVisual,
      detalle: carrito.map((item) => ({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
      })),
    };

    try {
      const res = await crearVenta(payload);
      if (!res.success) {
        setMensaje({ tipo: 'danger', texto: res.message });
        return;
      }

      const idVentaCreada = res.data?.id_venta;
      if (!USE_MOCKS && idVentaCreada) {
        for (const item of carrito) {
          await agregarDetalleVenta(idVentaCreada, {
            id_producto: item.id_producto,
            cantidad: item.cantidad,
          });
        }
      }

      setMensaje({ tipo: 'success', texto: res.message || 'Venta registrada correctamente.' });
      setCarrito([]);
      setClienteId('');
      cargarDatos();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  const handleAnular = async (idVenta) => {
    if (!window.confirm(`¿Anular venta #${idVenta}?`)) return;
    try {
      const res = await anularVenta(idVenta);
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) cargarDatos();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Punto de Venta</h2>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-5">
          <div className="card shadow-sm p-3">
            <h5 className="mb-3">1. Cliente (opcional)</h5>
            <select className="form-select mb-3" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Consumidor Final</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombres} {c.apellidos} {c.rut ? `(${c.rut})` : ''}
                </option>
              ))}
            </select>

            <h5 className="mb-3 mt-2">2. Agregar Productos</h5>
            <select className="form-select mb-2" value={productoId} onChange={(e) => setProductoId(e.target.value)}>
              <option value="">Seleccione un Producto...</option>
              {productos.map((p) => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre_producto} - ${Number(p.precio_unitario).toLocaleString('es-CL')} (Stock: {p.stock})
                </option>
              ))}
            </select>

            <div className="d-flex gap-2">
              <input type="number" className="form-control" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} style={{ width: '100px' }} />
              <button type="button" className="btn btn-primary flex-grow-1" onClick={agregarAlCarrito}>Agregar</button>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card shadow-sm p-3">
            <h5 className="mb-3">Detalle del Carrito</h5>
            <table className="table table-sm">
              <thead className="table-light">
                <tr><th>Producto</th><th>Cant.</th><th>Subtotal</th><th></th></tr>
              </thead>
              <tbody>
                {carrito.length === 0 ? (
                  <tr><td colSpan="4" className="text-center text-muted">Carrito vacío</td></tr>
                ) : (
                  carrito.map((item) => (
                    <tr key={item.id_producto}>
                      <td>{item.nombre}</td>
                      <td>{item.cantidad}</td>
                      <td>${(item.precio * item.cantidad).toLocaleString('es-CL')}</td>
                      <td>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => setCarrito(carrito.filter((i) => i.id_producto !== item.id_producto))}>
                          X
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
              <h4 className="mb-0">Total: ${totalVisual.toLocaleString('es-CL')}</h4>
              <button type="button" className="btn btn-success btn-lg" onClick={procesarVenta} disabled={carrito.length === 0}>
                Procesar Venta
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm p-3">
        <h5 className="mb-3">Ventas Registradas</h5>
        <table className="table table-striped table-sm">
          <thead className="table-dark">
            <tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Vendedor</th><th>Total</th><th>Estado</th><th>Acción</th></tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.id_venta}>
                <td>{v.id_venta}</td>
                <td>{v.fecha_venta ? String(v.fecha_venta).slice(0, 16).replace('T', ' ') : '-'}</td>
                <td>{v.cliente}</td>
                <td>{v.vendedor}</td>
                <td>${Number(v.total_venta).toLocaleString('es-CL')}</td>
                <td>
                  <span className={`badge ${v.estado === 'REGISTRADA' ? 'bg-success' : 'bg-secondary'}`}>
                    {v.estado}
                  </span>
                </td>
                <td>
                  {v.estado === 'REGISTRADA' && (
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleAnular(v.id_venta)}>
                      Anular
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


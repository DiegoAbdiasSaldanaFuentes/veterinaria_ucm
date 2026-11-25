import { useState } from 'react';

export default function GestorInventario() {
  const proveedoresMock = [
    { id: 1, razon_social: 'Distribuidora Vet (77.777.777-7)' },
    { id: 2, razon_social: 'PharmaPet (88.888.888-8)' }
  ];

  const productosMock = [
    { id: 101, nombre: 'Meloxicam 5mg' },
    { id: 102, nombre: 'Hueso de Goma Gde.' }
  ];

  const [formData, setFormData] = useState({
    proveedor_id: '',
    producto_id: '',
    cantidad: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const procesarIngreso = (e) => {
    e.preventDefault();

    // ESTRUCTURA DE CONTRATO HTTP
    const payload = {
      proveedor_id: parseInt(formData.proveedor_id),
      producto_id: parseInt(formData.producto_id),
      cantidad: parseInt(formData.cantidad)
    };

    console.log("Enviando POST a /api/inventario:", payload);
    alert("Ingreso registrado. Oracle sumará el stock al producto mediante un Procedimiento Almacenado.");

    setFormData({ proveedor_id: '', producto_id: '', cantidad: '' });
  };

  return (
    <div>
      <h2 className="mb-4">Ingreso de Inventario</h2>

      <div className="card shadow-sm p-4" style={{ maxWidth: '600px' }}>
        <form onSubmit={procesarIngreso}>
          <div className="mb-3">
            <label className="form-label text-secondary">Proveedor</label>
            <select className="form-select" name="proveedor_id" value={formData.proveedor_id} onChange={handleChange} required>
              <option value="">Seleccione Proveedor...</option>
              {proveedoresMock.map(p => <option key={p.id} value={p.id}>{p.razon_social}</option>)}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary">Producto a Ingresar</label>
            <select className="form-select" name="producto_id" value={formData.producto_id} onChange={handleChange} required>
              <option value="">Seleccione Producto...</option>
              {productosMock.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary">Cantidad Entrante</label>
            <input type="number" min="1" className="form-control" name="cantidad" value={formData.cantidad} onChange={handleChange} required />
          </div>

          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary">Registrar Ingreso</button>
          </div>
        </form>
      </div>
    </div>
  );
}
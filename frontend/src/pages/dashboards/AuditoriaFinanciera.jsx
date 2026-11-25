import { useState, useEffect } from 'react';
import { obtenerVentasMes } from '../../services/dashboardService';

export default function AuditoriaFinanciera() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [ventas, setVentas] = useState([]);
  const [error, setError] = useState('');

  const cargar = async () => {
    setError('');
    try {
      const res = await obtenerVentasMes(Number(mes), Number(anio));
      if (res.success) setVentas(res.data);
      else setError(res.message);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { cargar(); }, []);

  const totalMes = ventas.reduce((acc, v) => acc + Number(v.total_venta || 0), 0);

  return (
    <div className="p-4">
      <h2 className="mb-4">Auditoría Financiera (Ventas Mensuales)</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm p-3 mb-4" style={{ maxWidth: '500px' }}>
        <div className="d-flex gap-2 align-items-end">
          <div>
            <label className="form-label small text-secondary">Mes (1-12)</label>
            <input type="number" min="1" max="12" className="form-control" value={mes} onChange={(e) => setMes(e.target.value)} />
          </div>
          <div>
            <label className="form-label small text-secondary">Año</label>
            <input type="number" min="2020" max="2100" className="form-control" value={anio} onChange={(e) => setAnio(e.target.value)} />
          </div>
          <button type="button" className="btn btn-primary" onClick={cargar}>Consultar</button>
        </div>
      </div>

      <div className="card shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Ventas Registradas del Período</h5>
          <span className="badge bg-success fs-6">Total: ${totalMes.toLocaleString('es-CL')}</span>
        </div>
        <table className="table table-striped">
          <thead className="table-dark">
            <tr><th># Venta</th><th>Fecha</th><th>RUT Cliente</th><th>Cliente</th><th>Vendedor</th><th>Ítems</th><th>Total</th></tr>
          </thead>
          <tbody>
            {ventas.length === 0 ? (
              <tr><td colSpan="7" className="text-center">Sin ventas registradas en el período</td></tr>
            ) : (
              ventas.map((v) => (
                <tr key={v.id_venta}>
                  <td>{v.id_venta}</td>
                  <td>{v.fecha_venta}</td>
                  <td>{v.rut_cliente}</td>
                  <td>{v.cliente}</td>
                  <td>{v.vendedor}</td>
                  <td>{v.cantidad_items}</td>
                  <td>${Number(v.total_venta).toLocaleString('es-CL')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { obtenerRendimientoStaff } from '../../services/dashboardService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function RendimientoStaff() {
  const [filas, setFilas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerRendimientoStaff()
      .then((res) => {
        if (res.success) setFilas(res.data);
        else setError(res.message);
      })
      .catch((err) => setError(err.message));
  }, []);

  const data = {
    labels: filas.map((f) => f.staff),
    datasets: [
      {
        label: 'Citas Atendidas',
        data: filas.map((f) => f.citas_atendidas),
        backgroundColor: '#0d6efd',
      },
      {
        label: 'Vacunas Aplicadas',
        data: filas.map((f) => f.vacunas_aplicadas),
        backgroundColor: '#198754',
      },
      {
        label: 'Ventas Registradas',
        data: filas.map((f) => f.ventas_registradas),
        backgroundColor: '#ffc107',
      },
    ],
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Rendimiento de Staff</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card shadow-sm p-4 mb-4" style={{ height: '360px' }}>
        <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
      <div className="card shadow-sm p-3">
        <table className="table table-striped table-sm mb-0">
          <thead className="table-dark">
            <tr><th>Staff</th><th>Rol</th><th>Ventas</th><th>Monto Vendido</th><th>Citas Atendidas</th><th>Vacunas</th></tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id_usuario}>
                <td>{f.staff}</td>
                <td>{f.nombre_rol}</td>
                <td>{f.ventas_registradas}</td>
                <td>${Number(f.monto_vendido).toLocaleString('es-CL')}</td>
                <td>{f.citas_atendidas}</td>
                <td>{f.vacunas_aplicadas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
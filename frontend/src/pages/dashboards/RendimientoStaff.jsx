import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function RendimientoStaff() {
  const data = {
    labels: ['Dr. Carlos', 'Dra. Andrea', 'Juan (Caja)', 'María (Caja)'],
    datasets: [
      {
        label: 'Atenciones o Ventas Mensuales',
        data: [45, 38, 120, 95],
        backgroundColor: '#0d6efd',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' }
    }
  };

  return (
    <div>
      <h2 className="mb-4">Rendimiento de Staff</h2>
      <div className="card shadow-sm p-4 mx-auto" style={{ height: '400px', maxWidth: '800px' }}>
        <div style={{ height: '300px' }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
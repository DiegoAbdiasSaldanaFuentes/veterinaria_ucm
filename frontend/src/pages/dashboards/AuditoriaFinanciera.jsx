import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Registrar los elementos requeridos por Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function AuditoriaFinanciera() {
  const data = {
    labels: ['Ventas Tienda', 'Servicios Clínicos', 'Peluquería'],
    datasets: [
      {
        data: [450000, 400000, 150000],
        backgroundColor: [
          '#0d6efd', // Primary
          '#198754', // Success
          '#ffc107', // Warning
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.raw !== null) {
              label += new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(context.raw);
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div>
      <h2 className="mb-4">Auditoría Financiera (Ingresos)</h2>
      <div className="card shadow-sm p-4 mx-auto" style={{ height: '400px', maxWidth: '600px' }}>
        <h5 className="text-center mb-3">Distribución de Ingresos</h5>
        <div style={{ height: '300px' }}>
          <Pie data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
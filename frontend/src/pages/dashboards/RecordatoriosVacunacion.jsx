import { useState, useEffect } from 'react';
import { obtenerRecordatorios } from '../../services/vacunacionService';

export default function RecordatoriosVacunacion() {
  const [recordatorios, setRecordatorios] = useState([]);

  useEffect(() => {
    obtenerRecordatorios().then(res => {
      if (res.success) setRecordatorios(res.data);
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="mb-4">Recordatorios de Vacunación</h2>
      <div className="card shadow-sm p-4">
        <table className="table table-striped">
          <thead className="table-dark">
            <tr>
              <th>Mascota</th>
              <th>Vacuna</th>
              <th>Próxima Dosis</th>
              <th>Estado</th>
              <th>Dueño</th>
              <th>Teléfono</th>
              <th>Correo</th>
            </tr>
          </thead>
          <tbody>
            {recordatorios.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">No hay recordatorios pendientes</td>
              </tr>
            ) : (
              recordatorios.map(item => (
                <tr key={item.id}>
                  <td>{item.mascota}</td>
                  <td>{item.vacuna}</td>
                  <td>{item.fecha_proxima_dosis}</td>
                  <td>
                    <span className={`badge ${item.estado === 'Vencida' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                      {item.estado}
                    </span>
                  </td>
                  <td>{item.dueno}</td>
                  <td>{item.telefono}</td>
                  <td>{item.correo}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

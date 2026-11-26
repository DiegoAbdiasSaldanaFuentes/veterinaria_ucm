import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { getPacientes, getProductos } from '../../services/mantenedoresService';
import { obtenerVacunaciones, registrarVacunacion } from '../../services/vacunacionService';

export default function GestorVacunacion() {
  const { usuario } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [formData, setFormData] = useState({
    id_paciente: '',
    id_producto: '',
    fecha_aplicacion: '',
    fecha_proxima_dosis: '',
    observaciones: '',
  });

  const cargar = async () => {
    try {
      const [resPa, resPr, resVa] = await Promise.all([
        getPacientes(),
        getProductos(),
        obtenerVacunaciones(),
      ]);
      if (resPa.success) setPacientes(resPa.data);
      if (resPr.success) setProductos(resPr.data);
      if (resVa.success) setHistorial(resVa.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  useEffect(() => {
    let activo = true;
    Promise.all([getPacientes(), getProductos(), obtenerVacunaciones()])
      .then(([resPa, resPr, resVa]) => {
        if (!activo) return;
        if (resPa.success) setPacientes(resPa.data);
        if (resPr.success) setProductos(resPr.data);
        if (resVa.success) setHistorial(resVa.data);
      })
      .catch((err) => {
        if (activo) setMensaje({ tipo: 'danger', texto: err.message });
      });
    return () => {
      activo = false;
    };
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pac = pacientes.find((p) => p.id_paciente === Number(formData.id_paciente));
    const prd = productos.find((p) => p.id_producto === Number(formData.id_producto));

    try {
      const res = await registrarVacunacion({
        id_paciente: Number(formData.id_paciente),
        paciente_nombre: pac ? pac.nombre_paciente : '',
        id_producto: Number(formData.id_producto),
        vacuna_nombre: prd ? prd.nombre_producto : '',
        id_usuario: usuario?.id_usuario,
        fecha_aplicacion: formData.fecha_aplicacion,
        fecha_proxima_dosis: formData.fecha_proxima_dosis,
        observaciones: formData.observaciones,
      });
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) {
        setFormData({ id_paciente: '', id_producto: '', fecha_aplicacion: '', fecha_proxima_dosis: '', observaciones: '' });
        cargar();
      }
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Registro de Vacunación</h2>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <div className="card shadow-sm p-4 mb-4" style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label text-secondary">Paciente</label>
              <select className="form-select" name="id_paciente" value={formData.id_paciente} onChange={handleChange} required>
                <option value="">Seleccione Paciente...</option>
                {pacientes.map((p) => (
                  <option key={p.id_paciente} value={p.id_paciente}>
                    {p.nombre_paciente} (Dueño: {p.dueno})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label text-secondary">Vacuna (Producto)</label>
              <select className="form-select" name="id_producto" value={formData.id_producto} onChange={handleChange} required>
                <option value="">Seleccione Vacuna...</option>
                {productos.map((p) => (
                  <option key={p.id_producto} value={p.id_producto}>{p.nombre_producto}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label text-secondary">Fecha de Aplicación</label>
              <input type="date" className="form-control" name="fecha_aplicacion" value={formData.fecha_aplicacion} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label text-secondary">Fecha Próxima Dosis</label>
              <input type="date" className="form-control" name="fecha_proxima_dosis" value={formData.fecha_proxima_dosis} onChange={handleChange} required />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary">Observaciones</label>
            <textarea className="form-control" name="observaciones" rows="2" value={formData.observaciones} onChange={handleChange} />
          </div>

          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary">Registrar Vacunación</button>
          </div>
        </form>
      </div>

      <div className="card shadow-sm p-4">
        <h5 className="mb-3">Historial de Vacunaciones</h5>
        <table className="table table-striped">
          <thead className="table-dark">
            <tr><th>Paciente</th><th>Vacuna</th><th>Fecha Aplicación</th><th>Próxima Dosis</th><th>Observaciones</th></tr>
          </thead>
          <tbody>
            {historial.map((item) => (
              <tr key={item.id_vacunacion || item.id}>
                <td>{item.nombre_paciente || item.paciente_nombre}</td>
                <td>{item.vacuna || item.vacuna_nombre}</td>
                <td>{item.fecha_aplicacion}</td>
                <td>{item.fecha_proxima_dosis}</td>
                <td>{item.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { getProductos } from '../../services/mantenedoresService';
import { getCitas, crearFichaClinica, agregarRecetaClinica } from '../../services/gestoresService';

export default function GestorClinico() {
  const [citas, setCitas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [fichaCreadaId, setFichaCreadaId] = useState(null);

  const [fichaForm, setFichaForm] = useState({
    id_cita: '',
    diagnostico: '',
    observaciones: '',
  });

  const [recetaForm, setRecetaForm] = useState({
    id_ficha: '',
    id_producto: '',
    indicaciones: '',
  });

  const cargar = async () => {
    try {
      const [resCi, resPr] = await Promise.all([getCitas(), getProductos()]);
      if (resCi.success) setCitas(resCi.data.filter((c) => c.estado !== 'CANCELADA'));
      if (resPr.success) setProductos(resPr.data);
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  useEffect(() => { cargar(); }, []);

  const registrarFicha = async (e) => {
    e.preventDefault();
    try {
      const res = await crearFichaClinica({
        id_cita: Number(fichaForm.id_cita),
        diagnostico: fichaForm.diagnostico,
        observaciones: fichaForm.observaciones,
      });
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success && res.data?.id_ficha) {
        setFichaCreadaId(res.data.id_ficha);
        setRecetaForm((prev) => ({ ...prev, id_ficha: res.data.id_ficha }));
        setFichaForm({ id_cita: '', diagnostico: '', observaciones: '' });
        cargar();
      }
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  const registrarReceta = async (e) => {
    e.preventDefault();
    try {
      const res = await agregarRecetaClinica({
        id_ficha: Number(recetaForm.id_ficha),
        id_producto: Number(recetaForm.id_producto),
        indicaciones: recetaForm.indicaciones,
      });
      setMensaje({ tipo: res.success ? 'success' : 'danger', texto: res.message });
      if (res.success) {
        setRecetaForm({ id_ficha: fichaCreadaId || '', id_producto: '', indicaciones: '' });
      }
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Gestión Clínica</h2>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`}>
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm p-4">
            <h5 className="mb-3">1. Registrar Ficha Clínica (desde Cita)</h5>
            <form onSubmit={registrarFicha}>
              <div className="mb-3">
                <label className="form-label text-secondary">Cita</label>
                <select
                  className="form-select"
                  value={fichaForm.id_cita}
                  onChange={(e) => setFichaForm({ ...fichaForm, id_cita: e.target.value })}
                  required
                >
                  <option value="">Seleccione Cita...</option>
                  {citas.map((c) => (
                    <option key={c.id_cita} value={c.id_cita}>
                      Cita #{c.id_cita} — {c.nombre_paciente} ({c.fecha_hora_inicio}) [{c.estado}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary">Diagnóstico</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={fichaForm.diagnostico}
                  onChange={(e) => setFichaForm({ ...fichaForm, diagnostico: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary">Observaciones</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={fichaForm.observaciones}
                  onChange={(e) => setFichaForm({ ...fichaForm, observaciones: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-success">Registrar Ficha Clínica</button>
            </form>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm p-4">
            <h5 className="mb-3">2. Agregar Receta a Ficha</h5>
            <form onSubmit={registrarReceta}>
              <div className="mb-3">
                <label className="form-label text-secondary">ID Ficha Clínica</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={recetaForm.id_ficha}
                  onChange={(e) => setRecetaForm({ ...recetaForm, id_ficha: e.target.value })}
                  placeholder="Ej: 1"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary">Producto / Medicamento</label>
                <select
                  className="form-select"
                  value={recetaForm.id_producto}
                  onChange={(e) => setRecetaForm({ ...recetaForm, id_producto: e.target.value })}
                  required
                >
                  <option value="">Seleccione Producto...</option>
                  {productos.map((p) => (
                    <option key={p.id_producto} value={p.id_producto}>{p.nombre_producto}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary">Indicaciones</label>
                <input
                  type="text"
                  className="form-control"
                  value={recetaForm.indicaciones}
                  onChange={(e) => setRecetaForm({ ...recetaForm, indicaciones: e.target.value })}
                  placeholder="Ej: 1 cada 12h por 5 días"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">Agregar Receta</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
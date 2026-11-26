import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';

export default function Ajustes() {
  const { modulos, toggleModulo, setModulos } = useConfig();
  const [guardado, setGuardado] = useState(false);

  const activarTodos = () => {
    setModulos(modulos.map((m) => ({ ...m, activo: true })));
    setGuardado(true);
  };

  const handleToggle = (id) => {
    toggleModulo(id);
    setGuardado(true);
  };

  return (
    <div className="p-4" style={{ maxWidth: '720px' }}>
      <h2 className="mb-2 fw-bold" style={{ color: '#003366' }}>Ajustes del Sistema</h2>
      <p className="text-secondary mb-4">
        Activa o desactiva las herramientas disponibles para esta veterinaria. Los cambios se guardan automáticamente.
      </p>

      {guardado && (
        <div className="alert alert-success alert-dismissible">
          Preferencias de herramientas actualizadas.
          <button type="button" className="btn-close" onClick={() => setGuardado(false)}></button>
        </div>
      )}

      <div className="card shadow-sm border-0 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Herramientas Habilitadas</h5>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={activarTodos}>
            Activar pack completo
          </button>
        </div>

        <div className="d-grid gap-2">
          {modulos.map((modulo) => (
            <label
              key={modulo.id}
              className="d-flex justify-content-between align-items-center p-3 border rounded"
              style={{ cursor: 'pointer', backgroundColor: modulo.activo ? '#fffdf2' : '#fff' }}
            >
              <span className="fw-semibold">{modulo.nombre}</span>
              <input
                type="checkbox"
                className="form-check-input"
                checked={modulo.activo}
                onChange={() => handleToggle(modulo.id)}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
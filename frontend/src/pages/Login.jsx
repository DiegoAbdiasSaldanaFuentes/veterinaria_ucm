import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await login(nombreUsuario, clave);
      if (!res.success) {
        setError(res.message || 'Credenciales inválidas.');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow p-4 border-0" style={{ width: '400px' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold" style={{ color: '#003366' }}>Veterinaria UCM</h3>
          <p className="text-secondary small mb-0">Ingreso al Sistema</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary">Usuario</label>
            <input
              type="text"
              className="form-control"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              placeholder="Ej: admin, vet, recep"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn w-100 text-white fw-bold"
            style={{ backgroundColor: '#003366' }}
            disabled={cargando}
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* TODO: PATCH TEMPORAL - ayuda visual de usuarios mock */}
        <div className="mt-3 pt-2 border-top text-muted small">
          Usuarios prueba (clave <code>1234</code>): <code>admin</code>, <code>vet</code>, <code>recep</code>
        </div>
      </div>
    </div>
  );
}
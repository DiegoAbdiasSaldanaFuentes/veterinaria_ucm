import { useState } from 'react';
import { registrarUsuario } from '../services/authService';
import { USE_MOCKS } from '../services/api';
import { useAuth } from '../context/useAuth';

export default function Login() {
  const { login } = useAuth();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [registro, setRegistro] = useState(false);
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setCargando(true);
    try {
      const res = registro
        ? await registrarUsuario({ nombre_usuario: nombreUsuario, nombres, apellidos, clave })
        : await login(nombreUsuario, clave);
      if (registro && res.success) {
        setRegistro(false);
        setClave('');
        setNombres('');
        setApellidos('');
        setMensaje(res.message);
      }
      if (!res.success) {
        setError(res.message || 'Credenciales inválidas.');
      }
    } catch (err) {
      setError(err.message || (registro ? 'Error al registrar la cuenta.' : 'Error al iniciar sesión.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow p-4 border-0" style={{ width: '400px' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold" style={{ color: '#003366' }}>Veterinaria UCM</h3>
          <p className="text-secondary small mb-0">{registro ? 'Crear cuenta' : 'Ingreso al sistema'}</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        {mensaje && <div className="alert alert-success py-2 small" role="status">{mensaje}</div>}

        <form onSubmit={handleSubmit}>
          {registro && (
            <>
              <div className="mb-3">
                <label htmlFor="nombres" className="form-label text-secondary">Nombres</label>
                <input id="nombres" className="form-control" autoComplete="given-name" value={nombres} onChange={(e) => setNombres(e.target.value)} maxLength={80} required />
              </div>
              <div className="mb-3">
                <label htmlFor="apellidos" className="form-label text-secondary">Apellidos</label>
                <input id="apellidos" className="form-control" autoComplete="family-name" value={apellidos} onChange={(e) => setApellidos(e.target.value)} maxLength={100} required />
              </div>
            </>
          )}
          <div className="mb-3">
            <label htmlFor="nombre-usuario" className="form-label text-secondary">Usuario</label>
            <input
              id="nombre-usuario"
              type="text"
              autoComplete="username"
              maxLength={50}
              className="form-control"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="clave" className="form-label text-secondary">Contraseña</label>
            <input
              id="clave"
              type="password"
              autoComplete={registro ? 'new-password' : 'current-password'}
              minLength={registro ? 8 : undefined}
              maxLength={registro ? 128 : 255}
              className="form-control"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder={registro ? 'Mínimo 8 caracteres' : undefined}
              required
            />
          </div>

          <button
            type="submit"
            className="btn w-100 text-white fw-bold"
            style={{ backgroundColor: '#003366' }}
            disabled={cargando}
          >
            {cargando ? 'Procesando…' : registro ? 'Solicitar cuenta' : 'Ingresar'}
          </button>
        </form>

        <button
          type="button"
          className="btn btn-link mt-2"
          disabled={cargando}
          onClick={() => {
            setRegistro(!registro);
            setClave('');
            setError('');
            setMensaje('');
          }}
        >
          {registro ? 'Volver al inicio de sesión' : 'Crear cuenta'}
        </button>

        {USE_MOCKS && !registro && (
          <div className="mt-3 pt-2 border-top text-muted small">
            Usuarios de prueba (clave <code>1234</code>) <code>admin</code>, <code>vet</code>, <code>recep</code>
          </div>
        )}
      </div>
    </div>
  );
}
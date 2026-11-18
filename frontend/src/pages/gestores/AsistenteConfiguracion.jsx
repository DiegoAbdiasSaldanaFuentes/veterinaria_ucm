import { useConfig } from '../../context/ConfigContext';

export default function AsistenteConfiguracion() {
  const { modulos, toggleModulo, finalizarConfiguracion, setModulos } = useConfig(); 

  const handleCrearModelo = (e) => {
    e.preventDefault();
    if (modulos.filter(m => m.activo).length === 0) {
      alert("Selecciona al menos una herramienta.");
      return;
    }
    finalizarConfiguracion();
  };

  const seleccionarTodos = () => {
    setModulos(modulos.map(m => ({ ...m, activo: true })));
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg p-5 border-0" style={{ width: '450px', backgroundColor: '#003366', color: 'white', borderRadius: '8px' }}>
        
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-2">Configuración Inicial</h2>
          <p className="text-light opacity-75">¿Qué herramientas necesita utilizar?</p>
        </div>

        <form onSubmit={handleCrearModelo}>
          <div className="d-grid gap-3 mb-4">
            {modulos.map(modulo => (
              <button
                type="button"
                key={modulo.id}
                onClick={() => toggleModulo(modulo.id)}
                className={`btn text-start p-3 fw-bold d-flex justify-content-between align-items-center ${modulo.activo ? 'text-dark' : 'text-white'}`}
                style={{ 
                  backgroundColor: modulo.activo ? '#ffcc00' : 'transparent',
                  border: modulo.activo ? '1px solid #ffcc00' : '1px solid rgba(255,255,255,0.3)', 
                  transition: 'all 0.2s' 
                }}
              >
                <span>{modulo.nombre}</span>
                {modulo.activo && <i className="fas fa-check-circle fs-5"></i>}
              </button>
            ))}
          </div>

          <button 
            type="button" 
            className="btn btn-link text-white w-100 mb-3 text-decoration-underline opacity-75"
            onClick={seleccionarTodos}
          >
            Activar pack completo
          </button>

          <button 
            type="submit" 
            className="btn w-100 py-3 fw-bold text-white shadow-sm" 
            style={{ backgroundColor: '#0066cc', fontSize: '1.1rem', border: 'none' }}
          >
            INICIAR SISTEMA
          </button>
        </form>

      </div>
    </div>
  );
}
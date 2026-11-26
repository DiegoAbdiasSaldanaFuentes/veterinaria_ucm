import fondoVet from '../../assets/VETUCM.jpg';
import { useConfig } from '../../context/ConfigContext';

export default function AsistenteConfiguracion() {
  const { modulos, toggleModulo, setModulos, finalizarConfiguracion } = useConfig();

  const activarTodos = () => {
    setModulos(modulos.map((m) => ({ ...m, activo: true })));
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center py-4 px-3"
      style={{
        minHeight: '100vh',
        backgroundColor: '#121820',
        backgroundImage: `linear-gradient(rgba(10, 20, 32, 0.45), rgba(10, 20, 32, 0.55)), url(${fondoVet})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <style>{`
        .btn-herramienta-cfg {
          background-color: #b88c00;
          color: #002244;
          border: 2px solid transparent;
          transition: transform 0.16s ease, filter 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, background-color 0.16s ease;
        }
        .btn-herramienta-cfg:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 0 12px rgba(255, 204, 0, 0.45);
          border-color: rgba(255, 255, 255, 0.55);
          color: #001b36;
        }
        .btn-herramienta-cfg.seleccionado {
          background-color: #ffcc00;
          color: #003366;
          border-color: #ffffff;
          box-shadow: 0 0 10px rgba(255, 204, 0, 0.35);
        }
        .btn-iniciar-cfg {
          background-color: #0066cc;
          color: #ffffff;
          border: none;
          transition: transform 0.16s ease, filter 0.16s ease, box-shadow 0.16s ease;
        }
        .btn-iniciar-cfg:hover {
          filter: brightness(1.12);
          transform: translateY(-1px);
          box-shadow: 0 0 14px rgba(0, 136, 255, 0.45);
          color: #ffffff;
        }
      `}</style>

      <div
        className="w-100 rounded-4 p-4 p-md-5 text-white"
        style={{
          maxWidth: '960px',
          backgroundColor: 'rgba(0, 51, 102, 0.84)',
          backdropFilter: 'blur(6px)',
          boxShadow:
            '0 0 24px rgba(0, 120, 220, 0.28), 0 12px 28px rgba(0, 0, 0, 0.42)',
        }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1">Configuración Inicial</h2>
          <p className="text-light opacity-75 mb-0">
            ¿Qué herramientas necesita utilizar esta veterinaria?
          </p>
        </div>

        <div className="row g-3 mb-4">
          {modulos.map((modulo) => (
            <div key={modulo.id} className="col-12 col-sm-6 col-md-4">
              <button
                type="button"
                onClick={() => toggleModulo(modulo.id)}
                className={`btn w-100 h-100 py-3 px-3 fw-bold text-start rounded-3 btn-herramienta-cfg ${
                  modulo.activo ? 'seleccionado' : ''
                }`}
              >
                {modulo.nombre}
              </button>
            </div>
          ))}
        </div>

        <div className="d-flex flex-column align-items-center gap-3">
          <button
            type="button"
            onClick={activarTodos}
            className="btn btn-link text-light p-0"
          >
            Activar pack completo
          </button>

          <button
            type="button"
            onClick={finalizarConfiguracion}
            className="btn fw-bold py-2 px-5 rounded-3 btn-iniciar-cfg"
            style={{ maxWidth: '340px', width: '100%' }}
          >
            INICIAR SISTEMA
          </button>
        </div>
      </div>
    </div>
  );
}
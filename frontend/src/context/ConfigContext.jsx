import { createContext, useState, useContext } from 'react';

const ConfigContext = createContext();

export function ConfigProvider({ children }) {
  const [isConfigurado, setIsConfigurado] = useState(false);
  
  const [modulos, setModulos] = useState([
    { id: 'ventas', nombre: 'Punto de Venta', activo: false },
    { id: 'clinica', nombre: 'Gestión Clínica', activo: false },
    { id: 'inventario', nombre: 'Gestión de Inventario', activo: false },
    { id: 'citas', nombre: 'Agendar Citas', activo: false },
    { id: 'auditoria', nombre: 'Auditoría y Reportes', activo: false }
  ]);

  const toggleModulo = (id) => {
    setModulos(modulos.map(m => m.id === id ? { ...m, activo: !m.activo } : m));
  };

  const finalizarConfiguracion = () => {
    setIsConfigurado(true);
  };

  return (
    <ConfigContext.Provider value={{ modulos, setModulos, toggleModulo, isConfigurado, finalizarConfiguracion }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
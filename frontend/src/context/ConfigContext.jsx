import { createContext, useState, useContext, useEffect } from 'react';

const ConfigContext = createContext();

const STORAGE_KEY = 'vet_config_modulos_v1';

const MODULOS_INICIALES = [
  { id: 'ventas', nombre: 'Punto de Venta', activo: false },
  { id: 'citas', nombre: 'Agendar Citas', activo: false },
  { id: 'clinica', nombre: 'Gestión Clínica', activo: false },
  { id: 'inventario', nombre: 'Ingreso Inventario', activo: false },
  { id: 'vacunacion', nombre: 'Registro Vacunación', activo: false },
  { id: 'recordatorios', nombre: 'Recordatorios Vacunas', activo: false },
  { id: 'auditoria', nombre: 'Auditoría Financiera', activo: false },
  { id: 'stock_critico', nombre: 'Stock Crítico', activo: false },
  { id: 'rendimiento', nombre: 'Rendimiento Staff', activo: false },
];

export function ConfigProvider({ children }) {
  const [isConfigurado, setIsConfigurado] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return false;
    try {
      return Boolean(JSON.parse(saved).isConfigurado);
    } catch {
      return false;
    }
  });

  const [modulos, setModulos] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return MODULOS_INICIALES;
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed.modulos)) return MODULOS_INICIALES;
      return MODULOS_INICIALES.map((base) => {
        const match = parsed.modulos.find((m) => m.id === base.id);
        return match ? { ...base, activo: Boolean(match.activo) } : base;
      });
    } catch {
      return MODULOS_INICIALES;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ isConfigurado, modulos }));
  }, [isConfigurado, modulos]);

  const toggleModulo = (id) => {
    setModulos((prev) =>
      prev.map((m) => (m.id === id ? { ...m, activo: !m.activo } : m))
    );
  };

  const finalizarConfiguracion = () => {
    setIsConfigurado(true);
  };

  const reabrirConfiguracion = () => {
    setIsConfigurado(false);
  };

  return (
    <ConfigContext.Provider
      value={{
        modulos,
        setModulos,
        toggleModulo,
        isConfigurado,
        finalizarConfiguracion,
        reabrirConfiguracion,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
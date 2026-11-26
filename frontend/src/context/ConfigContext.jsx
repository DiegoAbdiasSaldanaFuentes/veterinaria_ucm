import { useState } from 'react';
import { ConfigContext } from './configRef';

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
  const [isConfigurado, setIsConfigurado] = useState(false);
  const [modulos, setModulos] = useState(MODULOS_INICIALES);

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

  const resetearConfiguracion = () => {
    setModulos(MODULOS_INICIALES);
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
        resetearConfiguracion,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}
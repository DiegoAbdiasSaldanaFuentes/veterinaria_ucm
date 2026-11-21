import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useConfig } from './context/ConfigContext';
import Layout from './components/Layout';
// Importaciones de CRUDs
import Clientes from './pages/cruds/Clientes';
import Usuarios from './pages/cruds/Usuarios';
import Roles from './pages/cruds/Roles';
import Pacientes from './pages/cruds/Pacientes';
import EspeciesRazas from './pages/cruds/EspeciesRazas';
import Productos from './pages/cruds/Productos';
import Proveedores from './pages/cruds/Proveedores';
import Servicios from './pages/cruds/Servicios';
import FichasMedicas from './pages/cruds/FichasMedicas';
import RecetasMedicas from './pages/cruds/RecetasMedicas';
// Importaciones de Gestores
import GestorVentas from './pages/gestores/GestorVentas';
import GestorClinico from './pages/gestores/GestorClinico';
import GestorInventario from './pages/gestores/GestorInventario';
import GestorCitas from './pages/gestores/GestorCitas';
import AsistenteConfiguracion from './pages/gestores/AsistenteConfiguracion';
import GestorVacunacion from './pages/gestores/GestorVacunacion';
// Importaciones de Dashboards
import AuditoriaFinanciera from './pages/dashboards/AuditoriaFinanciera';
import ControlInventario from './pages/dashboards/ControlInventario';
import RendimientoStaff from './pages/dashboards/RendimientoStaff';
import RecordatoriosVacunacion from './pages/dashboards/RecordatoriosVacunacion';
import Inicio from './pages/dashboards/Inicio';
function App() {
  const { isConfigurado } = useConfig();

  if (!isConfigurado) {
    return <AsistenteConfiguracion />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Inicio />} />
          
          <Route path="clientes" element={<Clientes/>} />
          <Route path="usuarios" element={<Usuarios/>} />
          <Route path="roles" element={<Roles/>} />
          <Route path="pacientes" element={<Pacientes/>} />
          <Route path="especies" element={<EspeciesRazas/>} />
          <Route path="productos" element={<Productos/>} />
          <Route path="proveedores" element={<Proveedores/>} />
          <Route path="servicios" element={<Servicios/>} />
          <Route path="fichas" element={<FichasMedicas/>} />
          <Route path="recetas" element={<RecetasMedicas/>} />
          
          <Route path="ventas" element={<GestorVentas/>} />
          <Route path="clinica" element={<GestorClinico/>} />
          <Route path="inventario" element={<GestorInventario/>} />
          <Route path="citas" element={<GestorCitas/>} />
          
          <Route path="auditoria" element={<AuditoriaFinanciera/>} />
          <Route path="stock-critico" element={<ControlInventario/>} />
          <Route path="rendimiento" element={<RendimientoStaff/>} />
          <Route path="vacunacion" element={<GestorVacunacion />} />
          <Route path="recordatorios" element={<RecordatoriosVacunacion />} />
          
          {/* Ruta de seguridad para URLs no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
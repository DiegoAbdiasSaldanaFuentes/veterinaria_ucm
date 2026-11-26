import { createContext, useContext, useState } from 'react';
import { loginUsuario } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // TODO: PATCH TEMPORAL - iniciar en null para que siempre pida Login al recargar durante pruebas
  const [usuario, setUsuario] = useState(null);

  const login = async (nombre_usuario, clave) => {
    const res = await loginUsuario(nombre_usuario, clave);
    if (res.success && res.data) {
      setUsuario(res.data);
      sessionStorage.setItem('vet_usuario', JSON.stringify(res.data));
    }
    return res;
  };

  const logout = () => {
    setUsuario(null);
    sessionStorage.removeItem('vet_usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, isAuthenticated: !!usuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
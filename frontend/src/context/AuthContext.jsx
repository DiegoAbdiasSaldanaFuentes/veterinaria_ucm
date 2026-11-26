import { useState } from 'react';
import { AuthContext } from './authRef';
import { loginUsuario } from '../services/authService';

export function AuthProvider({ children }) {
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
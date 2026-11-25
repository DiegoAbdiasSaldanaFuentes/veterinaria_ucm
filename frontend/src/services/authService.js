import api, { USE_MOCKS } from './api';

// TODO: PATCH TEMPORAL - usuarios de prueba mientras Benja sube /api/auth/login
const MOCK_USUARIOS = [
  {
    id_usuario: 1,
    id_rol: 1,
    nombre_rol: 'Administrador',
    nombre_usuario: 'admin',
    nombres: 'Admin',
    apellidos: 'Sistema',
    activo: 1,
  },
  {
    id_usuario: 2,
    id_rol: 2,
    nombre_rol: 'Veterinario',
    nombre_usuario: 'vet',
    nombres: 'Carlos',
    apellidos: 'Castro',
    activo: 1,
  },
  {
    id_usuario: 3,
    id_rol: 3,
    nombre_rol: 'Recepcionista',
    nombre_usuario: 'recep',
    nombres: 'María',
    apellidos: 'López',
    activo: 1,
  },
];

export const loginUsuario = async (nombre_usuario, clave) => {
  if (USE_MOCKS) {
    const user = MOCK_USUARIOS.find(
      (u) => u.nombre_usuario.toLowerCase() === nombre_usuario.trim().toLowerCase()
    );
    if (!user || clave !== '1234') {
      return { success: false, data: null, message: 'ERROR: Usuario o credenciales inválidas.' };
    }
    return { success: true, data: user, message: 'OK: Autenticación exitosa.' };
  }

  return api.post('/auth/login', { nombre_usuario, clave });
};
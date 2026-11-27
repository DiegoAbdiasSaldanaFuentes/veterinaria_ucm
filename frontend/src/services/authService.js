import api, { USE_MOCKS } from './api';
import { crearUsuario, getRoles, getUsuarios } from './mantenedoresService';

const clavesMock = new Map([
  ['admin', '1234'],
  ['vet', '1234'],
  ['recep', '1234'],
]);

export const loginUsuario = async (nombre_usuario, clave) => {
  if (USE_MOCKS) {
    const nombre = nombre_usuario.trim().toLowerCase();
    const { data } = await getUsuarios();
    const user = data.find((u) => u.nombre_usuario.toLowerCase() === nombre);
    if (user?.activo !== 1 || clave !== clavesMock.get(nombre)) {
      return { success: false, data: null, message: 'Credenciales inválidas o cuenta inactiva.' };
    }
    return { success: true, data: user, message: 'Inicio de sesión exitoso.' };
  }

  return api.post('/auth/login', { nombre_usuario, clave });
};

export const registrarUsuario = async ({ nombre_usuario, nombres, apellidos, clave }) => {
  if (USE_MOCKS) {
    const nombre = nombre_usuario.trim().toLowerCase();
    const { data: usuarios } = await getUsuarios();
    if (usuarios.some((u) => u.nombre_usuario.toLowerCase() === nombre)) {
      return { success: false, message: 'El nombre de usuario ya está en uso.' };
    }
    const { data: roles } = await getRoles();
    const rol = roles.find((r) => /^recepci(onista|ón|on)$/i.test(r.nombre_rol.trim()));
    if (!rol) return { success: false, message: 'Configura el rol Recepcionista antes de solicitar cuentas.' };

    await crearUsuario({ nombre_usuario, nombres, apellidos, id_rol: rol.id_rol }, 0);
    clavesMock.set(nombre, clave);
    return { success: true, message: 'Solicitud registrada. Pide a un administrador que active tu cuenta.' };
  }

  return api.post('/auth/registro', { nombre_usuario, nombres, apellidos, clave });
};

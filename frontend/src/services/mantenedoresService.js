import api, { USE_MOCKS } from './api';

// TODO: PATCH TEMPORAL - almacenamiento en memoria para pruebas sin backend
let mockClientes = [
  { id_cliente: 1, rut: '11111111-1', nombres: 'Juan', apellidos: 'Pérez', telefono: '987654321', correo: 'juan@mail.com' },
  { id_cliente: 2, rut: '22222222-2', nombres: 'María', apellidos: 'Gómez', telefono: '912345678', correo: 'maria@mail.com' },
];

let mockEspecies = [
  { id_especie: 1, nombre_especie: 'Canino' },
  { id_especie: 2, nombre_especie: 'Felino' },
];

let mockRoles = [
  { id_rol: 1, nombre_rol: 'Administrador' },
  { id_rol: 2, nombre_rol: 'Veterinario' },
  { id_rol: 3, nombre_rol: 'Recepcionista' },
];

let mockServicios = [
  { id_servicio: 1, nombre_servicio: 'Consulta General', activo: 1 },
  { id_servicio: 2, nombre_servicio: 'Control Sano', activo: 1 },
  { id_servicio: 3, nombre_servicio: 'Vacunación', activo: 1 },
];

// --- CLIENTES ---
export const getClientes = async () => {
  if (USE_MOCKS) return { success: true, data: [...mockClientes], message: 'OK' };
  return api.get('/mantenedores/clientes');
};

export const crearCliente = async (payload) => {
  if (USE_MOCKS) {
    const nuevo = {
      id_cliente: Date.now(),
      rut: payload.rut.replace(/\./g, '').toUpperCase().trim(),
      nombres: payload.nombres.trim(),
      apellidos: payload.apellidos.trim(),
      telefono: payload.telefono?.trim() || '',
      correo: payload.correo?.toLowerCase().trim() || '',
    };
    mockClientes.push(nuevo);
    return { success: true, data: nuevo, message: 'OK: Cliente registrado correctamente.' };
  }
  return api.post('/mantenedores/clientes', payload);
};

export const actualizarCliente = async (id, payload) => {
  if (USE_MOCKS) {
    mockClientes = mockClientes.map((c) =>
      c.id_cliente === id ? { ...c, ...payload } : c
    );
    return { success: true, data: null, message: 'OK: Cliente actualizado correctamente.' };
  }
  return api.put(`/mantenedores/clientes/${id}`, payload);
};

export const eliminarCliente = async (id) => {
  if (USE_MOCKS) {
    mockClientes = mockClientes.filter((c) => c.id_cliente !== id);
    return { success: true, data: null, message: 'OK: Cliente eliminado correctamente.' };
  }
  return api.delete(`/mantenedores/clientes/${id}`);
};

// --- ESPECIES ---
export const getEspecies = async () => {
  if (USE_MOCKS) return { success: true, data: [...mockEspecies], message: 'OK' };
  return api.get('/mantenedores/especies');
};

export const crearEspecie = async (payload) => {
  if (USE_MOCKS) {
    const nueva = { id_especie: Date.now(), nombre_especie: payload.nombre_especie.trim() };
    mockEspecies.push(nueva);
    return { success: true, data: nueva, message: 'OK: Especie registrada correctamente.' };
  }
  return api.post('/mantenedores/especies', payload);
};

export const actualizarEspecie = async (id, payload) => {
  if (USE_MOCKS) {
    mockEspecies = mockEspecies.map((e) =>
      e.id_especie === id ? { ...e, nombre_especie: payload.nombre_especie.trim() } : e
    );
    return { success: true, data: null, message: 'OK: Especie actualizada correctamente.' };
  }
  return api.put(`/mantenedores/especies/${id}`, payload);
};

export const eliminarEspecie = async (id) => {
  if (USE_MOCKS) {
    mockEspecies = mockEspecies.filter((e) => e.id_especie !== id);
    return { success: true, data: null, message: 'OK: Especie eliminada correctamente.' };
  }
  return api.delete(`/mantenedores/especies/${id}`);
};

// --- ROLES ---
export const getRoles = async () => {
  if (USE_MOCKS) return { success: true, data: [...mockRoles], message: 'OK' };
  return api.get('/mantenedores/roles');
};

export const crearRol = async (payload) => {
  if (USE_MOCKS) {
    const nuevo = { id_rol: Date.now(), nombre_rol: payload.nombre_rol.trim() };
    mockRoles.push(nuevo);
    return { success: true, data: nuevo, message: 'OK: Rol registrado correctamente.' };
  }
  return api.post('/mantenedores/roles', payload);
};

export const actualizarRol = async (id, payload) => {
  if (USE_MOCKS) {
    mockRoles = mockRoles.map((r) =>
      r.id_rol === id ? { ...r, nombre_rol: payload.nombre_rol.trim() } : r
    );
    return { success: true, data: null, message: 'OK: Rol actualizado correctamente.' };
  }
  return api.put(`/mantenedores/roles/${id}`, payload);
};

export const eliminarRol = async (id) => {
  if (USE_MOCKS) {
    mockRoles = mockRoles.filter((r) => r.id_rol !== id);
    return { success: true, data: null, message: 'OK: Rol eliminado correctamente.' };
  }
  return api.delete(`/mantenedores/roles/${id}`);
};

// --- SERVICIOS ---
export const getServicios = async () => {
  if (USE_MOCKS) return { success: true, data: [...mockServicios], message: 'OK' };
  return api.get('/mantenedores/servicios');
};

export const crearServicio = async (payload) => {
  if (USE_MOCKS) {
    const nuevo = { id_servicio: Date.now(), nombre_servicio: payload.nombre_servicio.trim(), activo: 1 };
    mockServicios.push(nuevo);
    return { success: true, data: nuevo, message: 'OK: Servicio registrado correctamente.' };
  }
  return api.post('/mantenedores/servicios', payload);
};

export const actualizarServicio = async (id, payload) => {
  if (USE_MOCKS) {
    mockServicios = mockServicios.map((s) =>
      s.id_servicio === id ? { ...s, nombre_servicio: payload.nombre_servicio.trim(), activo: Number(payload.activo) } : s
    );
    return { success: true, data: null, message: 'OK: Servicio actualizado correctamente.' };
  }
  return api.put(`/mantenedores/servicios/${id}`, payload);
};

export const eliminarServicio = async (id) => {
  if (USE_MOCKS) {
    mockServicios = mockServicios.filter((s) => s.id_servicio !== id);
    return { success: true, data: null, message: 'OK: Servicio eliminado correctamente.' };
  }
  return api.delete(`/mantenedores/servicios/${id}`);
};

// TODO: PATCH TEMPORAL - mocks en memoria para Tanda 2 de mantenedores
let mockUsuarios = [
  { id_usuario: 1, id_rol: 1, nombre_rol: 'Administrador', nombre_usuario: 'admin', nombres: 'Admin', apellidos: 'Sistema', activo: 1 },
  { id_usuario: 2, id_rol: 2, nombre_rol: 'Veterinario', nombre_usuario: 'vet', nombres: 'Carlos', apellidos: 'Castro', activo: 1 },
  { id_usuario: 3, id_rol: 3, nombre_rol: 'Recepcionista', nombre_usuario: 'recep', nombres: 'María', apellidos: 'López', activo: 1 },
];

let mockProveedores = [
  { id_proveedor: 1, razon_social: 'Distribuidora Vet', rut: '77777777-7', telefono: '988888888', correo: 'ventas@vet.cl' },
];

let mockProductos = [
  { id_producto: 103, catalogo: 'vacunas', sku: 'VAC-RAB-001', nombre_producto: 'Vacuna Antirrábica', precio_unitario: 12000, stock: 10, stock_minimo: 2, activo: 1 },
  { id_producto: 104, catalogo: 'vacunas', sku: 'VAC-OCT-002', nombre_producto: 'Vacuna Óctuple', precio_unitario: 16500, stock: 10, stock_minimo: 2, activo: 1 },
  { id_producto: 101, id_proveedor: 1, proveedor: 'Distribuidora Vet', sku: 'SKU-101', nombre_producto: 'Meloxicam 5mg', precio_unitario: 12000, stock: 5, stock_minimo: 6, activo: 1 },
];

let mockPacientes = [
  { id_paciente: 1, id_cliente: 1, rut_cliente: '11111111-1', dueno: 'Juan Pérez', id_especie: 1, nombre_especie: 'Canino', nombre_paciente: 'Max', fecha_nacimiento: '2020-05-10' },
];

let mockFichas = [
  { id_ficha: 1, id_cita: 1, fecha_atencion: '2026-11-20', id_paciente: 1, nombre_paciente: 'Max', dueno: 'Juan Pérez', veterinario: 'Carlos Castro', nombre_servicio: 'Consulta General', diagnostico: 'Control sano', observaciones: 'Sin hallazgos' },
];

let mockRecetas = [
  { id_receta: 1, id_ficha: 1, id_paciente: 1, nombre_paciente: 'Max', id_producto: 101, medicamento: 'Meloxicam 5mg', indicaciones: '1 comprimido cada 24h por 5 días' },
];

export function guardarFichaSimulada(cita, payload) {
  if (mockFichas.some((f) => f.id_cita === cita.id_cita)) return null;
  const id_ficha = Date.now();
  mockFichas.unshift({
    ...cita, ...payload, id_ficha, fecha_atencion: cita.fecha_hora_inicio,
  });
  return id_ficha;
}

export function guardarRecetaSimulada(payload) {
  const ficha = mockFichas.find((f) => f.id_ficha === Number(payload.id_ficha));
  const producto = mockProductos.find((p) => p.id_producto === Number(payload.id_producto) && p.activo === 1 && p.catalogo !== 'vacunas');
  if (!ficha || !producto) return null;
  const id_receta = Date.now();
  mockRecetas.unshift({
    ...payload, id_receta, id_paciente: ficha.id_paciente,
    nombre_paciente: ficha.nombre_paciente, medicamento: producto.nombre_producto,
  });
  return id_receta;
}

// --- USUARIOS ---
export const getUsuarios = async () => {
  if (USE_MOCKS) return { success: true, data: [...mockUsuarios], message: 'OK' };
  return api.get('/mantenedores/usuarios');
};

export const crearUsuario = async (payload, activo = 1) => {
  if (USE_MOCKS) {
    const rolMatch = mockRoles.find((r) => r.id_rol === Number(payload.id_rol));
    const nuevo = {
      id_usuario: Date.now(),
      id_rol: Number(payload.id_rol),
      nombre_rol: rolMatch ? rolMatch.nombre_rol : 'Usuario',
      nombre_usuario: payload.nombre_usuario.trim(),
      nombres: payload.nombres.trim(),
      apellidos: payload.apellidos.trim(),
      activo,
    };
    mockUsuarios.push(nuevo);
    return { success: true, data: nuevo, message: 'OK: Usuario registrado correctamente.' };
  }
  return api.post('/mantenedores/usuarios', payload);
};

export const actualizarUsuario = async (id, payload) => {
  if (USE_MOCKS) {
    const rolMatch = mockRoles.find((r) => r.id_rol === Number(payload.id_rol));
    mockUsuarios = mockUsuarios.map((u) =>
      u.id_usuario === id
        ? {
            ...u,
            id_rol: Number(payload.id_rol),
            nombre_rol: rolMatch ? rolMatch.nombre_rol : u.nombre_rol,
            nombres: payload.nombres.trim(),
            apellidos: payload.apellidos.trim(),
            activo: Number(payload.activo),
          }
        : u
    );
    return { success: true, data: null, message: 'OK: Usuario actualizado correctamente.' };
  }
  return api.put(`/mantenedores/usuarios/${id}`, payload);
};

export const eliminarUsuario = async (id) => {
  if (USE_MOCKS) {
    mockUsuarios = mockUsuarios.filter((u) => u.id_usuario !== id);
    return { success: true, data: null, message: 'OK: Usuario eliminado correctamente.' };
  }
  return api.delete(`/mantenedores/usuarios/${id}`);
};

// --- PROVEEDORES ---
export const getProveedores = async () => {
  if (USE_MOCKS) return { success: true, data: [...mockProveedores], message: 'OK' };
  return api.get('/mantenedores/proveedores');
};

export const crearProveedor = async (payload) => {
  if (USE_MOCKS) {
    const nuevo = {
      id_proveedor: Date.now(),
      razon_social: payload.razon_social.trim(),
      rut: payload.rut.replace(/\./g, '').toUpperCase().trim(),
      telefono: payload.telefono?.trim() || '',
      correo: payload.correo?.toLowerCase().trim() || '',
    };
    mockProveedores.push(nuevo);
    return { success: true, data: nuevo, message: 'OK: Proveedor registrado correctamente.' };
  }
  return api.post('/mantenedores/proveedores', payload);
};

export const actualizarProveedor = async (id, payload) => {
  if (USE_MOCKS) {
    mockProveedores = mockProveedores.map((p) =>
      p.id_proveedor === id
        ? {
            ...p,
            razon_social: payload.razon_social.trim(),
            rut: payload.rut.replace(/\./g, '').toUpperCase().trim(),
            telefono: payload.telefono?.trim() || '',
            correo: payload.correo?.toLowerCase().trim() || '',
          }
        : p
    );
    return { success: true, data: null, message: 'OK: Proveedor actualizado correctamente.' };
  }
  return api.put(`/mantenedores/proveedores/${id}`, payload);
};

export const eliminarProveedor = async (id) => {
  if (USE_MOCKS) {
    mockProveedores = mockProveedores.filter((p) => p.id_proveedor !== id);
    return { success: true, data: null, message: 'OK: Proveedor eliminado correctamente.' };
  }
  return api.delete(`/mantenedores/proveedores/${id}`);
};

// --- PRODUCTOS ---
export const getProductos = async (catalogo = 'productos', incluirInactivos = false) => {
  if (USE_MOCKS) return { success: true, data: mockProductos.filter((p) => (p.catalogo || 'productos') === catalogo && (incluirInactivos || p.activo === 1)), message: 'OK' };
  return api.get(`/mantenedores/${catalogo}`, { params: { incluir_inactivos: incluirInactivos ? 1 : 0 } });
};

export const crearProducto = async (payload, catalogo = 'productos') => {
  if (USE_MOCKS) {
    const prov = mockProveedores.find((p) => p.id_proveedor === Number(payload.id_proveedor));
    const nuevo = {
      id_producto: Date.now(),
      catalogo,
      id_proveedor: Number(payload.id_proveedor),
      proveedor: prov ? prov.razon_social : 'SIN PROVEEDOR',
      sku: payload.sku.toUpperCase().trim(),
      nombre_producto: payload.nombre_producto.trim(),
      precio_unitario: Number(payload.precio_unitario),
      stock: Number(payload.stock ?? 0),
      stock_minimo: Number(payload.stock_minimo ?? 0),
      activo: 1,
    };
    mockProductos.push(nuevo);
    return { success: true, data: nuevo, message: 'OK: Producto registrado correctamente.' };
  }
  return api.post(`/mantenedores/${catalogo}`, payload);
};

export const actualizarProducto = async (id, payload, catalogo = 'productos') => {
  if (USE_MOCKS) {
    const prov = mockProveedores.find((p) => p.id_proveedor === Number(payload.id_proveedor));
    mockProductos = mockProductos.map((p) =>
      p.id_producto === id && (p.catalogo || 'productos') === catalogo
        ? {
            ...p,
            id_proveedor: Number(payload.id_proveedor),
            proveedor: prov ? prov.razon_social : 'SIN PROVEEDOR',
            sku: payload.sku.toUpperCase().trim(),
            nombre_producto: payload.nombre_producto.trim(),
            precio_unitario: Number(payload.precio_unitario),
            stock: Number(payload.stock),
            stock_minimo: Number(payload.stock_minimo),
            activo: Number(payload.activo),
          }
        : p
    );
    return { success: true, data: null, message: 'OK: Producto actualizado correctamente.' };
  }
  return api.put(`/mantenedores/${catalogo}/${id}`, payload);
};

export const eliminarProducto = async (id, catalogo = 'productos') => {
  if (USE_MOCKS) {
    mockProductos = mockProductos.filter((p) => p.id_producto !== id || (p.catalogo || 'productos') !== catalogo);
    return { success: true, data: null, message: 'OK: Producto eliminado correctamente.' };
  }
  return api.delete(`/mantenedores/${catalogo}/${id}`);
};

// --- PACIENTES ---
export const getPacientes = async () => {
  if (USE_MOCKS) return { success: true, data: [...mockPacientes], message: 'OK' };
  return api.get('/mantenedores/pacientes');
};

export const crearPaciente = async (payload) => {
  if (USE_MOCKS) {
    const cli = mockClientes.find((c) => c.id_cliente === Number(payload.id_cliente));
    const esp = mockEspecies.find((e) => e.id_especie === Number(payload.id_especie));
    const nuevo = {
      id_paciente: Date.now(),
      id_cliente: Number(payload.id_cliente),
      rut_cliente: cli ? cli.rut : '',
      dueno: cli ? `${cli.nombres} ${cli.apellidos}` : 'Cliente',
      id_especie: Number(payload.id_especie),
      nombre_especie: esp ? esp.nombre_especie : 'Especie',
      nombre_paciente: payload.nombre_paciente.trim(),
      fecha_nacimiento: payload.fecha_nacimiento || '',
    };
    mockPacientes.push(nuevo);
    return { success: true, data: nuevo, message: 'OK: Paciente registrado correctamente.' };
  }
  return api.post('/mantenedores/pacientes', payload);
};

export const actualizarPaciente = async (id, payload) => {
  if (USE_MOCKS) {
    const cli = mockClientes.find((c) => c.id_cliente === Number(payload.id_cliente));
    const esp = mockEspecies.find((e) => e.id_especie === Number(payload.id_especie));
    mockPacientes = mockPacientes.map((p) =>
      p.id_paciente === id
        ? {
            ...p,
            id_cliente: Number(payload.id_cliente),
            rut_cliente: cli ? cli.rut : p.rut_cliente,
            dueno: cli ? `${cli.nombres} ${cli.apellidos}` : p.dueno,
            id_especie: Number(payload.id_especie),
            nombre_especie: esp ? esp.nombre_especie : p.nombre_especie,
            nombre_paciente: payload.nombre_paciente.trim(),
            fecha_nacimiento: payload.fecha_nacimiento || '',
          }
        : p
    );
    return { success: true, data: null, message: 'OK: Paciente actualizado correctamente.' };
  }
  return api.put(`/mantenedores/pacientes/${id}`, payload);
};

export const eliminarPaciente = async (id) => {
  if (USE_MOCKS) {
    mockPacientes = mockPacientes.filter((p) => p.id_paciente !== id);
    return { success: true, data: null, message: 'OK: Paciente eliminado correctamente.' };
  }
  return api.delete(`/mantenedores/pacientes/${id}`);
};

// --- FICHAS Y RECETAS (CRUD MANTENEDOR) ---
export const getFichas = async () => {
  if (USE_MOCKS) return { success: true, data: [...mockFichas], message: 'OK' };
  return api.get('/mantenedores/fichas-clinicas');
};

export const actualizarFicha = async (id, payload) => {
  if (USE_MOCKS) {
    mockFichas = mockFichas.map((f) =>
      f.id_ficha === id
        ? { ...f, diagnostico: payload.diagnostico.trim(), observaciones: payload.observaciones?.trim() || '' }
        : f
    );
    return { success: true, data: null, message: 'OK: Ficha clínica actualizada correctamente.' };
  }
  return api.put(`/mantenedores/fichas-clinicas/${id}`, payload);
};

export const eliminarFicha = async (id) => {
  if (USE_MOCKS) {
    mockFichas = mockFichas.filter((f) => f.id_ficha !== id);
    return { success: true, data: null, message: 'OK: Ficha clínica eliminada correctamente.' };
  }
  return api.delete(`/mantenedores/fichas-clinicas/${id}`);
};

export const getRecetas = async () => {
  if (USE_MOCKS) return { success: true, data: [...mockRecetas], message: 'OK' };
  return api.get('/mantenedores/recetas');
};

export const actualizarReceta = async (id, payload) => {
  if (USE_MOCKS) {
    const prod = mockProductos.find((p) => p.id_producto === Number(payload.id_producto));
    mockRecetas = mockRecetas.map((r) =>
      r.id_receta === id
        ? {
            ...r,
            id_producto: Number(payload.id_producto),
            medicamento: prod ? prod.nombre_producto : r.medicamento,
            indicaciones: payload.indicaciones.trim(),
          }
        : r
    );
    return { success: true, data: null, message: 'OK: Receta actualizada correctamente.' };
  }
  return api.put(`/mantenedores/recetas/${id}`, payload);
};

export const eliminarReceta = async (id) => {
  if (USE_MOCKS) {
    mockRecetas = mockRecetas.filter((r) => r.id_receta !== id);
    return { success: true, data: null, message: 'OK: Receta eliminada correctamente.' };
  }
  return api.delete(`/mantenedores/recetas/${id}`);
};

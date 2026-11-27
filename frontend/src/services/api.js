import axios from 'axios';

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const normalizeKeys = (value) => {
  if (Array.isArray(value)) return value.map(normalizeKeys);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k.toLowerCase(), normalizeKeys(v)])
    );
  }
  return value;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body) {
      return { ...body, data: normalizeKeys(body.data) };
    }
    return normalizeKeys(body);
  },
  (error) => {
    const payload = error.response?.data;
    return Promise.reject({
      success: false,
      data: null,
      message: payload?.message || error.message || 'Error de conexión con el servidor',
    });
  }
);

export default api;
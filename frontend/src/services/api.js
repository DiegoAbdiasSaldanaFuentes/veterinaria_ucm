import axios from 'axios';

// TODO: PATCH TEMPORAL - flag central para activar/desactivar mocks sin tocar componentes JSX
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Error de conexión con el servidor';
    return Promise.reject({ success: false, data: null, message });
  }
);

export default api;
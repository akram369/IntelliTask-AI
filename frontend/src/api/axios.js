import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://intellitask-ai.onrender.com/api"; // ❗ no trailing slash

console.log("API BASE:", API_BASE);

const api = axios.create({
  baseURL: API_BASE,
});

/* =========================
   🔐 REQUEST INTERCEPTOR
========================= */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // ❌ NO URL manipulation
  },
  (error) => Promise.reject(error)
);

/* =========================
   ⚠️ RESPONSE INTERCEPTOR
========================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network / CORS error
    if (!error.response) {
      console.error('Network/CORS Error:', error.message);

      // ❗ Replace alert with console (or toast later)
      console.warn("Backend unreachable");
    }

    // Unauthorized → logout
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
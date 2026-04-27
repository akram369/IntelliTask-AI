import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || "https://intellitask-ai.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor to add JWT token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle global network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('Network/CORS Error:', error.message);
      alert('Network Error: Unable to connect to the server. Please check your connection or try again later.');
    } else if (error.response.status === 401) {
      // Auto logout if token expires/invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

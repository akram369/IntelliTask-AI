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
});

export default api;

import axios from 'axios';
import { getCookie } from '../utils/helpers.js';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = getCookie('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
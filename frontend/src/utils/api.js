import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || 'https://fintrack-backend-e2tn.onrender.com';
const API = axios.create({ baseURL: `${API_BASE_URL}/api` });

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ftpro_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;

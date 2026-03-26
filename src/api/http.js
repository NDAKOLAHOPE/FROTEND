import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const http = axios.create({
  baseURL: API_BASE_URL,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const url = config?.url ?? '';
  // Evite les préflights CORS inutiles : auth/register & auth/login ne doivent pas envoyer Authorization.
  const isAuthEndpoint =
    url.startsWith('/auth/login') || url.startsWith('/auth/register');
  if (token && !isAuthEndpoint) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


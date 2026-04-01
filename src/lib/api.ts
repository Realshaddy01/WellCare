import axios from 'axios';

const api = axios.create({
  // In development (AI Studio), use the local server. In production, use the VITE_API_URL.
  baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

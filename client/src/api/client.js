import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('college_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear token and redirect if needed
      // (AuthContext will catch this)
    }
    return Promise.reject(error);
  }
);

export default api;

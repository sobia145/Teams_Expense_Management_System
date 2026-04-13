import axios from 'axios';

// Create a globally configured Axios instance targeting our Java Spring Boot backend!
// Say goodbye to the fake timer logic!
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log("🚀 TEMS API INITIALIZED WITH BASEURL:", api.defaults.baseURL);

// Deep JWT Security Propagation
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwtToken') : null;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;

import axios from 'axios';

// Create a globally configured Axios instance targeting our Java Spring Boot backend!
// Say goodbye to the fake timer logic!
const api = axios.create({
  // FORCE-FIX: Hardcoding because Netlify environment variable injection is failing
  baseURL: 'https://tems-backend-c2sd.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 seconds - Survives any Render cold start!
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

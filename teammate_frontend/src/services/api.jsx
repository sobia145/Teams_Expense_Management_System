import axios from 'axios';

// Create a globally configured Axios instance targeting our Java Spring Boot backend!
// Say goodbye to the fake timer logic!
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Maps directly to the Java Spring Boot Tomcat port
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure we send cookies securely if Spring Security re-activates
  withCredentials: true 
});

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

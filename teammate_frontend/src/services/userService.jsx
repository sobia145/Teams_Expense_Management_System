import api from './api';

export const userService = {
  // Mapped EXACTLY to the business workflow endpoint our mentor demanded!
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },
  
  // Future Login logic to generate Spring Security Tokens
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/users/all');
    return response.data;
  }
};

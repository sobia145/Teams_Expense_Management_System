import api from './api';

export const userService = {
  // Mapped EXACTLY to the business workflow endpoint our mentor demanded!
  register: async (userData) => {
    // Mapping frontend 'password' to backend 'passwordHash' for entity compatibility
    const payload = {
      name: userData.name,
      email: userData.email,
      passwordHash: userData.password
    };
    const response = await api.post('/auth/register', payload);
    return response.data;
  },
  
  // Future Login logic to generate Spring Security Tokens
  login: async (credentials) => {
    // Mapping frontend 'password' to backend 'passwordHash' for entity compatibility
    const payload = {
      email: credentials.email,
      passwordHash: credentials.password
    };
    const response = await api.post('/auth/login', payload);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/users/all');
    return response.data;
  }
};

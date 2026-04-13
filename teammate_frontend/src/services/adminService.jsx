import api from './api';

export const adminService = {
  getAnalytics: async () => {
    try {
      const response = await api.get('/admin/analytics');
      return response.data;
    } catch (err) {
      console.error('Failed fetching admin analytics', err);
      return null;
    }
  },

  getExpenses: async () => {
    try {
      const response = await api.get('/admin/expenses');
      return response.data;
    } catch (err) {
      console.error('Failed fetching global expenses', err);
      return [];
    }
  },

  getGroups: async () => {
    try {
      const response = await api.get('/admin/groups');
      return response.data;
    } catch (err) {
      console.error('Failed fetching global groups', err);
      return [];
    }
  },

  getUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (err) {
      console.error('Failed fetching global users', err);
      return [];
    }
  },

  getHistoryLogs: async () => {
    try {
      const response = await api.get('/history');
      return response.data;
    } catch (err) {
      console.error('Failed fetching global history logs', err);
      return [];
    }
  },

  getBudgetAlerts: async () => {
    try {
      const response = await api.get('/admin/budget-alerts');
      return response.data;
    } catch (err) {
      console.error('Failed fetching global budget alerts', err);
      return [];
    }
  }
};

import api from './api';

export const expenseService = {
  // Dual Role Expense Fetcher directly fetching real history from MySQL!
  getExpenses: async (user) => {
    if (!user) return [];
    try {
      const endpoint = user.role === 'ADMIN' ? '/expenses/admin' : `/expenses/user/${user.userId}`;
      const response = await api.get(endpoint);
      return response.data;
    } catch (err) {
      console.warn("Failed fetching live expenses");
      return []; 
    }
  },

  // 🚀 The Crown Jewel Integration
  // This physically hooks the React Add Form to our 6-Step Java Transaction Service!
  addExpense: async (expenseData) => {
    // expenseData payload perfectly mirrors our ExpenseRequest DTO Java class!
    const response = await api.post('/expenses/add', expenseData);
    return response.data;
  },

  updateStatus: async ({ expenseId, userId, status, reason }) => {
    // Directly update approval tickets in MySQL based on objection window
    // Now including the 'reason' payload for transparent team disputes
    const response = await api.post(`/approvals/${expenseId}/status/${userId}/${status}`, { reason });
    return response.data;
  },

  getPendingApprovals: async (userId) => {
    const response = await api.get(`/approvals/user/${userId}/pending`);
    return response.data;
  },

  getExpensesByGroup: async (groupId) => {
    const response = await api.get(`/expenses/group/${groupId}`);
    return response.data;
  },

  deleteExpense: async (id) => {
    // Persistent hard-delete of expense and its associated splits/approvals
    await api.delete(`/expenses/${id}`);
  }
};

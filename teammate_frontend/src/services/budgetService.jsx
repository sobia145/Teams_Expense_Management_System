import api from './api';
import { mockBudgets } from '../utils/constants';

export const budgetService = {
  getBudgetsByGroup: async (groupId) => {
    const res = await api.get(`/budgets/group/${groupId}`);
    return res.data;
  },
  saveBudget: async (budgetPayload) => {
    const res = await api.post('/budgets/save', budgetPayload);
    return res.data;
  }
};

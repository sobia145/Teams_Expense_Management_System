import api from './api';
import { mockBudgets } from '../utils/constants';

export const budgetService = {
  getBudgets: async () => api.get(mockBudgets),
  setBudget: async (budget) => api.post(budget)
};

import api from './api';
import { mockSettlements } from '../utils/constants';

export const settlementService = {
  getSettlements: async (groupId) => {
    const response = await api.get(`/settlements/group/${groupId}`);
    return response.data;
  },
  markPaid: async (settlementId) => {
    // Currently UI-only, but could be extended to backend
    return { success: true };
  }
};

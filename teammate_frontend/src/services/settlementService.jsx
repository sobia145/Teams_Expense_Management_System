import api from './api';

export const settlementService = {
  getSettlements: async (groupId) => {
    // Call the new persistent balance endpoint
    const response = await api.get('/getBalances', { params: { groupId } });
    
    // Map backend 'Debt' entity to the shape expected by SettlementTable.jsx
    return (response.data || []).map(debt => ({
        id: debt.debtId,
        groupId: debt.group.groupId,
        fromUserId: debt.debtor.userId,
        fromUserName: debt.debtor.name,
        from: debt.debtor.name, // Fallback
        toUserId: debt.creditor.userId,
        toUserName: debt.creditor.name,
        to: debt.creditor.name, // Fallback
        amount: debt.amount,
        status: 'UNPAID', // Debts in the DEBTS table are inherently unpaid
        teamName: debt.group.name
    }));
  },

  settlePayment: async (settlementData) => {
    // { groupId, fromUserId, toUserId, amount }
    const response = await api.post('/settlePayment', settlementData);
    return response.data;
  }
};

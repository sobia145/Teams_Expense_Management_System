import api from './api';

export const settlementService = {
  getSettlements: async (groupId) => {
    // Call the master combined endpoint for real-time synchronization
    const response = await api.get(`/settlements/combined/${groupId}`);
    
    // Map backend 'Debt' entity to the shape expected by SettlementTable.jsx
    return (response.data || []).map(item => ({
        id: item.id,
        groupId: item.groupId,
        fromUserId: item.fromUserId,
        fromUserName: item.fromUserName,
        from: item.fromUserName, 
        toUserId: item.toUserId,
        toUserName: item.toUserName,
        to: item.toUserName, 
        amount: item.amount,
        status: item.status, 
        settledAt: item.settledAt
    }));
  },

  settlePayment: async (settlementData) => {
    // { groupId, fromUserId, toUserId, amount }
    const response = await api.post('/settlePayment', settlementData);
    return response.data;
  },

  getUserSettlements: async (userId) => {
    const response = await api.get(`/settlements/user/${userId}`);
    return (response.data || []).map(item => ({
        id: item.id,
        groupId: item.groupId,
        groupName: item.groupName,
        fromUserId: item.fromUserId,
        fromUserName: item.fromUserName,
        from: item.fromUserName, 
        toUserId: item.toUserId,
        toUserName: item.toUserName,
        to: item.toUserName, 
        amount: item.amount,
        status: item.status, 
        settledAt: item.settledAt
    }));
  }
};

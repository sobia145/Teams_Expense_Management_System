import api from './api';

export const groupService = {
  createGroup: async (groupData, userId) => {
    const payload = { 
        name: groupData.name, 
        currency: "INR", 
        isDeleted: false,
        memberIds: groupData.memberIds
    };
    const response = await api.post(`/groups/create/${userId}`, payload);
    return response.data;
  },
  
  getGroups: async () => {
    try {
        const response = await api.get('/groups');
        return response.data;
    } catch(err) {
        return [];
    }
  },
  
  deleteGroup: async (groupId, userId) => {
    // Pipe the user ID into the query so the Global Admin History logger can track it!
    const response = await api.delete(`/groups/${groupId}?userId=${userId}`);
    return response.data;
  },

  // Hooked to the Group isolation workflow
  // Dual Role Group Fetcher (Admin vs Users)
  getGroupsForApp: async (user) => {
    if (!user) return [];
    try {
        const endpoint = user.role === 'ADMIN' ? '/groups/admin' : `/groups/user/${user.userId}`;
        const response = await api.get(endpoint);
        return response.data;
    } catch(err) {
        console.error("Failed fetching live groups", err);
        return [];
    }
  },

  // Pulls only the users inside the requested group securely!
  getGroupMembers: async (groupId) => {
    try {
        const response = await api.get(`/groups/${groupId}/members`);
        return response.data;
    } catch(err) {
        return [];
    }
  },

  lockGroup: async (groupId) => {
    const response = await api.put(`/groups/${groupId}/lock`);
    return response.data;
  }
};

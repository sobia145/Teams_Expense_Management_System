import api from './api';
import { mockNotifications } from '../utils/constants';

export const notificationService = {
  getNotifications: async () => api.get(mockNotifications),
  markRead: async (notificationId) => api.patch({ notificationId, read: true })
};

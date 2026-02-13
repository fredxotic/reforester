import api from './api';

export const chatAPI = {
  getProjectMessages: async (projectId, page = 1, limit = 50) => {
    const response = await api.get(`/api/chat/project/${projectId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  getTeamMessages: async (teamId, page = 1, limit = 50) => {
    const response = await api.get(`/api/chat/team/${teamId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await api.post('/api/chat', messageData);
    return response.data;
  },

  markMessagesRead: async (messageIds, projectId) => {
    const response = await api.post('/api/chat/mark-read', {
      messageIds,
      projectId
    });
    return response.data;
  }
};
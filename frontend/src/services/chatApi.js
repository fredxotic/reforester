import api from './api';

export const chatAPI = {
  // Get project messages
  getProjectMessages: async (projectId, page = 1, limit = 50) => {
    const response = await api.get(`/chat/project/${projectId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Get team messages
  getTeamMessages: async (teamId, page = 1, limit = 50) => {
    const response = await api.get(`/chat/team/${teamId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Send message
  sendMessage: async (messageData) => {
    const response = await api.post('/chat', messageData);
    return response.data;
  },

  // Mark messages as read
  markMessagesRead: async (messageIds, projectId) => {
    const response = await api.post('/chat/mark-read', {
      messageIds,
      projectId
    });
    return response.data;
  }
};
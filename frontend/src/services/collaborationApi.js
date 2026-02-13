import api from './api';

export const collaborationAPI = {
  shareProject: async (projectId, teamId, permissions) => {
    const response = await api.post('/api/collaboration/share-project', {
      projectId,
      teamId,
      permissions
    });
    return response.data;
  },

  getProjectCollaborations: async (projectId) => {
    const response = await api.get(`/api/collaboration/project/${projectId}`);
    return response.data;
  },

  updateCollaboration: async (collaborationId, permissions) => {
    const response = await api.put(`/api/collaboration/${collaborationId}`, {
      permissions
    });
    return response.data;
  },

  removeCollaboration: async (collaborationId) => {
    const response = await api.delete(`/api/collaboration/${collaborationId}`);
    return response.data;
  }
};
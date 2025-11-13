import api from './api';

export const collaborationAPI = {
  // Share project with team
  shareProject: async (projectId, teamId, permissions) => {
    const response = await api.post('/collaboration/share-project', {
      projectId,
      teamId,
      permissions
    });
    return response.data;
  },

  // Get project collaborations
  getProjectCollaborations: async (projectId) => {
    const response = await api.get(`/collaboration/project/${projectId}`);
    return response.data;
  },

  // Update collaboration
  updateCollaboration: async (collaborationId, permissions) => {
    const response = await api.put(`/collaboration/${collaborationId}`, {
      permissions
    });
    return response.data;
  },

  // Remove collaboration
  removeCollaboration: async (collaborationId) => {
    const response = await api.delete(`/collaboration/${collaborationId}`);
    return response.data;
  }
};
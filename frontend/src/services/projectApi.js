import api from './api';

export const projectAPI = {
  getProjects: async (params = {}) => {
    const response = await api.get('/api/projects', { params });
    return response.data;
  },

  getProject: async (id) => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post('/api/projects', projectData);
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const response = await api.put(`/api/projects/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/api/projects/${id}`);
    return response.data;
  },

  createFromAnalysis: async (projectData) => {
    const response = await api.post('/api/projects/from-analysis', projectData);
    return response.data;
  },

  addTeamMember: async (projectId, userId, role = 'contributor') => {
    const response = await api.post(`/api/projects/${projectId}/team`, {
      userId,
      role
    });
    return response.data;
  },

  removeTeamMember: async (projectId, userId) => {
    const response = await api.delete(`/api/projects/${projectId}/team/${userId}`);
    return response.data;
  },

  addMilestone: async (projectId, milestoneData) => {
    const response = await api.post(`/api/projects/${projectId}/milestones`, milestoneData);
    return response.data;
  },

  updateMilestone: async (projectId, milestoneId, completed) => {
    const response = await api.put(`/api/projects/${projectId}/milestones/${milestoneId}`, {
      completed
    });
    return response.data;
  },

  getAnalytics: async (projectId) => {
    const response = await api.get(`/api/projects/${projectId}/analytics`);
    return response.data;
  }
};
import api from './api';

export const projectAPI = {
  // Get all projects
  getProjects: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  // Get single project
  getProject: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Create new project
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Update project
  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  // Create project from analysis
  createFromAnalysis: async (projectData) => {
    const response = await api.post('/projects/from-analysis', projectData);
    return response.data;
  },

  // Add team member
  addTeamMember: async (projectId, userId, role = 'contributor') => {
    const response = await api.post(`/projects/${projectId}/team`, {
      userId,
      role
    });
    return response.data;
  },

  // Remove team member
  removeTeamMember: async (projectId, userId) => {
    const response = await api.delete(`/projects/${projectId}/team/${userId}`);
    return response.data;
  },

  // Add milestone
  addMilestone: async (projectId, milestoneData) => {
    const response = await api.post(`/projects/${projectId}/milestones`, milestoneData);
    return response.data;
  },

  // Update milestone
  updateMilestone: async (projectId, milestoneId, completed) => {
    const response = await api.put(`/projects/${projectId}/milestones/${milestoneId}`, {
      completed
    });
    return response.data;
  },

  // Get project analytics
  getAnalytics: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/analytics`);
    return response.data;
  }
};
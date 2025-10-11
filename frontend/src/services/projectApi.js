import api from './api';

export const projectAPI = {
  // Get all projects
  getProjects: async (params = {}) => {
    const response = await api.get('/api/projects', { params }); // ✅ Added /api
    return response.data;
  },

  // Get single project
  getProject: async (id) => {
    const response = await api.get(`/api/projects/${id}`); // ✅ Added /api
    return response.data;
  },

  // Create new project
  createProject: async (projectData) => {
    const response = await api.post('/api/projects', projectData); // ✅ Added /api
    return response.data;
  },

  // Update project
  updateProject: async (id, projectData) => {
    const response = await api.put(`/api/projects/${id}`, projectData); // ✅ Added /api
    return response.data;
  },

  // Delete project
  deleteProject: async (id) => {
    const response = await api.delete(`/api/projects/${id}`); // ✅ Added /api
    return response.data;
  },

  // Create project from analysis
  createFromAnalysis: async (projectData) => {
    const response = await api.post('/api/projects/from-analysis', projectData); // ✅ Added /api
    return response.data;
  },

  // Add team member
  addTeamMember: async (projectId, userId, role = 'contributor') => {
    const response = await api.post(`/api/projects/${projectId}/team`, { // ✅ Added /api
      userId,
      role
    });
    return response.data;
  },

  // Remove team member
  removeTeamMember: async (projectId, userId) => {
    const response = await api.delete(`/api/projects/${projectId}/team/${userId}`); // ✅ Added /api
    return response.data;
  },

  // Add milestone
  addMilestone: async (projectId, milestoneData) => {
    const response = await api.post(`/api/projects/${projectId}/milestones`, milestoneData); // ✅ Added /api
    return response.data;
  },

  // Update milestone
  updateMilestone: async (projectId, milestoneId, completed) => {
    const response = await api.put(`/api/projects/${projectId}/milestones/${milestoneId}`, { // ✅ Added /api
      completed
    });
    return response.data;
  },

  // Get project analytics
  getAnalytics: async (projectId) => {
    const response = await api.get(`/api/projects/${projectId}/analytics`); // ✅ Added /api
    return response.data;
  }
};
import api from './api';

export const analyticsAPI = {
  // Get analytics overview
  getOverview: async () => {
    const response = await api.get('/analytics/overview');
    return response.data;
  },

  // Get growth projections for a project
  getGrowthProjections: async (projectId) => {
    const response = await api.get(`/analytics/project/${projectId}/growth-projections`);
    return response.data;
  },

  // Get carbon sequestration timeline
  getCarbonTimeline: async (projectId) => {
    const response = await api.get(`/analytics/project/${projectId}/carbon-timeline`);
    return response.data;
  },

  // Get biodiversity impact
  getBiodiversityImpact: async (projectId) => {
    const response = await api.get(`/analytics/project/${projectId}/biodiversity`);
    return response.data;
  },

  // Get financial analytics
  getFinancialAnalytics: async (projectId) => {
    const response = await api.get(`/analytics/project/${projectId}/financial`);
    return response.data;
  },

  // Get comparative analytics
  getComparativeAnalytics: async (params = {}) => {
    const response = await api.get('/analytics/comparative', { params });
    return response.data;
  }
};
import api from './api';

export const analyticsAPI = {
  // Get analytics overview
  getOverview: async () => {
    const response = await api.get('/api/analytics/overview'); // ✅ Added /api
    return response.data;
  },

  // Get growth projections for a project
  getGrowthProjections: async (projectId) => {
    const response = await api.get(`/api/analytics/project/${projectId}/growth-projections`); // ✅ Added /api
    return response.data;
  },

  // Get carbon sequestration timeline
  getCarbonTimeline: async (projectId) => {
    const response = await api.get(`/api/analytics/project/${projectId}/carbon-timeline`); // ✅ Added /api
    return response.data;
  },

  // Get biodiversity impact
  getBiodiversityImpact: async (projectId) => {
    const response = await api.get(`/api/analytics/project/${projectId}/biodiversity`); // ✅ Added /api
    return response.data;
  },

  // Get financial analytics
  getFinancialAnalytics: async (projectId) => {
    const response = await api.get(`/api/analytics/project/${projectId}/financial`); // ✅ Added /api
    return response.data;
  },

  // Get comparative analytics
  getComparativeAnalytics: async (params = {}) => {
    const response = await api.get('/api/analytics/comparative', { params }); // ✅ Added /api
    return response.data;
  }
};
import api from './api';

export const analyticsAPI = {
  // Get analytics overview
  getOverview: async () => {
    const response = await api.get('/analytics/overview'); // ✅ FIXED: Removed /api
    return response.data;
  },

  // Get growth projections for a project
  getGrowthProjections: async (projectId) => {
    const response = await api.get(`/analytics/project/${projectId}/growth-projections`); // ✅ FIXED: Removed /api
    return response.data;
  },

  // Get carbon sequestration timeline
  getCarbonTimeline: async (projectId) => {
    const response = await api.get(`/analytics/project/${projectId}/carbon-timeline`); // ✅ FIXED: Removed /api
    return response.data;
  },

  // Get biodiversity impact
  getBiodiversityImpact: async (projectId) => {
    const response = await api.get(`/analytics/project/${projectId}/biodiversity`); // ✅ FIXED: Removed /api
    return response.data;
  },

  // Get financial analytics
  getFinancialAnalytics: async (projectId) => {
    const response = await api.get(`/analytics/project/${projectId}/financial`); // ✅ FIXED: Removed /api
    return response.data;
  },

  // Get comparative analytics
  getComparativeAnalytics: async (params = {}) => {
    const response = await api.get('/analytics/comparative', { params }); // ✅ FIXED: Removed /api
    return response.data;
  }
};
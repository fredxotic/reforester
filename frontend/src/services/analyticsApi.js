import api from './api';

export const analyticsAPI = {
  getOverview: async () => {
    const response = await api.get('/api/analytics/overview');
    return response.data;
  },

  getGrowthProjections: async (projectId) => {
    const response = await api.get(`/api/analytics/project/${projectId}/growth-projections`);
    return response.data;
  },

  getCarbonTimeline: async (projectId) => {
    const response = await api.get(`/api/analytics/project/${projectId}/carbon-timeline`);
    return response.data;
  },

  getBiodiversityImpact: async (projectId) => {
    const response = await api.get(`/api/analytics/project/${projectId}/biodiversity`);
    return response.data;
  },

  getFinancialAnalytics: async (projectId) => {
    const response = await api.get(`/api/analytics/project/${projectId}/financial`);
    return response.data;
  },

  getComparativeAnalytics: async (params = {}) => {
    const response = await api.get('/api/analytics/comparative', { params });
    return response.data;
  }
};
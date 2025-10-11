import api from './api';

export const reforestAPI = {
  // ✅ FIXED: Now calls /api/reforest (not /api/reforest/reforest)
  analyzeLocation: async (lat, lon) => {
    const response = await api.post('/api/reforest', { lat, lon });
    return response.data;
  },
  
  healthCheck: async () => {
    const response = await api.get('/api/health');
    return response.data;
  },
  
  downloadPDF: async (analysisData) => {
    const response = await api.post('/api/reforest/download-pdf', { analysisData });
    return response.data;
  },
  
  getBiomes: async () => {
    const response = await api.get('/api/reforest/biomes');
    return response.data;
  }
};
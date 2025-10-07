import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API response error:', error);
    
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.message || `Server error: ${error.response.status}`);
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Network error: Could not connect to server');
    } else {
      // Something else happened
      throw new Error('Request configuration error');
    }
  }
);

// API methods
export const reforestAPI = {
  analyzeLocation: async (lat, lon) => {
    const response = await api.post('/reforest', { lat, lon });
    return response.data;
  },
  
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
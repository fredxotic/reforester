import axios from 'axios';

const API_BASE_URL = 'https://api-reforester.vercel.app';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('reforester_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('reforester_token');
      window.dispatchEvent(new Event('authError'));
    }
    
    if (error.response) {
      throw new Error(error.response.data.message || `Server error: ${error.response.status}`);
    } else if (error.request) {
      throw new Error('Network error: Could not connect to server');
    } else {
      throw new Error('Request configuration error');
    }
  }
);

// ✅ FIXED: All routes now have /api prefix
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  
  googleLogin: async (googleToken) => {
    const response = await api.post('/api/auth/google', { token: googleToken });
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  },
  
  resendVerification: async (email) => {
    const response = await api.post('/api/auth/resend-verification', { email });
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token, password) => {
    const response = await api.post('/api/auth/reset-password', { token, password });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  }
};

export const reforestAPI = {
  analyzeLocation: async (lat, lon) => {
    const response = await api.post('/api/reforest', { lat, lon });
    return response.data;
  },
  
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
  
  downloadPDF: async (analysisData) => {
    const response = await api.post('/api/download-pdf', { analysisData });
    return response.data;
  }
};

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
  }
};

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
  }
};

export default api;
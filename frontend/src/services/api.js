import axios from 'axios';

const API_BASE_URL = 'https://api-reforester.vercel.app';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('reforester_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Making API request to: ${config.baseURL}${config.url}`);
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
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('reforester_token');
      // You might want to redirect to login page here
      window.dispatchEvent(new Event('authError'));
    }
    
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
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  
  googleAuth: async (googleToken) => {
    const response = await api.post('/api/auth/google', { token: googleToken });
    return response.data;
  },
  
  verifyEmail: async (token) => {
    const response = await api.post('/api/auth/verify-email', { token });
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
  }
};

export const projectsAPI = {
  getProjects: async () => {
    const response = await api.get('/api/projects');
    return response.data;
  },
  
  createProject: async (projectData) => {
    const response = await api.post('/api/projects', projectData);
    return response.data;
  },
  
  getProject: async (id) => {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  }
};

export default api;
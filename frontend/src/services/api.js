import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-reforester.vercel.app';

// ⚠️ ENHANCEMENT: Conditional Logging
if (import.meta.env.DEV) {
  console.log('🔧 API Base URL:', API_BASE_URL);
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // IMPORTANT: Sends HTTP-only cookie automatically
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // ⚠️ SECURITY FIX: Removed token storage/retrieval logic from client-side
    // The browser automatically sends the secure 'jwt' cookie due to withCredentials: true

    if (import.meta.env.DEV) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
        console.error('❌ API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
        console.error('❌ API Response Error:', error.response?.status, error.config?.url);
    }
    
    // Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      // ⚠️ SECURITY FIX: Removed localStorage token cleanup
      // Dispatch a custom event for AuthContext to catch and handle app-wide logout/redirect
      window.dispatchEvent(new Event('authError'));
    }
    
    if (error.response) {
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     `Server error: ${error.response.status}`;
                     
      // ⚠️ ENHANCEMENT: Attach original response to error object
      // This allows components like Login.jsx to check for custom error codes (e.g., EMAIL_UNVERIFIED)
      const customError = new Error(message);
      customError.response = error.response;
      throw customError;
    } else if (error.request) {
      throw new Error('Network error: Could not connect to server. Please check your connection.');
    } else {
      throw new Error('Request configuration error');
    }
  }
);

export default api;
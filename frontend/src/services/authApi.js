import api from './api';

export const authAPI = {
  // Email/Password Registration
  register: async (userData) => {
    const response = await api.post('/auth/register', userData); // FIXED: Removed /api prefix
    return response.data;
  },

  // Email/Password Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials); // FIXED: Removed /api prefix
    return response.data;
  },

  // Google OAuth Login
  googleLogin: async (googleToken) => {
    const response = await api.post('/auth/google', { token: googleToken }); // FIXED: Removed /api prefix
    return response.data;
  },

  // Verify Email
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token }); // FIXED: Removed /api prefix
    return response.data;
  },

  // Resend Verification Email
  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email }); // FIXED: Removed /api prefix
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email }); // FIXED: Removed /api prefix
    return response.data;
  },

  // Reset Password
  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password }); // FIXED: Removed /api prefix
    return response.data;
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await api.get('/auth/me'); // FIXED: Removed /api prefix
    return response.data.user || response.data; // Handle both response formats
  },

  // Update Profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData); // FIXED: Removed /api prefix
    return response.data;
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('reforester_token');
    localStorage.removeItem('reforester_user');
    window.dispatchEvent(new Event('logout'));
  }
};
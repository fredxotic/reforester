import api from './api';

export const authAPI = {
  // Email/Password Registration
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData); // ✅ Added /api
    return response.data;
  },

  // Email/Password Login
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials); // ✅ Added /api
    return response.data;
  },

  // Google OAuth Login
  googleLogin: async (googleToken) => {
    const response = await api.post('/api/auth/google', { token: googleToken }); // ✅ Added /api
    return response.data;
  },

  // Verify Email
  verifyEmail: async (token) => {
    const response = await api.post('/api/auth/verify-email', { token }); // ✅ Added /api
    return response.data;
  },

  // Resend Verification Email
  resendVerification: async (email) => {
    const response = await api.post('/api/auth/resend-verification', { email }); // ✅ Added /api
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email }); // ✅ Added /api
    return response.data;
  },

  // Reset Password
  resetPassword: async (token, password) => {
    const response = await api.post('/api/auth/reset-password', { token, password }); // ✅ Added /api
    return response.data;
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me'); // ✅ Added /api
    return response.data.user;
  },

  // Update Profile
  updateProfile: async (profileData) => {
    const response = await api.put('/api/auth/profile', profileData); // ✅ Added /api
    return response.data;
  }
};
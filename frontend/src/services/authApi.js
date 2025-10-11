import api from './api';

export const authAPI = {
  // Email/Password Registration
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // Email/Password Login
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  // Google OAuth Login
  googleLogin: async (googleToken) => {
    const response = await api.post('/api/auth/google', { token: googleToken });
    return response.data;
  },

  // Verify Email
  verifyEmail: async (token) => {
    const response = await api.post('/api/auth/verify-email', { token });
    return response.data;
  },

  // Resend Verification Email
  resendVerification: async (email) => {
    const response = await api.post('/api/auth/resend-verification', { email });
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  // Reset Password
  resetPassword: async (token, password) => {
    const response = await api.post('/api/auth/reset-password', { token, password });
    return response.data;
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data.user || response.data; // Handle both response formats
  },

  // Update Profile
  updateProfile: async (profileData) => {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('reforester_token');
    localStorage.removeItem('reforester_user');
    window.dispatchEvent(new Event('logout'));
  }
};
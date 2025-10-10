import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/authApi';

const Register = ({ onSwitchToLogin, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();

  const googleInitialized = useRef(false);
  const googleButtonRendered = useRef(false);

  // Load and initialize Google OAuth
  useEffect(() => {
    const initializeGoogleOAuth = () => {
      if (googleInitialized.current || !window.google) return;

      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'use',
          ux_mode: 'popup'
        });

        googleInitialized.current = true;

        // Render Google button
        renderGoogleButton();

      } catch (err) {
        console.error('Google OAuth initialization failed');
      }
    };

    const renderGoogleButton = () => {
      if (!googleInitialized.current || googleButtonRendered.current) return;

      try {
        const buttonContainer = document.getElementById('googleRegisterButton');
        if (buttonContainer && window.google) {
          window.google.accounts.id.renderButton(buttonContainer, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signup_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });
          googleButtonRendered.current = true;
        }
      } catch (err) {
        console.error('Google button render failed');
      }
    };

    // If Google script is already loaded
    if (window.google) {
      initializeGoogleOAuth();
      return;
    }

    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleOAuth;
    script.onerror = () => {
      setError('Failed to load Google Sign-In. Please try another method.');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const result = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (result.requiresVerification) {
        setSuccess('Registration successful! Please check your email for verification instructions.');
        // Don't auto-login if verification is required
      } else {
        await login(result.user, result.token);
        onClose?.();
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (response) => {
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      setGoogleLoading(true);
      setError('');
      setSuccess('');

      const result = await authAPI.googleLogin(response.credential);
      await login(result.user, result.token);
      onClose?.();
    } catch (err) {
      console.error('Google OAuth error:', err);
      
      if (err.response?.data?.error) {
        setError(`Google authentication failed: ${err.response.data.error}`);
      } else if (err.message?.includes('Network Error')) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Google authentication failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleManualGoogleRegister = () => {
    if (!googleInitialized.current) {
      setError('Google Sign-In is still loading. Please wait...');
      return;
    }

    try {
      window.google.accounts.id.prompt();
    } catch (err) {
      setError('Failed to start Google Sign-In');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl shadow-lg border border-emerald-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-emerald-900 mb-2">Create Account</h2>
        <p className="text-emerald-700">Join ReForester and start your reforestation journey</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center space-x-2 text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center space-x-2 text-emerald-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-emerald-700 mb-2">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder-emerald-400"
            placeholder="Enter your full name"
            disabled={loading || googleLoading}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-emerald-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder-emerald-400"
            placeholder="Enter your email"
            disabled={loading || googleLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-emerald-700 mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder-emerald-400"
            placeholder="Create a password (min. 6 characters)"
            disabled={loading || googleLoading}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-emerald-700 mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder-emerald-400"
            placeholder="Confirm your password"
            disabled={loading || googleLoading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-emerald-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-emerald-700">Or sign up with</span>
          </div>
        </div>

        {/* Google OAuth Section */}
        <div className="mt-4">
          <div id="googleRegisterButton" className="w-full"></div>
          
          {/* Fallback Google Button */}
          {!googleButtonRendered.current && (
            <button
              onClick={handleManualGoogleRegister}
              disabled={googleLoading || loading || !googleInitialized.current}
              className="w-full flex items-center justify-center space-x-3 bg-white border border-emerald-300 hover:bg-emerald-50 disabled:bg-gray-100 disabled:border-gray-300 text-emerald-700 disabled:text-gray-400 font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting to Google...</span>
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign up with Google</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-emerald-700">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-emerald-600 hover:text-emerald-700 font-medium underline transition-colors"
            disabled={loading || googleLoading}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
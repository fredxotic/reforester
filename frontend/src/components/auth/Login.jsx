import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/authApi';

// Assuming lucide-react or similar is used/available for icons
const EyeIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeOffIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.23 18.23 0 0 1 2.5-3.37m3.11-3.11A13.47 13.47 0 0 1 12 4c7 0 10 7 10 7a18.2 18.2 0 0 1-1.25 1.77M1 1l22 22"></path><line x1="10" y1="14" x2="14" y2="10"></line></svg>;

const Login = ({ onSwitchToRegister, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  // ⚠️ NEW STATE: Password visibility
  const [showPassword, setShowPassword] = useState(false); 
  const [resendEmail, setResendEmail] = useState('');
  const [showResendVerification, setShowResendVerification] = useState(false);
  const { login } = useAuth();
  
  const googleInitialized = useRef(false);
  const googleButtonRendered = useRef(false);

  // Load and initialize Google OAuth
  useEffect(() => {
    const initializeGoogleOAuth = () => {
      if (googleInitialized.current || !window.google) return;

      try {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        
        if (!clientId) {
          console.error('Google Client ID is missing');
          setError('Google Sign-In is not configured properly.');
          return;
        }

        if (import.meta.env.DEV) {
            console.log('Initializing Google OAuth with client ID:', clientId.substring(0, 10) + '...');
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: 'use',
          ux_mode: 'popup'
        });

        googleInitialized.current = true;
        renderGoogleButton();

      } catch (err) {
        if (import.meta.env.DEV) {
            console.error('Google OAuth initialization failed:', err);
        }
        setError('Failed to initialize Google Sign-In.');
      }
    };

    const renderGoogleButton = () => {
      if (!googleInitialized.current || googleButtonRendered.current) return;

      try {
        const buttonContainer = document.getElementById('googleButton');
        if (buttonContainer && window.google) {
          window.google.accounts.id.renderButton(buttonContainer, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: '100%', // This might cause the warning, but it's acceptable
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });
          googleButtonRendered.current = true;
        }
      } catch (err) {
        if (import.meta.env.DEV) {
            console.error('Google button render failed');
        }
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
    setShowResendVerification(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authAPI.login(formData);
      // NOTE: result.token might be absent since it's in an httpOnly cookie, 
      // but the result.user object confirms successful login for the context.
      await login(result.user, result.token); 
      onClose?.();
    } catch (err) {
      // ⚠️ ENHANCEMENT: Check for explicit errorCode (Non-fragile error handling)
      const errorCode = err.response?.data?.errorCode; 
      
      if (errorCode === 'EMAIL_UNVERIFIED') {
        setResendEmail(formData.email);
        setShowResendVerification(true);
        setError('Please verify your email address before logging in.');
      } else {
        // Fallback to original message
        setError(err.message || 'Login failed. Please try again.');
      }
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

      const result = await authAPI.googleLogin(response.credential);
      await login(result.user, result.token);
      onClose?.();
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Google OAuth error:', err);
      }
      
      // Handle specific error cases
      if (err.response?.data?.errorCode === 'EMAIL_UNVERIFIED') {
        setError('Please verify your email address before logging in with Google.');
      } else if (err.response?.data?.error) {
        setError(`Google authentication failed: ${err.response.data.error}`);
      } else if (err.message?.includes('Network error')) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Google authentication failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleManualGoogleLogin = () => {
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

  const handleResendVerification = async () => {
    if (!resendEmail) return;
    
    try {
      setLoading(true);
      await authAPI.resendVerification(resendEmail);
      setError('Verification email sent! Please check your inbox and spam folder.');
      setShowResendVerification(false);
    } catch (err) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleForgotPassword = () => {
    // You can implement forgot password logic here
    setError('Password reset feature coming soon. Please contact support for now.');
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-emerald-900 mb-2">Welcome Back</h2>
        <p className="text-emerald-700">Sign in to your ReForester account</p>
      </div>

      {/* Error Display */}
      {error && !error.includes('Verification email sent') && !showResendVerification && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start space-x-2 text-red-700">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <span className="font-medium">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Success Message for Verification Email */}
      {error.includes('Verification email sent') && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start space-x-2 text-green-700">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <span className="font-medium">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Resend Verification Section */}
      {showResendVerification && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start space-x-2 text-blue-700">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium mb-2">Resend Verification Email</p>
              <p className="text-sm mb-3">We'll send a new verification link to:</p>
              <p className="font-mono text-sm bg-blue-100 p-2 rounded mb-3">{resendEmail}</p>
              <div className="flex space-x-3">
                <button
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  {loading ? 'Sending...' : 'Send Verification Email'}
                </button>
                <button
                  onClick={() => setShowResendVerification(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
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
            className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder-gray-400"
            placeholder="Enter your email"
            disabled={loading || googleLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-emerald-700 mb-2">
            Password
          </label>
          {/* ⚠️ ENHANCEMENT: Password toggle container */}
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 pr-12 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder-gray-400"
              placeholder="Enter your password"
              disabled={loading || googleLoading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={loading || googleLoading}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-600 disabled:text-gray-400 transition-colors focus:outline-none focus:ring-0"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Signing In...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* OAuth Separator */}
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-emerald-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-emerald-700 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Section */}
        <div className="mt-6">
          <div id="googleButton" className="w-full"></div>
          
          {/* Fallback Google Button */}
          {!googleButtonRendered.current && (
            <button
              onClick={handleManualGoogleLogin}
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
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-8 text-center space-y-4">
        <div>
          <button
            onClick={onSwitchToRegister}
            disabled={loading || googleLoading}
            className="text-emerald-600 hover:text-emerald-700 font-medium disabled:text-gray-400 transition-colors"
          >
            Don't have an account? Sign up
          </button>
        </div>
        
        <div>
          <button 
            onClick={handleForgotPassword}
            disabled={loading || googleLoading}
            className="text-sm text-emerald-500 hover:text-emerald-600 disabled:text-gray-400 transition-colors"
          >
            Forgot your password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
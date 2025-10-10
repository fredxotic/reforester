import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/authApi';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(3); // For success redirect countdown

  // Countdown timer for success redirect
  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        console.log('Verifying email with token:', token);
        const result = await authAPI.verifyEmail(token);
        
        setStatus('success');
        setMessage('Email verified successfully! You are being logged in...');
        
        // Auto-login if we have a token
        if (result.token) {
          await login(result.user, result.token);
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        
        // More specific error messages
        if (error.message?.includes('expired') || error.message?.includes('invalid')) {
          setMessage('This verification link has expired or is invalid. Please request a new verification email.');
        } else if (error.message?.includes('already verified')) {
          setMessage('This email address has already been verified. You can proceed to login.');
          setTimeout(() => navigate('/auth?view=login'), 3000);
        } else {
          setMessage(error.message || 'Failed to verify email. Please try again.');
        }
      }
    };

    verifyEmail();
  }, [searchParams, login, navigate]);

  const handleGoHome = () => navigate('/');
  const handleSignIn = () => navigate('/auth?view=login');
  const handleResendVerification = () => navigate('/auth?view=verify-resend');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 text-center p-8">
          {/* Animated Icons */}
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-emerald-100">
            {status === 'verifying' && (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <span className="text-xs text-emerald-600 font-medium">Verifying...</span>
              </div>
            )}
            {status === 'success' && (
              <div className="animate-bounce">
                <span className="text-3xl text-emerald-600">✅</span>
              </div>
            )}
            {status === 'error' && (
              <span className="text-3xl text-red-600">❌</span>
            )}
          </div>

          {/* Headings */}
          <h1 className="text-2xl font-bold text-emerald-900 mb-4">
            {status === 'verifying' && 'Verifying Your Email...'}
            {status === 'success' && 'Email Verified Successfully!'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          {/* Messages */}
          <p className="text-emerald-700 mb-6">
            {message}
          </p>

          {/* Success State */}
          {status === 'success' && (
            <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-700 mb-2">
                ✅ Your account has been verified and you're now logged in.
              </p>
              <p className="text-sm text-emerald-600 font-medium">
                Redirecting to home page in {countdown} seconds...
              </p>
              <button
                onClick={handleGoHome}
                className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Go to Home Now
              </button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={handleGoHome}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Go to Home
              </button>
              <button
                onClick={handleSignIn}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Sign In
              </button>
              {message.includes('expired') || message.includes('invalid') ? (
                <button
                  onClick={handleResendVerification}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  Resend Verification Email
                </button>
              ) : null}
            </div>
          )}

          {/* Loading Progress Bar */}
          {status === 'verifying' && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This may take a few seconds...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthModal = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState('login');

  if (!isOpen) return null;

  const handleClose = () => {
    setCurrentView('login');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-emerald-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🌱</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-900">
                  {currentView === 'login' ? 'Sign In' : 'Create Account'}
                </h2>
                <p className="text-sm text-emerald-600">
                  {currentView === 'login' ? 'Access your account' : 'Join ReForester today'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentView === 'login' ? (
            <Login 
              onSwitchToRegister={() => setCurrentView('register')}
              onClose={handleClose}
            />
          ) : (
            <Register 
              onSwitchToLogin={() => setCurrentView('login')}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
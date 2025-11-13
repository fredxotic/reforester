import React from 'react';

const AuthRequiredView = ({ title, description, onAuth }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      <div className="max-w-md w-full mx-4">
        <div className="card text-center py-12">
          <div className="w-32 h-32 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <span className="text-5xl">🔒</span>
          </div>
          
          <h2 className="text-3xl font-bold text-amber-900 mb-4">
            {title}
          </h2>
          
          <p className="text-amber-700 text-lg mb-8 leading-relaxed">
            {description}
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center space-x-2 bg-amber-50 p-3 rounded-lg">
              <span className="text-amber-600">📊</span>
              <span className="text-sm text-amber-800">Project Management</span>
            </div>
            <div className="flex items-center space-x-2 bg-amber-50 p-3 rounded-lg">
              <span className="text-amber-600">👥</span>
              <span className="text-sm text-amber-800">Team Collaboration</span>
            </div>
            <div className="flex items-center space-x-2 bg-amber-50 p-3 rounded-lg">
              <span className="text-amber-600">📈</span>
              <span className="text-sm text-amber-800">Advanced Analytics</span>
            </div>
            <div className="flex items-center space-x-2 bg-amber-50 p-3 rounded-lg">
              <span className="text-amber-600">💾</span>
              <span className="text-sm text-amber-800">Save Progress</span>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="space-y-4">
            <button
              onClick={onAuth}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-4 px-6 rounded-xl transition-colors text-lg shadow-lg hover:shadow-xl"
            >
              Sign In to Continue
            </button>
            
            <div className="text-center">
              <p className="text-amber-600 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={onAuth}
                  className="text-amber-800 hover:text-amber-900 font-medium underline"
                >
                  Sign up free
                </button>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-amber-200">
            <div className="flex justify-center space-x-6 text-xs text-amber-600">
              <div className="text-center">
                <div className="text-lg">🌱</div>
                <div>Free Forever</div>
              </div>
              <div className="text-center">
                <div className="text-lg">🔒</div>
                <div>Secure</div>
              </div>
              <div className="text-center">
                <div className="text-lg">🚀</div>
                <div>Instant Access</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredView;
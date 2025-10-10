import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/authApi';

const UserProfile = () => {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    preferences: user?.preferences || {
      units: 'metric',
      notifications: {
        email: true,
        projectUpdates: true
      }
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefField = name.split('.')[1];
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          [prefField]: type === 'checkbox' ? checked : value
        }
      });
    } else if (name.startsWith('notifications.')) {
      const notifField = name.split('.')[1];
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          notifications: {
            ...formData.preferences.notifications,
            [notifField]: checked
          }
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await authAPI.updateProfile(formData);
      updateUser(result.user);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-emerald-900">Profile Settings</h2>
            <p className="text-emerald-700">Manage your account preferences</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.includes('Error') 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}>
            {message}
          </div>
        )}

        {/* User Info */}
        <div className="flex items-center space-x-4 mb-8 p-4 bg-emerald-50 rounded-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-900">{user.name}</h3>
            <p className="text-emerald-700">{user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs rounded-full ${
                user.emailVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {user.emailVerified ? '✓ Verified' : '⚠ Not Verified'}
              </span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-semibold text-emerald-900 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl bg-gray-100 cursor-not-allowed"
                  />
                  {!user.emailVerified && (
                    <p className="text-amber-600 text-sm mt-2">
                      Your email is not verified. Please check your inbox for verification instructions.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h4 className="text-lg font-semibold text-emerald-900 mb-4">Preferences</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Measurement Units
                  </label>
                  <select
                    name="preferences.units"
                    value={formData.preferences.units}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  >
                    <option value="metric">Metric (meters, kilometers, °C)</option>
                    <option value="imperial">Imperial (feet, miles, °F)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Notifications
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="notifications.email"
                        checked={formData.preferences.notifications.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-emerald-700">Email notifications</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="notifications.projectUpdates"
                        checked={formData.preferences.notifications.projectUpdates}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-emerald-700">Project updates</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-emerald-200">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-xl transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user.name,
                        preferences: user.preferences
                      });
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium py-2 px-6 rounded-xl transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
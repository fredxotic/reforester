import React, { useState, useEffect } from 'react';
import { teamAPI } from '../../services/teamApi';
import { useAuth } from '../../contexts/AuthContext';

const CommunityHub = () => {
  const [teams, setTeams] = useState([]);
  const [activeTab, setActiveTab] = useState('discover');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      const response = await teamAPI.getMyTeams();
      setTeams(response.teams);
    } catch (error) {
      console.error('Failed to load community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const publicTeams = teams.filter(team => team.settings.public);
  const myTeams = teams;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-emerald-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 border border-emerald-200">
                <div className="h-4 bg-emerald-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-emerald-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-emerald-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-900">Community Hub</h1>
        <p className="text-emerald-700 mt-2">
          Connect with other reforestation enthusiasts, join teams, and collaborate on projects
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-emerald-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'discover', label: 'Discover Teams', icon: '🔍' },
            { id: 'my-teams', label: 'My Teams', icon: '👥' },
            { id: 'experts', label: 'Find Experts', icon: '🎓' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-emerald-500 hover:text-emerald-700 hover:border-emerald-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'discover' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-emerald-900">Discover Public Teams</h2>
              <div className="text-sm text-emerald-600">
                {publicTeams.length} public teams
              </div>
            </div>

            {publicTeams.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-emerald-900 mb-3">
                  No Public Teams Yet
                </h3>
                <p className="text-emerald-700 max-w-md mx-auto text-lg mb-6">
                  Be the first to create a public team and invite others to collaborate.
                </p>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-colors">
                  Create Public Team
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicTeams.map(team => (
                  <div key={team._id} className="card hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {team.avatar ? (
                          <img 
                            src={team.avatar} 
                            alt={team.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            {team.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-emerald-900 text-lg">
                            {team.name}
                          </h3>
                          <p className="text-emerald-600 text-sm">
                            {team.members.filter(m => m.status === 'active').length} members
                          </p>
                        </div>
                      </div>
                    </div>

                    {team.description && (
                      <p className="text-emerald-700 text-sm mb-4 line-clamp-2">
                        {team.description}
                      </p>
                    )}

                    {/* Tags */}
                    {team.tags && team.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {team.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {team.tags.length > 3 && (
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-xs">
                            +{team.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm font-medium">
                        View Team
                      </button>
                      <button className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 py-2 px-4 rounded-lg transition-colors text-sm font-medium">
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-teams' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-emerald-900">My Teams</h2>
              <div className="text-sm text-emerald-600">
                {myTeams.length} teams
              </div>
            </div>

            {myTeams.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-emerald-900 mb-3">
                  No Teams Yet
                </h3>
                <p className="text-emerald-700 max-w-md mx-auto text-lg mb-6">
                  Create your first team to start collaborating on reforestation projects.
                </p>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-colors">
                  Create Your First Team
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTeams.map(team => (
                  <div key={team._id} className="card hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {team.avatar ? (
                          <img 
                            src={team.avatar} 
                            alt={team.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            {team.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-emerald-900 text-lg">
                            {team.name}
                          </h3>
                          <p className="text-emerald-600 text-sm">
                            {team.owner._id === user._id ? 'You own this team' : `Member`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {team.description && (
                      <p className="text-emerald-700 text-sm mb-4 line-clamp-2">
                        {team.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-emerald-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <span>👥</span>
                        <span>{team.members.filter(m => m.status === 'active').length} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>🌳</span>
                        <span>{team.projects?.length || 0} projects</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm font-medium">
                        Open Team
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'experts' && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎓</span>
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-3">
              Expert Directory Coming Soon
            </h3>
            <p className="text-emerald-700 max-w-md mx-auto text-lg mb-6">
              Connect with forestry experts, agronomists, and environmental scientists to get specialized advice for your projects.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm text-emerald-600">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-lg mb-1">🌳</div>
                <div>Forestry Experts</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-lg mb-1">🌱</div>
                <div>Soil Scientists</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-lg mb-1">💧</div>
                <div>Water Management</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Community Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-3xl text-emerald-600 mb-2">👥</div>
          <div className="text-2xl font-bold text-emerald-900">150+</div>
          <div className="text-emerald-600">Community Members</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl text-emerald-600 mb-2">🌳</div>
          <div className="text-2xl font-bold text-emerald-900">45+</div>
          <div className="text-emerald-600">Active Teams</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl text-emerald-600 mb-2">📊</div>
          <div className="text-2xl font-bold text-emerald-900">200+</div>
          <div className="text-emerald-600">Projects</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl text-emerald-600 mb-2">💬</div>
          <div className="text-2xl font-bold text-emerald-900">1.2k+</div>
          <div className="text-emerald-600">Messages</div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;
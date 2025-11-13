import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { teamAPI } from '../../services/teamApi';
import { collaborationAPI } from '../../services/collaborationApi';
import { useAuth } from '../../contexts/AuthContext';
import ChatPanel from '../chat/ChatPanel';
import Loader from '../Loader';

const TeamDetail = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      const response = await teamAPI.getTeam(teamId);
      setTeam(response.team);
      setProjects(response.projects || []);
    } catch (error) {
      console.error('Failed to load team:', error);
    } finally {
      setLoading(false);
    }
  };

  const isTeamAdmin = team?.owner._id === user?._id || 
    team?.members.some(m => m.user._id === user?._id && m.role === 'admin');

  if (loading) {
    return <Loader />;
  }

  if (!team) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-emerald-900">Team Not Found</h1>
          <p className="text-emerald-700 mt-2">The team you're looking for doesn't exist or you don't have access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Team Header */}
      <div className="card mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            {team.avatar ? (
              <img 
                src={team.avatar} 
                alt={team.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                {team.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-emerald-900">{team.name}</h1>
              {team.description && (
                <p className="text-emerald-700 mt-2 max-w-2xl">{team.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-3 text-sm text-emerald-600">
                <div className="flex items-center space-x-1">
                  <span>👥</span>
                  <span>{team.members.filter(m => m.status === 'active').length} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🌳</span>
                  <span>{projects.length} projects</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>👑</span>
                  <span>Owned by {team.owner._id === user?._id ? 'you' : team.owner.name}</span>
                </div>
              </div>
            </div>
          </div>
          
          {isTeamAdmin && (
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
              Manage Team
            </button>
          )}
        </div>

        {/* Tags */}
        {team.tags && team.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {team.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-emerald-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'projects', label: 'Projects' },
            { id: 'members', label: 'Members' },
            { id: 'chat', label: 'Team Chat' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-emerald-500 hover:text-emerald-700 hover:border-emerald-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-emerald-900 mb-4">About This Team</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-emerald-900">Team Focus</h4>
                    <p className="text-emerald-700 mt-1">
                      {team.description || 'No description provided.'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-emerald-900">Settings</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${team.settings.public ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-emerald-700">
                          {team.settings.public ? 'Public Team' : 'Private Team'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${team.settings.allowInvites ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-sm text-emerald-700">
                          {team.settings.allowInvites ? 'Invites Allowed' : 'No Invites'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <h3 className="text-lg font-semibold text-emerald-900 mb-4">Recent Activity</h3>
                <div className="text-center py-8 text-emerald-600">
                  <div className="text-4xl mb-2">📊</div>
                  <p>Team activity feed coming soon</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-emerald-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700">Total Members</span>
                    <span className="font-semibold text-emerald-900">
                      {team.members.filter(m => m.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700">Active Projects</span>
                    <span className="font-semibold text-emerald-900">
                      {projects.filter(p => p.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700">Team Created</span>
                    <span className="font-semibold text-emerald-900">
                      {new Date(team.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Team Actions */}
              <div className="card">
                <h3 className="text-lg font-semibold text-emerald-900 mb-4">Team Actions</h3>
                <div className="space-y-2">
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                    Share Project
                  </button>
                  <button className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                    Invite Members
                  </button>
                  {isTeamAdmin && (
                    <button className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                      Team Settings
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-emerald-900 mb-4">Team Projects</h3>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-emerald-600">
                <div className="text-4xl mb-2">🌳</div>
                <p>No projects shared with this team yet</p>
                <button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                  Share a Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <div key={project._id} className="border border-emerald-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-emerald-900">{project.name}</h4>
                    <p className="text-sm text-emerald-600 mt-1 line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between mt-3 text-xs text-emerald-500">
                      <span>{project.status}</span>
                      <span>{project.analytics?.totalTrees || 0} trees</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-emerald-900 mb-4">Team Members</h3>
            <div className="space-y-3">
              {team.members
                .filter(member => member.status === 'active')
                .map(member => (
                  <div key={member.user._id} className="flex items-center justify-between p-3 border border-emerald-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {member.user.avatar ? (
                        <img 
                          src={member.user.avatar} 
                          alt={member.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-emerald-900">
                          {member.user.name}
                          {team.owner._id === member.user._id && (
                            <span className="ml-2 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">Owner</span>
                          )}
                        </div>
                        <div className="text-sm text-emerald-600">{member.user.email}</div>
                      </div>
                    </div>
                    <div className="text-sm text-emerald-700 capitalize">
                      {member.role}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="card p-0 overflow-hidden">
            <ChatPanel teamId={teamId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetail;
import React, { useState, useEffect } from 'react';
import { collaborationAPI } from '../../services/collaborationApi';
import { teamAPI } from '../../services/teamApi';
import { projectAPI } from '../../services/projectApi';
import { useAuth } from '../../contexts/AuthContext';

const ProjectSharing = ({ projectId, onClose }) => {
  const [teams, setTeams] = useState([]);
  const [project, setProject] = useState(null);
  const [collaborations, setCollaborations] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [permissions, setPermissions] = useState({
    canEdit: false,
    canInvite: false,
    canManage: false
  });
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [teamsResponse, projectResponse, collaborationsResponse] = await Promise.all([
        teamAPI.getMyTeams(),
        projectAPI.getProject(projectId),
        collaborationAPI.getProjectCollaborations(projectId)
      ]);

      setTeams(teamsResponse.teams);
      setProject(projectResponse.project);
      setCollaborations(collaborationsResponse.collaborations || []);
    } catch (error) {
      console.error('Failed to load sharing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareProject = async () => {
    if (!selectedTeam) return;

    setSharing(true);
    try {
      await collaborationAPI.shareProject(projectId, selectedTeam, permissions);
      await loadData(); // Reload collaborations
      setSelectedTeam('');
      setPermissions({ canEdit: false, canInvite: false, canManage: false });
    } catch (error) {
      console.error('Failed to share project:', error);
    } finally {
      setSharing(false);
    }
  };

  const handleRemoveCollaboration = async (collaborationId) => {
    try {
      await collaborationAPI.removeCollaboration(collaborationId);
      await loadData(); // Reload collaborations
    } catch (error) {
      console.error('Failed to remove collaboration:', error);
    }
  };

  const availableTeams = teams.filter(team => 
    !collaborations.some(collab => collab.team._id === team._id)
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
          <div className="animate-pulse">
            <div className="h-6 bg-emerald-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-emerald-200 rounded w-full"></div>
              <div className="h-4 bg-emerald-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-emerald-900">Share Project</h2>
              <p className="text-emerald-600 mt-1">
                Share "{project?.name}" with teams for collaboration
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Share with New Team */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-emerald-900">Share with Team</h3>
              
              {/* Team Selection */}
              <div>
                <label className="block text-sm font-medium text-emerald-900 mb-2">
                  Select Team
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full border border-emerald-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Choose a team...</option>
                  {availableTeams.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.name} ({team.members.filter(m => m.status === 'active').length} members)
                    </option>
                  ))}
                </select>
                {availableTeams.length === 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    No available teams to share with. Create a new team first.
                  </p>
                )}
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h4 className="font-medium text-emerald-900">Permissions</h4>
                
                <div className="flex items-center justify-between p-3 border border-emerald-100 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-emerald-900">
                      Can Edit Project
                    </label>
                    <p className="text-xs text-emerald-500">
                      Team members can modify project details
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canEdit}
                      onChange={(e) => setPermissions(prev => ({ ...prev, canEdit: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-emerald-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 border border-emerald-100 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-emerald-900">
                      Can Invite Others
                    </label>
                    <p className="text-xs text-emerald-500">
                      Team members can invite more people
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canInvite}
                      onChange={(e) => setPermissions(prev => ({ ...prev, canInvite: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-emerald-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 border border-emerald-100 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-emerald-900">
                      Can Manage Project
                    </label>
                    <p className="text-xs text-emerald-500">
                      Team members can manage project settings
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManage}
                      onChange={(e) => setPermissions(prev => ({ ...prev, canManage: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-emerald-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              <button
                onClick={handleShareProject}
                disabled={!selectedTeam || sharing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                {sharing ? 'Sharing...' : 'Share Project'}
              </button>
            </div>

            {/* Current Collaborations */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-emerald-900">Current Sharing</h3>
              
              {collaborations.length === 0 ? (
                <div className="text-center py-8 text-emerald-600 border-2 border-dashed border-emerald-200 rounded-xl">
                  <div className="text-4xl mb-2">🔗</div>
                  <p>Not shared with any teams yet</p>
                  <p className="text-sm mt-1">Share with a team to start collaborating</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {collaborations.map(collaboration => (
                    <div key={collaboration._id} className="border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {collaboration.team.avatar ? (
                            <img 
                              src={collaboration.team.avatar} 
                              alt={collaboration.team.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                              {collaboration.team.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-emerald-900">
                              {collaboration.team.name}
                            </h4>
                            <p className="text-sm text-emerald-600">
                              Shared by {collaboration.createdBy.name}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveCollaboration(collaboration._id)}
                          className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                          title="Remove sharing"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Permissions Badges */}
                      <div className="flex flex-wrap gap-2">
                        {collaboration.permissions.canEdit && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            Can Edit
                          </span>
                        )}
                        {collaboration.permissions.canInvite && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Can Invite
                          </span>
                        )}
                        {collaboration.permissions.canManage && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                            Can Manage
                          </span>
                        )}
                        {!collaboration.permissions.canEdit && !collaboration.permissions.canInvite && !collaboration.permissions.canManage && (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            View Only
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Collaboration Benefits */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h4 className="font-semibold text-emerald-900 mb-2">Collaboration Benefits</h4>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• Real-time chat with team members</li>
                  <li>• Shared project progress tracking</li>
                  <li>• Collaborative species selection</li>
                  <li>• Team-based analytics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSharing;
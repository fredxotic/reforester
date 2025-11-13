import React, { useState, useEffect } from 'react';
import { teamAPI } from '../../services/teamApi';
import { useAuth } from '../../contexts/AuthContext';
import TeamCard from './TeamCard';
import CreateTeamModal from './CreateTeamModal';
import Loader from '../Loader';

const TeamDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await teamAPI.getMyTeams();
      setTeams(response.teams);
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamCreated = (newTeam) => {
    setTeams(prev => [newTeam, ...prev]);
    setShowCreateModal(false);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Teams</h1>
            <p className="text-emerald-700 mt-2">
              Collaborate with others on reforestation projects
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Create Team</span>
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            Create Your First Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <TeamCard 
              key={team._id} 
              team={team} 
              onUpdate={loadTeams}
            />
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onTeamCreated={handleTeamCreated}
        />
      )}
    </div>
  );
};

export default TeamDashboard;
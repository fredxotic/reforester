import React from 'react';
import { Link } from 'react-router-dom';

const TeamCard = ({ team, onUpdate }) => {
  const memberCount = team.members.filter(m => m.status === 'active').length;
  const projectCount = team.projects?.length || 0;

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
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
              {team.owner._id === team.owner?._id ? 'You own this team' : `Owned by ${team.owner?.name}`}
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
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span>👥</span>
            <span>{memberCount} members</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🌳</span>
            <span>{projectCount} projects</span>
          </div>
        </div>
      </div>

      {/* Members Preview */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex -space-x-2">
          {team.members.slice(0, 4).map((member, index) => (
            <div key={member.user._id} className="relative">
              {member.user.avatar ? (
                <img 
                  src={member.user.avatar} 
                  alt={member.user.name}
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-white text-xs font-bold"
                  title={member.user.name}
                >
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              {member.role === 'admin' && (
                <div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border border-white"
                  title="Admin"
                />
              )}
            </div>
          ))}
          {memberCount > 4 && (
            <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-emerald-700 text-xs font-medium">
              +{memberCount - 4}
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-2">
        <Link
          to={`/teams/${team._id}`}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm font-medium"
        >
          View Team
        </Link>
      </div>
    </div>
  );
};

export default TeamCard;
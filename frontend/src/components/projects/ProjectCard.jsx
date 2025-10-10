import React, { useState } from 'react';
import { projectAPI } from '../../services/projectApi';
import ProjectModal from './ProjectModal';

const ProjectCard = ({ project, onUpdate, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800 border-blue-200',
      active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      'on-hold': 'bg-amber-100 text-amber-800 border-amber-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      planning: '📋',
      active: '🌱',
      completed: '✅',
      'on-hold': '⏸️',
      cancelled: '❌'
    };
    return icons[status] || '📁';
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const result = await projectAPI.updateProject(project._id, { status: newStatus });
      onUpdate(result.project);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await projectAPI.deleteProject(project._id);
      onDelete(project._id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <>
      <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 hover:shadow-lg transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-emerald-900 truncate mb-1">
              {project.name}
            </h3>
            <p className="text-emerald-600 text-sm line-clamp-2">
              {project.description || 'No description provided'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 ml-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
              <span className="mr-1">{getStatusIcon(project.status)}</span>
              {project.status.replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-emerald-700 mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>
            {project.location.coordinates.lat.toFixed(4)}, {project.location.coordinates.lon.toFixed(4)}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-lg font-bold text-emerald-900">
              {formatNumber(project.analytics?.totalTrees || 0)}
            </div>
            <div className="text-xs text-emerald-600">Trees</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-900">
              {project.analytics?.areaCovered ? project.analytics.areaCovered.toFixed(1) : '0'} ha
            </div>
            <div className="text-xs text-blue-600">Area</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-900">
              {project.analytics?.estimatedCarbonSequestration ? project.analytics.estimatedCarbonSequestration.toFixed(0) : '0'} t
            </div>
            <div className="text-xs text-green-600">CO₂/yr</div>
          </div>
          
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="text-lg font-bold text-amber-900">
              {project.analytics?.progress || 0}%
            </div>
            <div className="text-xs text-amber-600">Progress</div>
          </div>
        </div>

        {/* Species Preview */}
        {project.species && project.species.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-emerald-900 mb-2">Species</h4>
            <div className="flex flex-wrap gap-1">
              {project.species.slice(0, 3).map((species, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full"
                >
                  {species.name}
                  {species.quantity > 1 && (
                    <span className="ml-1 text-emerald-600">({species.quantity})</span>
                  )}
                </span>
              ))}
              {project.species.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{project.species.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-emerald-700 mb-1">
            <span>Started</span>
            <span>
              {new Date(project.timeline.startDate).toLocaleDateString()}
            </span>
          </div>
          {project.timeline.endDate && (
            <div className="flex justify-between items-center text-sm text-emerald-700">
              <span>Target End</span>
              <span>
                {new Date(project.timeline.endDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-emerald-700 mb-1">
            <span>Progress</span>
            <span>{project.analytics?.progress || 0}%</span>
          </div>
          <div className="w-full bg-emerald-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${project.analytics?.progress || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-emerald-200">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-emerald-600">
              {project.teamMembers?.length || 1} member{project.teamMembers?.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Status Quick Actions */}
        <div className="mt-3 pt-3 border-t border-emerald-200">
          <div className="flex flex-wrap gap-1">
            {project.status !== 'active' && (
              <button
                onClick={() => handleStatusChange('active')}
                disabled={loading}
                className="flex-1 text-center px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs rounded transition-colors disabled:opacity-50"
              >
                Activate
              </button>
            )}
            {project.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={loading}
                className="flex-1 text-center px-2 py-1 bg-green-100 hover:bg-green-200 text-green-800 text-xs rounded transition-colors disabled:opacity-50"
              >
                Complete
              </button>
            )}
            {project.status !== 'on-hold' && (
              <button
                onClick={() => handleStatusChange('on-hold')}
                disabled={loading}
                className="flex-1 text-center px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs rounded transition-colors disabled:opacity-50"
              >
                Pause
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          project={project}
          onProjectUpdated={onUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-red-900 mb-2">
              Delete Project
            </h3>
            <p className="text-red-700 mb-6">
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                {loading ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectCard;
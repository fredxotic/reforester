import React, { useState, useEffect, useMemo } from 'react';
import { projectAPI } from '../../services/projectApi';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import Loader from '../Loader';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Projects' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' }
];

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // Compute status counts from current loaded projects
  const statusCounts = useMemo(() => {
    const counts = { all: pagination.total };
    for (const opt of STATUS_OPTIONS) {
      if (opt.value !== 'all') {
        counts[opt.value] = projects.filter(p => p.status === opt.value).length;
      }
    }
    return counts;
  }, [projects, pagination.total]);

  const loadProjects = async (page = 1, status = selectedStatus) => {
    try {
      setLoading(true);
      const result = await projectAPI.getProjects({
        status: status === 'all' ? undefined : status,
        page,
        limit: pagination.limit
      });
      
      setProjects(result.projects);
      setPagination(result.pagination);
      
    } catch (err) {
      setError('Failed to load projects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    loadProjects(1, status);
  };

  const handlePageChange = (newPage) => {
    loadProjects(newPage);
  };

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
    setShowCreateModal(false);
    loadProjects(1); // Reload to get updated counts
  };

  const handleProjectUpdated = (updatedProject) => {
    setProjects(prev => 
      prev.map(project => 
        project._id === updatedProject._id ? updatedProject : project
      )
    );
  };

  const handleProjectDeleted = (projectId) => {
    setProjects(prev => prev.filter(project => project._id !== projectId));
    loadProjects(1); // Reload to get updated counts
  };

  if (loading && projects.length === 0) {
    return <Loader message="Loading Projects" description="Fetching your reforestation projects..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-emerald-900 mb-2">
                My Projects
              </h1>
              <p className="text-emerald-700 text-lg">
                Manage your reforestation projects and track progress
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 text-center">
            <div className="text-3xl text-emerald-600 mb-2">📊</div>
            <div className="text-2xl font-bold text-emerald-900">{pagination.total}</div>
            <div className="text-emerald-600">Total Projects</div>
          </div>
          
          <div className="card bg-white/80 backdrop-blur-sm border-blue-200 text-center">
            <div className="text-3xl text-blue-600 mb-2">🌱</div>
            <div className="text-2xl font-bold text-blue-900">
              {projects.reduce((total, project) => total + (project.analytics?.totalTrees || 0), 0).toLocaleString()}
            </div>
            <div className="text-blue-600">Trees Planted</div>
          </div>
          
          <div className="card bg-white/80 backdrop-blur-sm border-green-200 text-center">
            <div className="text-3xl text-green-600 mb-2">🌍</div>
            <div className="text-2xl font-bold text-green-900">
              {projects.reduce((total, project) => total + (project.analytics?.areaCovered || 0), 0).toFixed(1)} ha
            </div>
            <div className="text-green-600">Area Covered</div>
          </div>
          
          <div className="card bg-white/80 backdrop-blur-sm border-amber-200 text-center">
            <div className="text-3xl text-amber-600 mb-2">💨</div>
            <div className="text-2xl font-bold text-amber-900">
              {projects.reduce((total, project) => total + (project.analytics?.estimatedCarbonSequestration || 0), 0).toFixed(0)} t
            </div>
            <div className="text-amber-600">CO₂ Sequestration</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  selectedStatus === option.value
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {option.label}
                <span className="ml-2 text-sm opacity-75">
                  ({statusCounts[option.value] ?? 0})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2 text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 text-center py-16">
            <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🌳</span>
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-4">
              No Projects Yet
            </h3>
            <p className="text-emerald-700 max-w-md mx-auto text-lg mb-6">
              Start your reforestation journey by creating your first project. Track progress, manage species, and monitor environmental impact.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-xl transition-colors duration-200"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {projects.map(project => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onUpdate={handleProjectUpdated}
                  onDelete={handleProjectDeleted}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border border-emerald-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
                >
                  Previous
                </button>
                
                <span className="text-emerald-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 bg-white border border-emerald-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <ProjectModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onProjectCreated={handleProjectCreated}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDashboard;
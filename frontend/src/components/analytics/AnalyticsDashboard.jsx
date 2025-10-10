import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/analyticsApi';
import { projectAPI } from '../../services/projectApi';
import AnalyticsOverview from './AnalyticsOverview';
import ProjectAnalytics from './ProjectAnalytics';
import ComparativeAnalytics from './ComparativeAnalytics';
import Loader from '../Loader';

const AnalyticsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewData, projectsData] = await Promise.all([
        analyticsAPI.getOverview(),
        projectAPI.getProjects({ limit: 50 })
      ]);
      
      setOverview(overviewData);
      setProjects(projectsData.projects);
      
      if (projectsData.projects.length > 0) {
        setSelectedProject(projectsData.projects[0]._id);
      }
    } catch (err) {
      setError('Failed to load analytics data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-3xl font-bold text-red-900 mb-4">Error Loading Analytics</h2>
          <p className="text-red-700 text-lg mb-6">{error}</p>
          <button
            onClick={loadData}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-emerald-900 mb-2">
                Advanced Analytics
              </h1>
              <p className="text-emerald-700 text-lg">
                Growth projections, environmental impact, and performance insights
              </p>
            </div>
            
            {/* Project Selector for detailed analytics */}
            {activeTab !== 'overview' && projects.length > 0 && (
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-emerald-700">
                  Analyze Project:
                </label>
                <select
                  value={selectedProject || ''}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-emerald-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'project', name: 'Project Analytics', icon: '🌱' },
                { id: 'comparative', name: 'Comparative', icon: '📈' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-emerald-500 hover:text-emerald-700 hover:border-emerald-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && overview && (
            <AnalyticsOverview 
              overview={overview} 
              projects={projects} 
            />
          )}
          
          {activeTab === 'project' && selectedProject && (
            <ProjectAnalytics 
              projectId={selectedProject} 
              projects={projects} 
            />
          )}
          
          {activeTab === 'comparative' && (
            <ComparativeAnalytics 
              projects={projects} 
            />
          )}
        </div>

        {/* No Projects Message */}
        {projects.length === 0 && (
          <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 text-center py-16">
            <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🌳</span>
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-4">
              No Projects Yet
            </h3>
            <p className="text-emerald-700 max-w-md mx-auto text-lg mb-6">
              Create your first reforestation project to unlock advanced analytics, growth projections, and environmental impact tracking.
            </p>
            <div className="space-y-4">
              <p className="text-emerald-600">
                With analytics you can track:
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-emerald-700">
                <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-lg">
                  <span>📈</span>
                  <span>Growth Projections</span>
                </div>
                <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-lg">
                  <span>💨</span>
                  <span>Carbon Sequestration</span>
                </div>
                <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-lg">
                  <span>🌍</span>
                  <span>Biodiversity Impact</span>
                </div>
                <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-lg">
                  <span>💰</span>
                  <span>Financial Analytics</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
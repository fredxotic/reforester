import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/analyticsApi';
import GrowthChart from './charts/GrowthChart';
import CarbonTimelineChart from './charts/CarbonTimelineChart';
import BiodiversityGauge from './charts/BiodiversityGauge';
import FinancialMetrics from './FinancialMetrics';
import Loader from '../Loader';

const ProjectAnalytics = ({ projectId, projects }) => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [activeTab, setActiveTab] = useState('growth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const project = projects.find(p => p._id === projectId);

  useEffect(() => {
    if (projectId) {
      loadAnalyticsData();
    }
  }, [projectId]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [growth, carbon, biodiversity, financial] = await Promise.all([
        analyticsAPI.getGrowthProjections(projectId),
        analyticsAPI.getCarbonTimeline(projectId),
        analyticsAPI.getBiodiversityImpact(projectId),
        analyticsAPI.getFinancialAnalytics(projectId)
      ]);

      setAnalyticsData({
        growth: growth.projections,
        carbon: carbon.carbonTimeline,
        biodiversity: biodiversity.biodiversityImpact,
        financial: financial.financialAnalytics
      });
    } catch (err) {
      setError('Failed to load project analytics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200 p-6">
        <div className="flex items-center space-x-3 text-red-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold">Error Loading Analytics</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card bg-amber-50 border-amber-200 p-6">
        <div className="text-amber-700 text-center">
          <p>Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-emerald-900">{project.name}</h2>
            <p className="text-emerald-700">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                project.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                project.status === 'planning' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {project.status.replace('-', ' ')}
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                {project.analytics?.totalTrees || 0} trees
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                {project.analytics?.areaCovered?.toFixed(1) || 0} ha
              </span>
            </div>
          </div>
          <div className="mt-4 lg:mt-0 text-right">
            <p className="text-lg font-bold text-emerald-900">
              {project.analytics?.estimatedCarbonSequestration?.toFixed(0) || 0} t CO₂/yr
            </p>
            <p className="text-sm text-emerald-600">Carbon Sequestration</p>
          </div>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="border-b border-emerald-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'growth', name: 'Growth Projections', icon: '📈' },
            { id: 'carbon', name: 'Carbon Timeline', icon: '💨' },
            { id: 'biodiversity', name: 'Biodiversity', icon: '🌿' },
            { id: 'financial', name: 'Financial', icon: '💰' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'growth' && analyticsData.growth && (
          <GrowthChart data={analyticsData.growth} project={project} />
        )}

        {activeTab === 'carbon' && analyticsData.carbon && (
          <CarbonTimelineChart data={analyticsData.carbon} project={project} />
        )}

        {activeTab === 'biodiversity' && analyticsData.biodiversity && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <BiodiversityGauge data={analyticsData.biodiversity} />
            </div>
            <div className="lg:col-span-2">
              <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
                <h3 className="text-lg font-semibold text-emerald-900 mb-4">Biodiversity Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-900">
                      {analyticsData.biodiversity.metrics.speciesDiversity}
                    </div>
                    <div className="text-sm text-emerald-600">Species</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">
                      {analyticsData.biodiversity.metrics.treeDensity}
                    </div>
                    <div className="text-sm text-blue-600">Trees/Hectare</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">
                      {analyticsData.biodiversity.metrics.areaHectares}
                    </div>
                    <div className="text-sm text-green-600">Hectares</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-900">
                      {(analyticsData.biodiversity.metrics.nativeSpeciesRatio * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-amber-600">Native Species</div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {analyticsData.biodiversity.recommendations.length > 0 && (
                <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 mt-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4">Improvement Recommendations</h3>
                  <div className="space-y-3">
                    {analyticsData.biodiversity.recommendations.map((rec, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        rec.priority === 'high' ? 'bg-red-50 border-red-500' :
                        rec.priority === 'medium' ? 'bg-amber-50 border-amber-500' :
                        'bg-blue-50 border-blue-500'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{rec.action}</h4>
                            <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
                            <p className="text-xs text-gray-600 mt-2">{rec.impact}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.priority} priority
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'financial' && analyticsData.financial && (
          <FinancialMetrics data={analyticsData.financial} project={project} />
        )}
      </div>
    </div>
  );
};

export default ProjectAnalytics;
import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/analyticsApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Loader from '../Loader';

const ComparativeAnalytics = ({ projects }) => {
  const [comparativeData, setComparativeData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('carbon_sequestration');
  const [period, setPeriod] = useState('year');
  const [loading, setLoading] = useState(false);

  const metricOptions = [
    { value: 'carbon_sequestration', label: 'Carbon Sequestration', unit: 't/year', color: '#ef4444' },
    { value: 'cost_efficiency', label: 'Cost Efficiency', unit: 'trees/$', color: '#10b981' },
    { value: 'biodiversity', label: 'Biodiversity', unit: 'species', color: '#f59e0b' },
    { value: 'area', label: 'Area Covered', unit: 'hectares', color: '#3b82f6' },
    { value: 'trees', label: 'Total Trees', unit: 'trees', color: '#8b5cf6' }
  ];

  useEffect(() => {
    if (projects.length > 0) {
      loadComparativeData();
    }
  }, [selectedMetric, period, projects]);

  const loadComparativeData = async () => {
    try {
      setLoading(true);
      const result = await analyticsAPI.getComparativeAnalytics({
        metric: selectedMetric,
        period: period
      });
      setComparativeData(result.comparativeData);
    } catch (error) {
      console.error('Failed to load comparative data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentMetric = metricOptions.find(m => m.value === selectedMetric);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-emerald-200 rounded-lg shadow-lg">
          <p className="font-semibold text-emerald-900">{data.projectName}</p>
          <p className="text-sm text-emerald-700">
            {currentMetric.label}: {data.value} {currentMetric.unit}
          </p>
          <p className="text-xs text-emerald-600">
            Status: {data.status} • {data.speciesCount} species
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <Loader />;
  }

  if (projects.length === 0) {
    return (
      <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 text-center py-16">
        <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">📊</span>
        </div>
        <h3 className="text-2xl font-bold text-emerald-900 mb-4">
          No Projects for Comparison
        </h3>
        <p className="text-emerald-700 max-w-md mx-auto text-lg mb-6">
          Create multiple projects to compare their performance and environmental impact.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-emerald-900">Project Comparison</h3>
            <p className="text-emerald-700">Compare performance across your reforestation projects</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                Metric
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                {metricOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-2">
                Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value="year">Annual</option>
                <option value="total">Total</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-900 mb-4">
          {currentMetric.label} Comparison
        </h3>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparativeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="projectName" 
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ 
                  value: currentMetric.unit, 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -10 
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                name={currentMetric.label}
                fill={currentMetric.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4">Project Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: projects.filter(p => p.status === 'active').length, color: '#10b981' },
                    { name: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: '#3b82f6' },
                    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: '#059669' },
                    { name: 'On Hold', value: projects.filter(p => p.status === 'on-hold').length, color: '#f59e0b' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {[
                    { name: 'Active', value: projects.filter(p => p.status === 'active').length, color: '#10b981' },
                    { name: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: '#3b82f6' },
                    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: '#059669' },
                    { name: 'On Hold', value: projects.filter(p => p.status === 'on-hold').length, color: '#f59e0b' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4">Performance Summary</h3>
          <div className="space-y-4">
            {comparativeData.slice(0, 3).map((project, index) => (
              <div key={project.projectId} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-amber-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-amber-700' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <div className="font-medium text-emerald-900 text-sm">
                      {project.projectName}
                    </div>
                    <div className="text-xs text-emerald-600 capitalize">
                      {project.status} • {project.speciesCount} species
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-900">
                    {project.value} {currentMetric.unit}
                  </div>
                  <div className="text-xs text-emerald-600">
                    #{index + 1} in {currentMetric.label.toLowerCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Key Insights */}
          {comparativeData.length > 1 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Key Insights</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Top project: <strong>{comparativeData[0]?.projectName}</strong></li>
                <li>• Performance range: {comparativeData[comparativeData.length - 1]?.value} to {comparativeData[0]?.value} {currentMetric.unit}</li>
                <li>• Average: {(comparativeData.reduce((sum, p) => sum + p.value, 0) / comparativeData.length).toFixed(1)} {currentMetric.unit}</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* All Projects Table */}
      <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-900 mb-4">Detailed Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-200">
                <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Project</th>
                <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-emerald-900 font-semibold">Species</th>
                <th className="text-right py-3 px-4 text-emerald-900 font-semibold">{currentMetric.label}</th>
                <th className="text-right py-3 px-4 text-emerald-900 font-semibold">Rank</th>
              </tr>
            </thead>
            <tbody>
              {comparativeData.map((project, index) => (
                <tr key={project.projectId} className="border-b border-emerald-100 last:border-b-0">
                  <td className="py-3 px-4">
                    <div className="font-medium text-emerald-900">{project.projectName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      project.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-emerald-700">{project.speciesCount}</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-900">
                    {project.value} {currentMetric.unit}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                      index === 0 ? 'bg-amber-100 text-amber-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-amber-200 text-amber-900' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparativeAnalytics;
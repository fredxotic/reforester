import React from 'react';

const AnalyticsOverview = ({ overview, projects }) => {
  const { 
    overview: stats, 
    statusDistribution, 
    topSpecies, 
    recentActivity 
  } = overview;

  // Calculate environmental impact
  const environmentalImpact = {
    carbonEquivalent: (stats.totalCarbon * 1000) / 22, // trees equivalent
    carsOffRoad: stats.totalCarbon / 4.6, // average car emissions per year
    homesPowered: stats.totalCarbon / 12, // average home electricity emissions
    oxygenProduction: stats.totalTrees * 260 / 1000 // tons of oxygen per year
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 text-center">
          <div className="text-2xl text-emerald-600 mb-2">🌳</div>
          <div className="text-2xl font-bold text-emerald-900">{stats.totalTrees.toLocaleString()}</div>
          <div className="text-emerald-600">Total Trees</div>
        </div>
        
        <div className="card bg-white/80 backdrop-blur-sm border-blue-200 text-center">
          <div className="text-2xl text-blue-600 mb-2">🌍</div>
          <div className="text-2xl font-bold text-blue-900">{stats.totalArea.toFixed(1)} ha</div>
          <div className="text-blue-600">Area Covered</div>
        </div>
        
        <div className="card bg-white/80 backdrop-blur-sm border-green-200 text-center">
          <div className="text-2xl text-green-600 mb-2">💨</div>
          <div className="text-2xl font-bold text-green-900">{stats.totalCarbon.toFixed(0)} t/yr</div>
          <div className="text-green-600">CO₂ Sequestration</div>
        </div>
        
        <div className="card bg-white/80 backdrop-blur-sm border-amber-200 text-center">
          <div className="text-2xl text-amber-600 mb-2">📈</div>
          <div className="text-2xl font-bold text-amber-900">{stats.averageSurvivalRate.toFixed(1)}%</div>
          <div className="text-amber-600">Avg Survival Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Status Distribution */}
        <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4">Project Status</h3>
          <div className="space-y-3">
            {Object.entries(statusDistribution).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'active' ? 'bg-emerald-500' :
                    status === 'planning' ? 'bg-blue-500' :
                    status === 'completed' ? 'bg-green-500' : 'bg-amber-500'
                  }`}></div>
                  <span className="capitalize text-emerald-700">{status.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-emerald-900">{count}</span>
                  <span className="text-emerald-600 text-sm">
                    ({Math.round((count / stats.totalProjects) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Species */}
        <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4">Top Species</h3>
          <div className="space-y-3">
            {topSpecies.slice(0, 5).map((species, index) => (
              <div key={species.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-emerald-600">{index + 1}.</span>
                  <span className="text-emerald-700">{species.name}</span>
                </div>
                <span className="font-semibold text-emerald-900">
                  {species.count.toLocaleString()} trees
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-900 mb-6">Environmental Impact</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <div className="text-2xl font-bold text-emerald-900">
              {environmentalImpact.carbonEquivalent.toLocaleString()}
            </div>
            <div className="text-sm text-emerald-600">Tree Equivalents</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-900">
              {environmentalImpact.carsOffRoad.toFixed(0)}
            </div>
            <div className="text-sm text-blue-600">Cars Off Road</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-900">
              {environmentalImpact.homesPowered.toFixed(0)}
            </div>
            <div className="text-sm text-green-600">Homes Powered</div>
          </div>
          
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <div className="text-2xl font-bold text-amber-900">
              {environmentalImpact.oxygenProduction.toFixed(0)} t
            </div>
            <div className="text-sm text-amber-600">Oxygen Produced</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-emerald-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-emerald-700">{activity.name}</span>
                <span className="text-emerald-500 text-sm">was {activity.action}</span>
              </div>
              <span className="text-emerald-600 text-sm">
                {new Date(activity.timestamp).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-white/80 backdrop-blur-sm border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3">🌱 Growth Potential</h4>
          <p className="text-blue-700 text-sm">
            Your projects have the potential to sequester{' '}
            <strong>{(stats.totalCarbon * 20).toFixed(0)} tons of CO₂</strong>{' '}
            over the next 20 years.
          </p>
        </div>
        
        <div className="card bg-white/80 backdrop-blur-sm border-green-200">
          <h4 className="font-semibold text-green-900 mb-3">💰 Carbon Credit Value</h4>
          <p className="text-green-700 text-sm">
            Estimated carbon credit value:{' '}
            <strong>${(stats.totalCarbon * 50).toLocaleString()}</strong>{' '}
            per year at current market rates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
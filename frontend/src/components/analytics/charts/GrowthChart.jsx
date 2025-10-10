import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';

const GrowthChart = ({ data, project }) => {
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-emerald-200 rounded-lg shadow-lg">
          <p className="font-semibold text-emerald-900">Year {label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} {entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-900 mb-4">20-Year Growth Projections</h3>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-lg font-bold text-emerald-900">
              {data[data.length - 1]?.survivingTrees?.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-600">Mature Trees</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-900">
              {data[data.length - 1]?.carbonSequestration?.toFixed(0)} t
            </div>
            <div className="text-xs text-blue-600">Annual CO₂</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-900">
              {data[data.length - 1]?.avgHeight}m
            </div>
            <div className="text-xs text-green-600">Avg Height</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="text-lg font-bold text-amber-900">
              {data[data.length - 1]?.biodiversityScore}
            </div>
            <div className="text-xs text-amber-600">Biodiversity Score</div>
          </div>
        </div>

        {/* Combined Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="year" 
                label={{ value: 'Years', position: 'insideBottom', offset: -10 }}
                tick={{ fill: '#374151' }}
              />
              <YAxis 
                yAxisId="left"
                label={{ value: 'Trees & Carbon (t)', angle: -90, position: 'insideLeft' }}
                tick={{ fill: '#374151' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                label={{ value: 'Height (m) & Score', angle: -90, position: 'insideRight' }}
                tick={{ fill: '#374151' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Area for tree count */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="survivingTrees"
                name="Surviving Trees"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
                unit=" trees"
              />
              
              {/* Line for carbon sequestration */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="carbonSequestration"
                name="Carbon Sequestration"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
                unit=" t/year"
              />
              
              {/* Line for tree height */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgHeight"
                name="Average Height"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
                unit=" m"
              />
              
              {/* Line for biodiversity score */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="biodiversityScore"
                name="Biodiversity Score"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b' }}
                unit=" pts"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-white/80 backdrop-blur-sm border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3">🌳 Tree Growth Insights</h4>
          <ul className="text-blue-700 text-sm space-y-2">
            <li>• Trees reach maturity around year 10</li>
            <li>• Peak carbon sequestration occurs at full maturity</li>
            <li>• Biodiversity improves steadily over time</li>
            <li>• Survival rate: {project.analytics?.survivalRate?.toFixed(1) || 85}%</li>
          </ul>
        </div>
        
        <div className="card bg-white/80 backdrop-blur-sm border-green-200">
          <h4 className="font-semibold text-green-900 mb-3">💨 Environmental Impact</h4>
          <ul className="text-green-700 text-sm space-y-2">
            <li>• 20-year carbon total: {(data.reduce((sum, year) => sum + year.carbonSequestration, 0)).toFixed(0)} tons</li>
            <li>• Equivalent to {((data.reduce((sum, year) => sum + year.carbonSequestration, 0)) / 4.6).toFixed(0)} cars off the road</li>
            <li>• Produces {(data[data.length - 1]?.survivingTrees * 260 / 1000).toFixed(0)} tons of oxygen annually</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GrowthChart;
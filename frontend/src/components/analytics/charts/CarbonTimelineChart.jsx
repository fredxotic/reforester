import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import {
  CARBON_CREDIT_RATE_USD,
  CO2_PER_CAR_TONS_YEAR,
  CO2_PER_HOME_TONS_YEAR
} from '../../../constants/environment';

const CarbonTimelineChart = ({ data, project }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-emerald-200 rounded-lg shadow-lg">
          <p className="font-semibold text-emerald-900">{label}</p>
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
        <h3 className="text-lg font-semibold text-emerald-900 mb-4">Carbon Sequestration Timeline</h3>
        
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-lg font-bold text-emerald-900">
              {data[data.length - 1]?.cumulativeCarbon?.toFixed(0)} t
            </div>
            <div className="text-xs text-emerald-600">Total CO₂ Sequestered</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-900">
              {data[data.length - 1]?.annualCarbon?.toFixed(1)} t/yr
            </div>
            <div className="text-xs text-blue-600">Current Annual Rate</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-900">
              ${(data[data.length - 1]?.cumulativeCarbon * CARBON_CREDIT_RATE_USD).toLocaleString()}
            </div>
            <div className="text-xs text-green-600">Carbon Credit Value</div>
          </div>
        </div>

        {/* Carbon Timeline Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="period" 
                tick={{ fill: '#374151', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                label={{ value: 'Carbon (tons)', angle: -90, position: 'insideLeft' }}
                tick={{ fill: '#374151' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Bar for annual carbon */}
              <Bar
                dataKey="annualCarbon"
                name="Annual Carbon Sequestration"
                fill="#10b981"
                fillOpacity={0.8}
                unit=" t"
              />
              
              {/* Line for cumulative carbon */}
              <Line
                type="monotone"
                dataKey="cumulativeCarbon"
                name="Cumulative Carbon"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                unit=" t"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Carbon Impact Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
          <h4 className="font-semibold text-emerald-900 mb-4">Carbon Impact Equivalents</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Cars removed from road</span>
              <span className="font-semibold text-gray-900">
                {(data[data.length - 1]?.cumulativeCarbon / CO2_PER_CAR_TONS_YEAR).toFixed(0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Homes powered for a year</span>
              <span className="font-semibold text-gray-900">
                {(data[data.length - 1]?.cumulativeCarbon / CO2_PER_HOME_TONS_YEAR).toFixed(0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Smartphones charged</span>
              <span className="font-semibold text-gray-900">
                {((data[data.length - 1]?.cumulativeCarbon * 1000) / 0.008).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="card bg-white/80 backdrop-blur-sm border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-4">Carbon Credit Economics</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-700">Current Market Rate:</span>
              <span className="font-semibold text-blue-900">${CARBON_CREDIT_RATE_USD}/ton</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Annual Credit Value:</span>
              <span className="font-semibold text-blue-900">
                ${(data[data.length - 1]?.annualCarbon * CARBON_CREDIT_RATE_USD).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Total Project Value:</span>
              <span className="font-semibold text-blue-900">
                ${(data[data.length - 1]?.cumulativeCarbon * CARBON_CREDIT_RATE_USD).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-2">
              <span className="text-blue-700">Payback Period:</span>
              <span className="font-semibold text-blue-900">
                {project.budget?.estimatedCost ? 
                  (project.budget.estimatedCost / (data[data.length - 1]?.annualCarbon * CARBON_CREDIT_RATE_USD)).toFixed(1) + ' years' : 
                  'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonTimelineChart;
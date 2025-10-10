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
  PieChart,
  Pie,
  Cell
} from 'recharts';

const FinancialMetrics = ({ data, project }) => {
  const { financials, efficiency, roi, recommendations } = data;

  const costData = [
    { name: 'Estimated', value: financials.estimatedCost },
    { name: 'Actual', value: financials.actualCost || 0 }
  ].filter(item => item.value > 0);

  const COLORS = ['#10b981', '#3b82f6'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-emerald-200 rounded-lg shadow-lg">
          <p className="font-semibold text-emerald-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4">Cost Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-emerald-700">Estimated Cost:</span>
              <span className="font-semibold text-emerald-900">
                ${financials.estimatedCost.toLocaleString()}
              </span>
            </div>
            {financials.actualCost > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700">Actual Cost:</span>
                  <span className="font-semibold text-emerald-900">
                    ${financials.actualCost.toLocaleString()}
                  </span>
                </div>
                <div className={`flex justify-between items-center p-2 rounded ${
                  financials.costVariance >= 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                }`}>
                  <span>Variance:</span>
                  <span className="font-semibold">
                    {financials.costVariance >= 0 ? '+' : ''}${financials.costVariance.toLocaleString()} 
                    ({financials.costVariancePercentage}%)
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card bg-white/80 backdrop-blur-sm border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Efficiency Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Cost per Tree:</span>
              <span className="font-semibold text-blue-900">
                ${efficiency.costPerTree.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Cost per Ton CO₂:</span>
              <span className="font-semibold text-blue-900">
                ${efficiency.costPerTonCarbon.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Carbon Credit Value:</span>
              <span className="font-semibold text-blue-900">
                ${efficiency.carbonCreditValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="card bg-white/80 backdrop-blur-sm border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Return on Investment</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-green-700">ROI:</span>
              <span className={`font-semibold ${
                roi.percentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {roi.percentage >= 0 ? '+' : ''}{roi.percentage}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700">Net Value:</span>
              <span className={`font-semibold ${
                roi.netValue >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${roi.netValue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700">Payback Period:</span>
              <span className="font-semibold text-green-900">
                {roi.paybackPeriod > 0 ? `${roi.paybackPeriod} years` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Comparison Chart */}
        <div className="card bg-white/80 backdrop-blur-sm border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-900 mb-4">Cost Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: '#374151' }} />
                <YAxis tick={{ fill: '#374151' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Cost">
                  {costData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROI Breakdown */}
        <div className="card bg-white/80 backdrop-blur-sm border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Investment Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Carbon Credits', value: efficiency.carbonCreditValue },
                    { name: 'Initial Cost', value: -financials.estimatedCost }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: 'Carbon Credits', value: efficiency.carbonCreditValue },
                    { name: 'Initial Cost', value: -financials.estimatedCost }
                  ].map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value >= 0 ? '#10b981' : '#ef4444'} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card bg-white/80 backdrop-blur-sm border-amber-200">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">Financial Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
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
  );
};

export default FinancialMetrics;
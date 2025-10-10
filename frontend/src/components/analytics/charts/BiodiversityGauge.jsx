import React from 'react';

const BiodiversityGauge = ({ data }) => {
  const { score, level, color, description } = data;

  // Calculate gauge rotation (0-180 degrees for 0-100 score)
  const gaugeRotation = (score / 100) * 180;

  return (
    <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 text-center">
      <h3 className="text-lg font-semibold text-emerald-900 mb-6">Biodiversity Impact</h3>
      
      {/* Gauge Visualization */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        {/* Gauge background */}
        <div className="absolute inset-0">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            {/* Gauge arc */}
            <path
              d="M 10,60 A 50,50 0 1 1 110,60"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            {/* Score arc */}
            <path
              d="M 10,60 A 50,50 0 1 1 110,60"
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${gaugeRotation} 180`}
              transform="rotate(180, 60, 60)"
            />
          </svg>
        </div>
        
        {/* Needle */}
        <div 
          className="absolute top-1/2 left-1/2 w-1 h-20 bg-gray-800 origin-bottom"
          style={{
            transform: `translateX(-50%) rotate(${gaugeRotation}deg)`,
            transformOrigin: 'bottom center'
          }}
        />
        
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        
        {/* Score display */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-3xl font-bold" style={{ color }}>
            {score}
          </div>
          <div className="text-xs text-gray-600">/100</div>
        </div>
      </div>

      {/* Level and Description */}
      <div className="space-y-3">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium`}
             style={{ backgroundColor: `${color}20`, color: color }}>
          {level} Impact
        </div>
        <p className="text-sm text-gray-700">{description}</p>
      </div>

      {/* Score Breakdown */}
      <div className="mt-6 space-y-2 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Species Diversity:</span>
          <span className="font-semibold text-gray-900">
            {Math.min(40, data.metrics.speciesDiversity * 8)}/40
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tree Density:</span>
          <span className="font-semibold text-gray-900">
            {Math.min(30, 30 * (1 - Math.abs(data.metrics.treeDensity - 1000) / 1000)).toFixed(0)}/30
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Native Species:</span>
          <span className="font-semibold text-gray-900">20/20</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Area Impact:</span>
          <span className="font-semibold text-gray-900">
            {Math.min(10, data.metrics.areaHectares * 2).toFixed(0)}/10
          </span>
        </div>
      </div>
    </div>
  );
};

export default BiodiversityGauge;
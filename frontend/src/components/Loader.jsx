import React from 'react';

export default function Loader() {
  return (
    <div className="card text-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-forest-200 border-t-forest-600 rounded-full animate-spin"></div>
        <div className="text-center">
          <h3 className="font-medium text-gray-900 mb-1">Analyzing Location</h3>
          <p className="text-sm text-gray-600">
            Fetching soil data, weather information, and generating AI recommendations...
          </p>
        </div>
      </div>
    </div>
  );
}
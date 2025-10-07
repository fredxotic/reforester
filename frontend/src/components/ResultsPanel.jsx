import React, { useState } from 'react';
import SpeciesSearch from './SpeciesSearch';

export default function ResultsPanel({ data, onReset }) {
  const { coordinates, soil, weather, recommendation } = data;
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' or 'species'

  const handleDownloadPDF = async () => {
    setDownloading(true);
    
    try {
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysisData: data }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Generate filename
      const lat = coordinates.lat.toFixed(4);
      const lon = coordinates.lon.toFixed(4);
      const date = new Date().toISOString().split('T')[0];
      a.download = `reforestation-plan-${lat}-${lon}-${date}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Download Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Reforestation Analysis</h2>
          <p className="text-gray-600 text-sm mt-1">
            Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
          </p>
          <p className="text-emerald-600 text-xs mt-1">
            Analysis completed • Ready for download
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="whitespace-nowrap">Generating PDF...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="whitespace-nowrap">Download PDF Report</span>
              </>
            )}
          </button>
          
          <button 
            onClick={onReset}
            className="flex items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="whitespace-nowrap">New Analysis</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analysis'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Analysis Results
          </button>
          <button
            onClick={() => setActiveTab('species')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'species'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🌳 Species Database
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'analysis' ? (
        <div className="space-y-6">
          {/* Data Source Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
              🌱 Soil: {soil.source}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
              🌤️ Weather: {weather.source}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
              🤖 AI: {recommendation.source}
            </span>
            {data.processingTime && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                ⚡ {data.processingTime}
              </span>
            )}
          </div>

          {/* Environmental Data Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Soil Data */}
            <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🌱</span>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900">Soil Composition</h3>
                  <p className="text-xs text-amber-600">Critical for species selection</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Soil Composition Bars */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-700 font-medium">Clay</span>
                    <span className="font-bold text-amber-900">{soil.clay}%</span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div 
                      className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${soil.clay}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-700 font-medium">Sand</span>
                    <span className="font-bold text-amber-900">{soil.sand}%</span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${soil.sand}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-700 font-medium">Silt</span>
                    <span className="font-bold text-amber-900">{soil.silt}%</span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div 
                      className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${soil.silt}%` }}
                    ></div>
                  </div>
                </div>
                
                {soil.note && (
                  <div className="mt-3 p-2 bg-amber-100 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-700">{soil.note}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Weather Data */}
            <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🌤️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Climate Conditions</h3>
                  <p className="text-xs text-blue-600">Current weather patterns</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-100 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{weather.temperature}°</div>
                    <div className="text-xs text-blue-600 mt-1">Current Temp</div>
                  </div>
                  
                  <div className="text-center p-3 bg-blue-100 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{weather.precipitation}mm</div>
                    <div className="text-xs text-blue-600 mt-1">Precipitation</div>
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-700">Daily Range</span>
                    <span className="font-bold text-blue-900">
                      {weather.minTemperature}°C - {weather.maxTemperature}°C
                    </span>
                  </div>
                </div>
                
                {weather.note && (
                  <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">{weather.note}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="card bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start space-x-3 mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🤖</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-900">Reforestation Strategy</h3>
                    <p className="text-sm text-emerald-700">
                      Powered by {recommendation.source}
                      {recommendation.model && ` • ${recommendation.model}`}
                    </p>
                  </div>
                  {recommendation.note && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-200 text-emerald-800">
                      {recommendation.note}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-emerald-100 shadow-inner">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                  {recommendation.text}
                </pre>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-emerald-200">
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Save as PDF</span>
              </button>
              
              <button 
                onClick={onReset}
                className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>New Location</span>
              </button>
            </div>
          </div>

          {/* Success & Disclaimer */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 text-sm">✅</span>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-900">Analysis Complete</h4>
                  <p className="text-sm text-emerald-700">
                    Your personalized reforestation plan is ready. Download the PDF report to share with your team or keep for reference.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-600 text-xs">⚠️</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 mb-1">Important Disclaimer</h4>
                  <p className="text-sm text-amber-800">
                    This analysis is generated for demonstration and educational purposes. The recommendations are based on 
                    available data and AI analysis. Always consult with local agricultural experts, forestry departments, 
                    and conduct proper site assessments before undertaking any reforestation projects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Species Database Tab */
        <div className="card bg-white border border-gray-200">
          <SpeciesSearch />
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import MapPicker from './components/MapPicker';
import ResultsPanel from './components/ResultsPanel';
import Loader from './components/Loader';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLocationSelect = async (lat, lon) => {
    setLoading(true);
    setError(null);
    setSelectedLocation({ lat, lon });
    
    try {
      const response = await fetch('/api/reforest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lon }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      setError(err.message);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedLocation(null);
    setAnalysisData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-lg">🌱</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">
                  ReForester
                </h1>
                <p className="text-xs text-emerald-600 -mt-1">AI Reforestation Assistant</p>
              </div>
            </div>
            
            {analysisData && (
              <button 
                onClick={handleReset}
                className="btn-secondary text-sm"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Map Section */}
          <div className="space-y-6">
            <div className="card bg-white/70 backdrop-blur-sm border-emerald-200 shadow-lg">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-emerald-900 mb-2">
                  Select Location
                </h2>
                <p className="text-emerald-700">
                  Click anywhere on the map or search for a location to analyze reforestation potential
                </p>
              </div>
              
              <div className="h-[500px] rounded-xl overflow-hidden border-2 border-emerald-300 shadow-inner">
                <MapPicker 
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={selectedLocation}
                />
              </div>

              {selectedLocation && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Selected Coordinates</p>
                      <p className="text-lg font-bold text-emerald-900">
                        {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
                      </p>
                    </div>
                    {loading && (
                      <div className="flex items-center space-x-2 text-emerald-600">
                        <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Analyzing...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card bg-white/60 text-center p-4 border-emerald-200">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-emerald-600">🌍</span>
                </div>
                <h3 className="font-semibold text-emerald-900 text-sm">Global Coverage</h3>
                <p className="text-xs text-emerald-700 mt-1">Analyze any location worldwide</p>
              </div>
              
              <div className="card bg-white/60 text-center p-4 border-emerald-200">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-emerald-600">📊</span>
                </div>
                <h3 className="font-semibold text-emerald-900 text-sm">Real Data</h3>
                <p className="text-xs text-emerald-700 mt-1">Live soil & weather analysis</p>
              </div>
              
              <div className="card bg-white/60 text-center p-4 border-emerald-200">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-emerald-600">🌳</span>
                </div>
                <h3 className="font-semibold text-emerald-900 text-sm">Species Database</h3>
                <p className="text-xs text-emerald-700 mt-1">Thousands of tree species</p>
              </div>
            </div>

            {/* Quick Access Species */}
            {!analysisData && !loading && (
              <div className="card bg-white/70 backdrop-blur-sm border-emerald-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-600 text-lg">🔍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900">Explore Tree Species</h3>
                    <p className="text-sm text-emerald-700">
                      Browse our comprehensive species database
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="font-medium text-emerald-900">Acacia</div>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="font-medium text-emerald-900">Oak</div>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="font-medium text-emerald-900">Pine</div>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="font-medium text-emerald-900">Mahogany</div>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="font-medium text-emerald-900">Eucalyptus</div>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="font-medium text-emerald-900">Baobab</div>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 mt-3 text-center">
                  Select a location to see species recommendations for that area
                </p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {loading && <Loader />}
            
            {error && (
              <div className="card border-red-200 bg-red-50/80 backdrop-blur-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-sm">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900">Analysis Error</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                    <button 
                      onClick={handleReset}
                      className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Try Another Location
                    </button>
                  </div>
                </div>
              </div>
            )}

            {analysisData && !loading && (
              <ResultsPanel data={analysisData} onReset={handleReset} />
            )}

            {!analysisData && !loading && !error && (
              <div className="card bg-white/70 backdrop-blur-sm border-emerald-200 text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🌳</span>
                </div>
                <h3 className="text-2xl font-bold text-emerald-900 mb-3">
                  Start Your Reforestation Journey
                </h3>
                <p className="text-emerald-700 max-w-md mx-auto text-lg mb-6">
                  Select a location on the map to receive personalized tree planting recommendations and access our comprehensive species database.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm text-emerald-600 mb-6">
                  <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-lg">
                    <span>📍</span>
                    <span>Click Map or Search</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-lg">
                    <span>⏱️</span>
                    <span>Instant Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-lg">
                    <span>🌱</span>
                    <span>Get Plan + Species</span>
                  </div>
                </div>
                
                {/* Feature Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="text-left p-4 bg-white/50 rounded-lg border border-emerald-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-emerald-600">📊</span>
                      <h4 className="font-semibold text-emerald-900">Smart Analysis</h4>
                    </div>
                    <p className="text-sm text-emerald-700">
                      Get soil composition, weather data, and AI-powered planting strategies
                    </p>
                  </div>
                  <div className="text-left p-4 bg-white/50 rounded-lg border border-emerald-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-emerald-600">🌳</span>
                      <h4 className="font-semibold text-emerald-900">Species Database</h4>
                    </div>
                    <p className="text-sm text-emerald-700">
                      Access thousands of tree species with detailed information and images
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-emerald-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-xs">🌍</span>
              </div>
              <p className="text-emerald-800 font-medium">
                ReForester - Planting Tomorrow's Forests Today
              </p>
            </div>
            <p className="text-emerald-600 text-sm mb-4">
              AI-powered reforestation planning with global species database
            </p>
            <div className="flex justify-center space-x-6 text-xs text-emerald-500">
              <span>🌱 Soil Analysis</span>
              <span>🌤️ Weather Data</span>
              <span>🤖 AI Recommendations</span>
              <span>🌳 Species Database</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
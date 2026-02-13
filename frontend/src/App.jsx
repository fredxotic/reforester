import React, { useState } from 'react';
import MapPicker from './components/MapPicker';
import ResultsPanel from './components/ResultsPanel';
import Loader from './components/Loader';
import Sidebar from './components/Sidebar';
import SpeciesDatabase from './components/SpeciesDatabase';
import ProjectDashboard from './components/projects/ProjectDashboard';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import UserProfile from './components/auth/UserProfile';
import TeamDashboard from './components/teams/TeamDashboard';
import TeamDetail from './components/teams/TeamDetail';
import CommunityHub from './components/community/CommunityHub';
import AuthModal from './components/auth/AuthModal';
import AuthRequiredView from './components/common/AuthRequiredView';
import { useAuth } from './contexts/AuthContext';
import { reforestAPI } from './services/reforestApi';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('map');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const handleLocationSelect = async (lat, lon) => {
    setLoading(true);
    setError(null);
    setSelectedLocation({ lat, lon });
    
    try {
      const data = await reforestAPI.analyzeLocation(lat, lon);
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

  const handleViewChange = (view) => {
    // Require authentication for protected views
    if (['projects', 'analytics', 'account', 'teams', 'community'].includes(view) && !isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    
    setActiveView(view);
    // Reset analysis data when switching away from map view
    if (view !== 'map') {
      setAnalysisData(null);
      setSelectedLocation(null);
      setError(null);
    }
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Render different views based on activeView
  const renderMainContent = () => {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader />
        </div>
      );
    }

    switch (activeView) {
      case 'species':
        return <SpeciesDatabase />;

      case 'team-detail':
        return selectedTeamId ? (
          <TeamDetail 
            teamId={selectedTeamId} 
            onBack={() => { setSelectedTeamId(null); setActiveView('teams'); }} 
          />
        ) : (
          <TeamDashboard onViewTeam={(id) => { setSelectedTeamId(id); setActiveView('team-detail'); }} />
        );
      
      case 'projects':
        return isAuthenticated ? (
          <ProjectDashboard />
        ) : (
          <AuthRequiredView 
            title="Project Management"
            description="Manage your reforestation projects"
            onAuth={() => setAuthModalOpen(true)}
          />
        );
      
      case 'analytics':
        return isAuthenticated ? (
          <AnalyticsDashboard />
        ) : (
          <AuthRequiredView 
            title="Advanced Analytics"
            description="Access growth projections and insights"
            onAuth={() => setAuthModalOpen(true)}
          />
        );
      
      case 'teams':
        return isAuthenticated ? (
          <TeamDashboard onViewTeam={(id) => { setSelectedTeamId(id); setActiveView('team-detail'); }} />
        ) : (
          <AuthRequiredView 
            title="Team Collaboration"
            description="Create teams and collaborate on projects"
            onAuth={() => setAuthModalOpen(true)}
          />
        );
      
      case 'community':
        return isAuthenticated ? (
          <CommunityHub />
        ) : (
          <AuthRequiredView 
            title="Community Hub"
            description="Connect with other reforestation enthusiasts"
            onAuth={() => setAuthModalOpen(true)}
          />
        );
      
      case 'account':
        return isAuthenticated ? (
          <UserProfile />
        ) : (
          <AuthRequiredView 
            title="Account Settings"
            description="Manage your profile and preferences"
            onAuth={() => setAuthModalOpen(true)}
          />
        );
      
      case 'map':
      default:
        return renderMapAnalysis();
    }
  };

  const renderMapAnalysis = () => {
    return (
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${
        sidebarCollapsed ? 'max-w-[calc(100vw-5rem)]' : 'max-w-7xl'
      }`}>
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
                  <span className="text-emerald-600">🤖</span>
                </div>
                <h3 className="font-semibold text-emerald-900 text-sm">AI Powered</h3>
                <p className="text-xs text-emerald-700 mt-1">Smart recommendations</p>
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
                  Select a location on the map to receive personalized tree planting recommendations.
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
                    <span>📄</span>
                    <span>Get PDF Report</span>
                  </div>
                </div>
                
                {/* Auth prompt for non-authenticated users */}
                {!isAuthenticated && (
                  <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-600">🔒</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-900">Create an Account</h4>
                        <p className="text-amber-700 text-sm">Save your analyses and access advanced features</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-amber-700 mb-4">
                      <div className="flex items-center space-x-1">
                        <span>📊</span>
                        <span>Project Management</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>👥</span>
                        <span>Team Collaboration</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>💾</span>
                        <span>Save Locations</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setAuthModalOpen(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Sign Up Free
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
        {/* Header with Hamburger */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                {/* Hamburger Menu */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-emerald-50 transition-colors md:hidden"
                >
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* Desktop collapse button when sidebar is collapsed */}
                {sidebarCollapsed && (
                  <button
                    onClick={toggleSidebarCollapse}
                    className="hidden md:flex p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                    title="Expand sidebar"
                  >
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white text-sm">🌱</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">
                      ReForester
                    </h1>
                  </div>
                </div>
              </div>
              
              {/* View Title */}
              <div className="flex-1 text-center">
                <h2 className="text-lg font-semibold text-emerald-900 capitalize">
                  {activeView === 'map' ? 'Map Analysis' : 
                  activeView === 'species' ? 'Species Database' :
                  activeView.replace(/([A-Z])/g, ' $1').trim()}
                </h2>
              </div>

              {/* User/Auth Section */}
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-emerald-900">{user.name}</p>
                      <p className="text-xs text-emerald-600">{user.email}</p>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setAuthModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Sign In
                    </button>
                  </div>
                )}

                {analysisData && activeView === 'map' && (
                  <button 
                    onClick={handleReset}
                    className="btn-secondary text-sm"
                  >
                    New Analysis
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex">
          {/* Sidebar */}
          <Sidebar 
            activeView={activeView}
            onViewChange={handleViewChange}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
          
          {/* Main Content */}
          <main className="flex-1 min-h-screen overflow-x-hidden">
            {renderMainContent()}
          </main>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}

export default App;
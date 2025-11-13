import React from 'react';

const Sidebar = ({ activeView, onViewChange, isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const menuItems = [
    { id: 'map', label: 'Map Analysis', icon: '🗺️', description: 'Analyze locations' },
    { id: 'species', label: 'Species Database', icon: '🌿', description: 'Browse tree species' },
    { id: 'projects', label: 'My Projects', icon: '📊', description: 'Manage reforestation projects' },
    { id: 'teams', label: 'Teams', icon: '👥', description: 'Collaborate with teams' },
    { id: 'community', label: 'Community', icon: '🌍', description: 'Connect with others' },
    { id: 'analytics', label: 'Analytics', icon: '📈', description: 'Growth projections & insights' },
    { id: 'account', label: 'Account', icon: '👤', description: 'Profile & settings' },
  ];

  const handleItemClick = (viewId) => {
    onViewChange(viewId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50
        ${isCollapsed ? 'w-20' : 'w-80'} 
        bg-white/95 backdrop-blur-sm border-r border-emerald-200
        transform transition-all duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center p-4' : 'justify-between p-6'} border-b border-emerald-200`}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-lg">🌱</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">
                  ReForester
                </h1>
                <p className="text-xs text-emerald-600 -mt-1">AI Reforestation Platform</p>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-lg">🌱</span>
            </div>
          )}
          
          {/* Desktop collapse button and mobile close button */}
          <div className="flex items-center space-x-2">
            {/* Desktop collapse button */}
            <button 
              onClick={onToggleCollapse}
              className="hidden md:flex p-2 hover:bg-emerald-50 rounded-lg transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg 
                className={`w-4 h-4 text-emerald-600 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Close button for mobile */}
            <button 
              onClick={onClose}
              className="md:hidden p-2 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`
                w-full transition-all duration-200 group relative
                flex items-center
                ${isCollapsed ? 'justify-center p-3' : 'p-4 space-x-4'}
                rounded-xl
                ${activeView === item.id 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                  : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900 hover:shadow-md'
                }
              `}
              title={isCollapsed ? item.label : ''}
            >
              <span className={`transition-transform group-hover:scale-110 ${isCollapsed ? 'text-2xl' : 'text-2xl'}`}>
                {item.icon}
              </span>
              
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-semibold text-lg">{item.label}</div>
                  <div className={`text-sm mt-1 ${
                    activeView === item.id ? 'text-emerald-100' : 'text-emerald-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              )}
              
              {/* Active indicator */}
              {activeView === item.id && (
                <div className={`${isCollapsed ? 'absolute -right-1 top-1/2 transform -translate-y-1/2' : ''} w-2 h-2 bg-white rounded-full`}></div>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                  <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Collaboration Status - Only show when not collapsed */}
        {!isCollapsed && (
          <div className="p-4 border-t border-emerald-200">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900">Team Collaboration</p>
                  <p className="text-xs text-emerald-600">Real-time features enabled</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-emerald-600">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Chat</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sharing</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Updates</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer - Only show when not collapsed */}
        {!isCollapsed && (
          <div className="p-4 border-t border-emerald-200">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 text-center">
              <p className="text-sm text-emerald-700 font-medium">
                Planting Tomorrow's Forests Today
              </p>
              <p className="text-xs text-emerald-500 mt-1">
                AI-Powered Reforestation Platform
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
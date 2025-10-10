import React, { useState } from 'react';
import SpeciesSearch from './SpeciesSearch';

const SpeciesDatabase = () => {
  const [searchMode, setSearchMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-6">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent mb-4">
            Species Database
          </h1>
          <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
            Explore thousands of tree species with detailed information, images, and planting recommendations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 text-center">
            <div className="text-3xl text-emerald-600 mb-2">🌳</div>
            <div className="text-2xl font-bold text-emerald-900">1,000+</div>
            <div className="text-emerald-600">Tree Species</div>
          </div>
          <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 text-center">
            <div className="text-3xl text-emerald-600 mb-2">🌍</div>
            <div className="text-2xl font-bold text-emerald-900">Global</div>
            <div className="text-emerald-600">Coverage</div>
          </div>
          <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 text-center">
            <div className="text-3xl text-emerald-600 mb-2">📷</div>
            <div className="text-2xl font-bold text-emerald-900">HD Images</div>
            <div className="text-emerald-600">& Details</div>
          </div>
          <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 text-center">
            <div className="text-3xl text-emerald-600 mb-2">🔍</div>
            <div className="text-2xl font-bold text-emerald-900">Smart</div>
            <div className="text-emerald-600">Search</div>
          </div>
        </div>

        {/* Search Section */}
        <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-emerald-900 mb-3">
              Find Your Perfect Tree Species
            </h2>
            <p className="text-emerald-700 max-w-2xl mx-auto">
              Search by common name, scientific name, or browse popular species. Get detailed information about growth requirements, benefits, and planting guidelines.
            </p>
          </div>

          <SpeciesSearch />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-emerald-600">📚</span>
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-3">Comprehensive Data</h3>
            <p className="text-emerald-700">
              Detailed species information including taxonomy, growth patterns, environmental requirements, and ecological benefits.
            </p>
          </div>

          <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-emerald-600">🖼️</span>
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-3">Visual Library</h3>
            <p className="text-emerald-700">
              High-quality images and botanical illustrations to help with species identification and selection.
            </p>
          </div>

          <div className="card bg-white/80 backdrop-blur-sm border-emerald-200 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-emerald-600">🔗</span>
            </div>
            <h3 className="text-xl font-bold text-emerald-900 mb-3">External Resources</h3>
            <p className="text-emerald-700">
              Direct links to Wikipedia, GBIF, and other authoritative sources for additional research.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeciesDatabase;
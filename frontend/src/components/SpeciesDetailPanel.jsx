// components/SpeciesDetailPanel.jsx
import React from 'react';

export default function SpeciesDetailPanel({ species, onClose }) {
  if (!species) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                {species.commonName || species.scientificName}
              </h2>
              <p className="text-xl text-gray-600 italic">
                {species.scientificName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Image Gallery */}
          <div className="mb-6">
            {species.imageUrl || (species.images && species.images.length > 0) ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {species.imageUrl && (
                  <img
                    src={species.imageUrl}
                    alt={species.commonName}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                )}
                {species.images && species.images.slice(0, 2).map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`${species.commonName} ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Taxonomy */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Taxonomy
              </h3>
              <div className="space-y-2">
                {species.family && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Family:</span>
                    <span className="font-medium text-gray-900">{species.family}</span>
                  </div>
                )}
                {species.order && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order:</span>
                    <span className="font-medium text-gray-900">{species.order}</span>
                  </div>
                )}
                {species.kingdom && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kingdom:</span>
                    <span className="font-medium text-gray-900">{species.kingdom}</span>
                  </div>
                )}
                {species.rank && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rank:</span>
                    <span className="font-medium text-gray-900 capitalize">{species.rank}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Facts */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <svg className="w-4 h-4 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">Data from {species.source?.toUpperCase() || 'Multiple Sources'}</span>
                </div>
                {species.source === 'gbif' && (
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-gray-700">Verified taxonomic data</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {species.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed text-justify">
                {species.description}
              </p>
            </div>
          )}

          {/* Additional Images */}
          {species.images && species.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {species.images.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`${species.commonName} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => window.open(image.url, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* External Links */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
            {species.wikipediaUrl && (
              <a
                href={species.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Wikipedia
              </a>
            )}
            
            {species.gbifUrl && (
              <a
                href={species.gbifUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                GBIF Database
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
}
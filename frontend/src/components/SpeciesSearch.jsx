// imports: React, useState, useEffect, etc.
import React, { useState, useEffect, useRef } from 'react';
import { searchSpecies, getSpeciesDetails, getPopularSpecies } from '../services/speciesApi';
import SpeciesDetailPanel from './SpeciesDetailPanel';

const FallbackImage = ({ className }) => (
  <div className={`${className} bg-gray-100 flex items-center justify-center`}>
    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
);

const SpeciesImage = ({ species, className }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!species.imageUrl || error) {
    return <FallbackImage className={className} />;
  }

  return (
    <>
      {loading && (
        <div className={`${className} bg-gray-100 flex items-center justify-center`}>
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={species.imageUrl}
        alt={species.commonName || species.scientificName}
        className={`${className} ${loading ? 'hidden' : 'block'} object-cover`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </>
  );
};

export default function SpeciesSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showPopular, setShowPopular] = useState(true);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults(getPopularSpecies());
      setShowPopular(true);
      return;
    }
    setShowPopular(false);

    const handler = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await searchSpecies(searchQuery);
        setResults(res);
      } catch (e) {
        console.error('searchSpecies failed', e);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const onSelect = async (sp) => {
    setIsLoading(true);
    try {
      const detail = await getSpeciesDetails(sp.id, sp);
      setSelected(detail);
    } catch (e) {
      console.error('getSpeciesDetails failed', e);
      setSelected(sp);
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setSearchQuery('');
    setResults(getPopularSpecies());
    setShowPopular(true);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Tree Species Database</h2>
        <p>Search species by common or scientific name</p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search e.g. Oak, Acacia, Quercus..."
          className="block w-full pl-10 pr-12 py-4 border rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-lg"
        />
        {searchQuery && (
          <button
            onClick={clear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {isLoading && (
          <div className="absolute right-10 top-4">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {!showPopular && !isLoading && results.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-amber-800 font-medium">No species found.</p>
              <p className="text-amber-700">
                No results for "<strong>{searchQuery}</strong>". Try a scientific name or a different common name.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {results.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">
                {showPopular ? 'Popular Tree Species' : `Search Results (${results.length})`}
              </h3>
              {!showPopular && (
                <button onClick={clear} className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to popular</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map(sp => (
                <SpeciesResultCard key={sp.id} species={sp} onSelect={onSelect} />
              ))}
            </div>
          </>
        )}
      </div>

      {selected && (
        <SpeciesDetailPanel species={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function SpeciesResultCard({ species, onSelect }) {
  return (
    <button
      onClick={() => onSelect(species)}
      className="w-full text-left bg-white rounded-lg border p-4 hover:shadow-md"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <SpeciesImage species={species} className="w-16 h-16 rounded-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">{species.commonName || species.scientificName}</h3>
          <p className="text-sm italic">{species.scientificName}</p>
          {species.family && (
            <p className="text-xs text-gray-500">Family: <span className="font-medium">{species.family}</span></p>
          )}
          {species.description && (
            <p className="text-sm text-gray-700 line-clamp-2">{species.description}</p>
          )}
          {species.source && species.source !== 'popular' && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700">
                Data: {species.source.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm">
            View
          </span>
        </div>
      </div>
    </button>
  );
}

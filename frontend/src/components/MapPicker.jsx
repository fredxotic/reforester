import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom green marker icon
const greenIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="#16a34a" stroke="white" stroke-width="3"/>
    </svg>
  `),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Search icon component
const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Location icon component
const LocationIcon = () => (
  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Map controller component to handle view changes
function MapController({ selectedLocation }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedLocation) {
      map.setView([selectedLocation.lat, selectedLocation.lon], 12);
    }
  }, [selectedLocation, map]);

  return null;
}

function MapEvents({ onLocationSelect, selectedLocation }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });

  return selectedLocation ? (
    <Marker 
      position={[selectedLocation.lat, selectedLocation.lon]} 
      icon={greenIcon}
    />
  ) : null;
}

export default function MapPicker({ onLocationSelect, selectedLocation }) {
  const defaultCenter = [-1.2921, 36.8219]; // Nairobi, Kenya
  const mapRef = useRef();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef();

  // Search for locations using OpenStreetMap Nominatim API
  const searchLocations = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchLocations(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle location selection from search results - FIXED VERSION
  const handleLocationSelectFromSearch = (location) => {
    console.log('Selected location:', location); // Debug log
    
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);
    
    setSearchQuery(location.display_name);
    setShowResults(false);
    
    // Update map view
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 12);
    }
    
    // Call the parent's location select handler
    onLocationSelect(lat, lon);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 12);
          }
          onLocationSelect(latitude, longitude);
          setSearchQuery(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your current location. Please ensure location services are enabled.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Handle clicking outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000]" ref={searchInputRef}>
        <div className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowResults(true)}
                placeholder="Search for a location..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200"
              />
              
              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 max-h-60 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="inline-block w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2">Searching...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((location, index) => (
                      <button
                        key={location.place_id}
                        onClick={() => handleLocationSelectFromSearch(location)}
                        className="w-full text-left p-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start space-x-2">
                          <LocationIcon />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {location.display_name.split(',')[0]}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {location.display_name.split(',').slice(1, 3).join(',').trim()}
                            </div>
                            <div className="text-xs text-emerald-600 mt-1">
                              Lat: {parseFloat(location.lat).toFixed(4)}, Lon: {parseFloat(location.lon).toFixed(4)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : searchQuery && !isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      No locations found for "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>
            
            {/* Current Location Button */}
            <button
              onClick={getCurrentLocation}
              className="px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-lg flex items-center justify-center"
              title="Use my current location"
            >
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a9 9 0 0 1 9 9c0 1.657-.48 3.2-1.307 4.5m-2.727 2.728A8.964 8.964 0 0 1 12 21a9 9 0 0 1-9-9c0-1.657.48-3.2 1.307-4.5m2.727-2.728A8.964 8.964 0 0 1 12 3" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController selectedLocation={selectedLocation} />
        <MapEvents 
          onLocationSelect={onLocationSelect}
          selectedLocation={selectedLocation}
        />
      </MapContainer>

      {/* Map Instructions */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000]">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
          <p className="text-sm text-gray-700 text-center">
            💡 <strong>Click anywhere on the map</strong> or <strong>search for a location</strong> to analyze reforestation potential
          </p>
        </div>
      </div>
    </div>
  );
}
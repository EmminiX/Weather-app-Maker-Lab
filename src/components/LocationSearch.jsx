import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LocationSearch({ onLocationSelect, onGetLocation, loading }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const searchResults = await onLocationSelect.searchLocation(query);
    setResults(searchResults);
    setShowResults(true);
  };

  const handleSelect = async (location) => {
    await onLocationSelect.setLocation({
      lat: location.lat,
      lon: location.lon,
      name: location.name,
      country: location.country
    });
    setQuery('');
    setShowResults(false);
    // Refresh the page after location is set
    window.location.reload();
  };

  const handleGetLocation = async () => {
    try {
      await onGetLocation();
      // Only refresh after geolocation is successfully set
      window.location.reload();
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter city name..."
            className="w-full px-8 py-4 text-lg rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 
                     focus:border-transparent"
            aria-label="Search location"
          />
          <AnimatePresence>
            {showResults && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 
                         rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {results.map((result) => (
                  <button
                    key={`${result.lat}-${result.lon}`}
                    onClick={() => handleSelect(result)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 
                             dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {result.name}, {result.country}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-8 py-4 text-lg bg-blue-500 text-white rounded-lg min-w-[120px]
                   hover:bg-blue-600 disabled:bg-gray-400 
                   disabled:cursor-not-allowed transition-colors"
          title="Search for a location"
        >
          Search
        </button>
        <div 
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={loading}
            className="px-8 py-4 text-2xl bg-gray-100 dark:bg-gray-700 rounded-lg min-w-[80px]
                     hover:bg-gray-200 dark:hover:bg-gray-600 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Use current location"
          >
            📍
          </button>
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1
                         bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-md whitespace-nowrap"
              >
                Use my current location
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
      
      {/* Search Tips */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center"
      >
        <p>
          Try searching for a city (e.g., "Sligo", "Berlin"). 
          Click the 📍 icon to use your current location.
        </p>
      </motion.div>
    </div>
  );
}
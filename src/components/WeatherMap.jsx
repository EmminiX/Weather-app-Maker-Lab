import React, { useEffect, useState, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

// Map layer types
const WEATHER_LAYERS = [
  { name: 'Temperature', code: 'temp_new' },
  { name: 'Wind Speed', code: 'wind_new' },
  { name: 'Precipitation', code: 'precipitation_new' },
  { name: 'Clouds', code: 'clouds_new' },
  { name: 'Pressure', code: 'pressure_new' }
];

// Helper function to create a futuristic location marker HTML
const getLocationMarkerHtml = (iconCode) => {
  // Get color based on weather condition
  const getColorByIcon = (code) => {
    if (!code) return '#3b82f6'; // Default blue
    
    // Extract the condition code (first 2 digits)
    const condition = code.substring(0, 2);
    
    switch (condition) {
      case '01': return '#f59e0b'; // Clear - amber
      case '02': 
      case '03': 
      case '04': return '#6b7280'; // Clouds - gray
      case '09':
      case '10': return '#3b82f6'; // Rain - blue
      case '11': return '#8b5cf6'; // Thunderstorm - purple
      case '13': return '#e5e7eb'; // Snow - light gray
      case '50': return '#9ca3af'; // Mist - gray
      default: return '#3b82f6'; // Default blue
    }
  };
  
  const color = getColorByIcon(iconCode);
  
  return `
    <div style="position: relative; width: 60px; height: 60px;">
      <!-- Outer pulsing ring -->
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                  width: 60px; height: 60px; border-radius: 50%; 
                  background: radial-gradient(circle, ${color}20 0%, transparent 70%);
                  animation: pulse 2s infinite ease-in-out;">
      </div>
      
      <!-- Inner marker -->
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                  width: 20px; height: 20px; border-radius: 50%;
                  background-color: ${color}; box-shadow: 0 0 15px ${color}80;
                  border: 2px solid rgba(255, 255, 255, 0.8);">
      </div>
      
      <!-- Center dot -->
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                  width: 6px; height: 6px; border-radius: 50%;
                  background-color: white;">
      </div>
      
      <!-- Decorative lines -->
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                  width: 40px; height: 40px; border-radius: 50%;
                  border: 1px dashed rgba(255, 255, 255, 0.5);">
      </div>
    </div>
    
    <style>
      @keyframes pulse {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.4; }
        100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
      }
    </style>
  `;
};

export function WeatherMap({ center, zoom = 10, currentWeather }) {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [activeLayer, setActiveLayer] = useState(null);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Debug logging
  useEffect(() => {
    console.log('WeatherMap component rendered');
    console.log('Center:', center);
    console.log('API Key available:', !!API_KEY);
    console.log('Current Weather:', currentWeather);
  }, [center, API_KEY, currentWeather]);

  // Initialize map using vanilla Leaflet
  useEffect(() => {
    if (!center || !API_KEY || !window.L) return;

    // Clean up previous map instance if it exists
    if (mapRef.current) {
      mapRef.current.remove();
    }

    try {
      console.log('Initializing map with Leaflet version:', window.L.version);
      
      // Create map
      const map = window.L.map(mapContainerRef.current, {
        center: [center.lat, center.lon],
        zoom: zoom,
        zoomControl: false
      });
      
      mapRef.current = map;
      
      // Add zoom control
      window.L.control.zoom({ position: 'bottomleft' }).addTo(map);
      
      // Add base tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      
      // Add weather layer if one is active
      if (activeLayer) {
        window.L.tileLayer(`https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${API_KEY}`, {
          attribution: '&copy; <a href="https://openweathermap.org/">OpenWeather</a>',
          opacity: 0.5
        }).addTo(map);
      }
      
      // Add marker for current weather
      if (currentWeather) {
        const popupContent = `
          <div style="min-width: 200px; padding: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <h3 style="font-weight: bold; font-size: 16px;">${currentWeather.name}</h3>
              <span style="font-size: 12px; color: #666;">${new Date(currentWeather.dt * 1000).toLocaleTimeString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 24px; font-weight: bold;">${Math.round(currentWeather.main.temp)}°C</span>
              <span style="text-transform: capitalize;">${currentWeather.weather[0].description}</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">
              <div>
                <p style="color: #666;">Feels Like</p>
                <p style="font-weight: 500;">${Math.round(currentWeather.main.feels_like)}°C</p>
              </div>
              <div>
                <p style="color: #666;">Wind</p>
                <p style="font-weight: 500;">${currentWeather.wind.speed} m/s</p>
              </div>
              <div>
                <p style="color: #666;">Humidity</p>
                <p style="font-weight: 500;">${currentWeather.main.humidity}%</p>
              </div>
              <div>
                <p style="color: #666;">Pressure</p>
                <p style="font-weight: 500;">${currentWeather.main.pressure} hPa</p>
              </div>
            </div>
          </div>
        `;
        
        // Create a custom icon
        const customIcon = window.L.divIcon({
          html: getLocationMarkerHtml(currentWeather.weather[0].icon),
          className: '',
          iconSize: [60, 60],
          iconAnchor: [30, 30]
        });
        
        window.L.marker([center.lat, center.lon], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);
      }
      
      // Set map as loaded
      setIsMapLoaded(true);
      setMapError(null);
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(error.message || 'Failed to initialize map');
    }
    
    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, API_KEY, currentWeather, activeLayer]);

  if (!center) {
    return (
      <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Please select a location to view the weather map</p>
      </div>
    );
  }
  
  if (!API_KEY) {
    return (
      <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-red-500">API key is missing. Please check your environment variables.</p>
      </div>
    );
  }
  
  if (mapError) {
    return (
      <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-red-500">Error loading map: {mapError}</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="h-[500px] w-full rounded-lg overflow-hidden shadow-lg relative mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
    >
      <AnimatePresence>
        {!isMapLoaded && (
          <motion.div 
            className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 absolute top-0 left-0 z-10"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            key="loading-spinner"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Map container */}
      <div 
        ref={mapContainerRef} 
        className="h-full w-full relative z-[90]"
        style={{ height: '500px', width: '100%' }}
      ></div>

      {/* Layer controls */}
      <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md z-[91]">
        <div className="text-xs font-medium mb-2">Weather Layers</div>
        <div className="space-y-1">
          {WEATHER_LAYERS.map(layer => (
            <button
              key={layer.code}
              className={`block w-full text-left px-2 py-1 text-xs rounded ${activeLayer === layer.code ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => setActiveLayer(activeLayer === layer.code ? null : layer.code)}
            >
              {layer.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map overlay info */}
      <div className="absolute bottom-5 right-5 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md z-[91] opacity-80 hover:opacity-100 transition-opacity">
        <div className="text-xs font-medium">Weather Map</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Use the controls in the top right to toggle weather layers
        </div>
      </div>
    </motion.div>
  );
}

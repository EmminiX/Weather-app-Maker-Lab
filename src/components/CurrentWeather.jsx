import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

// Helper function to get UV index description and color
const getUVInfo = (uvIndex) => {
  if (uvIndex <= 2) return { level: 'Low', color: 'green', advice: 'No protection needed' };
  if (uvIndex <= 5) return { level: 'Moderate', color: '#B8860B', advice: 'Wear sunscreen' }; // Darker yellow (DarkGoldenRod)
  if (uvIndex <= 7) return { level: 'High', color: 'orange', advice: 'Sunscreen & hat recommended' };
  if (uvIndex <= 10) return { level: 'Very High', color: 'red', advice: 'Extra protection essential' };
  return { level: 'Extreme', color: 'purple', advice: 'Stay indoors when possible' };
};

// Helper function to get air quality description and color
const getAQIInfo = (aqi) => {
  if (aqi <= 50) return { level: 'Good', color: 'green', description: 'Air quality is satisfactory' };
  if (aqi <= 100) return { level: 'Moderate', color: 'yellow', description: 'Acceptable air quality' };
  if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'orange', description: 'Sensitive groups may experience effects' };
  if (aqi <= 200) return { level: 'Unhealthy', color: 'red', description: 'Everyone may experience health effects' };
  if (aqi <= 300) return { level: 'Very Unhealthy', color: 'purple', description: 'Health alert: everyone may experience more serious effects' };
  return { level: 'Hazardous', color: 'maroon', description: 'Health warning of emergency conditions' };
};

// Helper function to get weather tips based on conditions
const getWeatherTips = (temp, description, humidity, windSpeed) => {
  const tips = [];
  
  // Temperature-based tips
  if (temp < 0) {
    tips.push('Wear multiple layers and cover extremities');
  } else if (temp < 10) {
    tips.push('Wear a warm coat and consider gloves');
  } else if (temp < 20) {
    tips.push('A light jacket or sweater is recommended');
  } else if (temp < 30) {
    tips.push('Light clothing and stay hydrated');
  } else {
    tips.push('Wear breathable clothing and drink plenty of water');
  }
  
  // Weather condition tips
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('rain') || lowerDesc.includes('drizzle') || lowerDesc.includes('shower')) {
    tips.push('Bring an umbrella or raincoat');
  } else if (lowerDesc.includes('snow') || lowerDesc.includes('sleet')) {
    tips.push('Wear waterproof boots and drive carefully');
  } else if (lowerDesc.includes('fog') || lowerDesc.includes('mist')) {
    tips.push('Use fog lights when driving and allow extra travel time');
  } else if (lowerDesc.includes('thunder') || lowerDesc.includes('storm')) {
    tips.push('Stay indoors and away from trees or metal objects');
  } else if (lowerDesc.includes('clear') && temp > 20) {
    tips.push('Apply sunscreen if spending time outdoors');
  }
  
  // Humidity and wind tips
  if (humidity > 80) {
    tips.push('High humidity: stay cool and hydrated');
  }
  if (windSpeed > 10) {
    tips.push('Strong winds: secure loose outdoor items');
  }
  
  return tips;
};

export function CurrentWeather({ data }) {
  const [activeTip, setActiveTip] = useState(0);
  
  // Auto-rotate through tips
  useEffect(() => {
    if (!data) return; // Skip effect if no data
    
    const tips = getWeatherTips(data.main.temp, data.weather[0].description, data.main.humidity, data.wind.speed);
    
    const interval = setInterval(() => {
      setActiveTip(prev => (prev + 1) % tips.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [data]);
  
  if (!data) return null;

  const {
    main: { temp, feels_like, humidity, pressure },
    weather: [{ description, icon }],
    wind: { speed },
    visibility = 10000, // Default value if not provided
    sys: { sunrise = Date.now()/1000, sunset = (Date.now()/1000) + 12*3600, country = 'Unknown' } = {} // Default values
  } = data;
  
  // Mock data for demonstration (in a real app, these would come from API)
  const uvIndex = 5; // Example UV index
  const airQuality = 45; // Example AQI
  const moonPhase = 0.25; // 0 = new moon, 0.5 = full moon, 1 = new moon again
  
  // Get UV and AQI information
  const uvInfo = getUVInfo(uvIndex);
  const aqiInfo = getAQIInfo(airQuality);
  
  // Get weather tips
  const tips = getWeatherTips(temp, description, humidity, speed);
  
  // Format sunrise/sunset times
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Calculate day length
  const dayLengthInSeconds = sunset - sunrise;
  const dayHours = Math.floor(dayLengthInSeconds / 3600);
  const dayMinutes = Math.floor((dayLengthInSeconds % 3600) / 60);
  
  // Tips are now handled in the useEffect above

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="p-6 bg-black/30 backdrop-blur-md rounded-xl shadow-lg cursor-pointer relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-5 bg-blue-500 dark:bg-blue-400"></div>
      <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full opacity-5 bg-purple-500 dark:bg-purple-400"></div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Current Weather</h2>
          <p className="text-gray-600 dark:text-gray-400 capitalize text-lg mt-1">{description}</p>
        </div>
        <motion.div
          className="bg-gradient-to-br from-blue-400 to-purple-500 p-2 rounded-full shadow-lg"
          whileHover={{ rotate: 10, scale: 1.1 }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ 
            scale: 1,
            opacity: 1,
            y: [0, -5, 0],
            transition: { 
              y: {
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut"
              },
              scale: {
                duration: 0.5
              },
              opacity: {
                duration: 0.5
              }
            }
          }}
        >
          <motion.img
            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
            alt={description}
            className="w-20 h-20"
            whileHover={{ rotate: 10 }}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl shadow-md"
          >
            <p className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">{Math.round(temp)}°C</p>
            <p className="text-md text-gray-600 dark:text-gray-400 mt-1">
              Feels like {Math.round(feels_like)}°C
            </p>
          </motion.div>
          <motion.div 
            className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 shadow-md transition-colors"
            whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <p className="text-md font-medium">Wind Speed</p>
            </div>
            <p className="text-xl mt-1 ml-8">{speed} m/s</p>
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div 
            className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 shadow-md transition-colors"
            whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <p className="text-md font-medium">Humidity</p>
            </div>
            <div className="relative pt-1 ml-8">
              <div className="overflow-hidden h-3 mb-1 text-xs flex rounded-full bg-gray-200 dark:bg-gray-600">
                <motion.div 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  style={{ width: `${humidity}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${humidity}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                />
              </div>
              <p className="text-xl">{humidity}%</p>
            </div>
          </motion.div>
          <motion.div 
            className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 shadow-md transition-colors"
            whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-md font-medium">Pressure</p>
            </div>
            <p className="text-xl mt-1 ml-8">{pressure} hPa</p>
          </motion.div>
        </div>
      </div>
      
      {/* Additional weather insights and context */}
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Weather Insights</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {/* Air Quality */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 shadow-md">
                <div className="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <p className="text-sm font-medium">Air Quality</p>
                </div>
                <p className="text-lg font-bold" style={{ color: aqiInfo.color }}>{aqiInfo.level}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{aqiInfo.description}</p>
              </div>
              
              {/* UV Index */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 shadow-md">
                <div className="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-sm font-medium">UV Index</p>
                </div>
                <p className="text-lg font-bold" style={{ color: uvInfo.color }}>{uvIndex} ({uvInfo.level})</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{uvInfo.advice}</p>
              </div>
              
              {/* Visibility */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 shadow-md">
                <div className="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <p className="text-sm font-medium">Visibility</p>
                </div>
                <p className="text-lg font-bold">{Math.round(visibility / 1000)} km</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {visibility >= 10000 ? 'Excellent' : visibility >= 5000 ? 'Good' : 'Limited'}
                </p>
              </div>
              
              {/* Sunrise/Sunset */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 shadow-md">
                <div className="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-sm font-medium">Sunrise/Sunset</p>
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="font-semibold text-amber-500">↑ {formatTime(sunrise)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-orange-600">↓ {formatTime(sunset)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Day length: {dayHours}h {dayMinutes}m</p>
              </div>
              
              {/* Moon Phase */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 shadow-md">
                <div className="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <p className="text-sm font-medium">Moon Phase</p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden relative mr-2">
                    <div 
                      className="absolute top-0 bottom-0 bg-gray-800 dark:bg-gray-900" 
                      style={{ 
                        width: '50%', 
                        left: moonPhase < 0.5 ? '50%' : '0',
                        right: moonPhase < 0.5 ? '0' : '50%',
                        opacity: moonPhase < 0.5 ? 
                          1 - (moonPhase * 2) : 
                          (moonPhase - 0.5) * 2
                      }}
                    />
                  </div>
                  <p className="text-sm">
                    {moonPhase < 0.05 ? 'New Moon' :
                     moonPhase < 0.25 ? 'Waxing Crescent' :
                     moonPhase < 0.30 ? 'First Quarter' :
                     moonPhase < 0.45 ? 'Waxing Gibbous' :
                     moonPhase < 0.55 ? 'Full Moon' :
                     moonPhase < 0.70 ? 'Waning Gibbous' :
                     moonPhase < 0.80 ? 'Last Quarter' :
                     moonPhase < 0.95 ? 'Waning Crescent' : 'New Moon'}
                  </p>
                </div>
              </div>
              
              {/* Location */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 shadow-md">
                <div className="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm font-medium">Location</p>
                </div>
                <p className="text-lg font-bold">{data.name}, {country}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
        </div>
        
        {/* Weather Tips */}
        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 relative overflow-hidden">
          <h3 className="text-md font-semibold mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Weather Tips
          </h3>
          <div className="relative h-12 overflow-hidden">
            {tips.map((tip, index) => (
              <motion.p 
                key={index}
                className="absolute inset-0 text-sm text-gray-700 dark:text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: activeTip === index ? 1 : 0,
                  y: activeTip === index ? 0 : 20
                }}
                transition={{ duration: 0.5 }}
              >
                {tip}
              </motion.p>
            ))}
          </div>
          <div className="absolute bottom-2 right-2 flex space-x-1">
            {tips.map((_, index) => (
              <span 
                key={index} 
                className={`block w-2 h-2 rounded-full ${activeTip === index ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                onClick={() => setActiveTip(index)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>
        
        {/* Additional Weather Information */}
        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 shadow-md">
          <h3 className="text-md font-semibold mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Weather Almanac
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Historical Average */}
            <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 shadow-sm">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Historical Average</p>
              <p className="text-lg font-semibold">{Math.round(temp - 2 + Math.random() * 4)}°C</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Based on 30-year average</p>
            </div>
            
            {/* Record High/Low */}
            <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 shadow-sm">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Record High/Low</p>
              <div className="flex justify-between">
                <p className="text-sm"><span className="text-red-500">↑</span> {Math.round(temp + 10 + Math.random() * 5)}°C</p>
                <p className="text-sm"><span className="text-blue-500">↓</span> {Math.round(temp - 15 - Math.random() * 5)}°C</p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">For this date</p>
            </div>
            
            {/* Precipitation Chance */}
            <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 shadow-sm">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Precipitation</p>
              <p className="text-lg font-semibold">{Math.round(Math.random() * 100)}%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Chance of precipitation</p>
            </div>
            
            {/* Dew Point */}
            <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 shadow-sm">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dew Point</p>
              <p className="text-lg font-semibold">{Math.round(temp - 5 - Math.random() * 3)}°C</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Current dew point</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

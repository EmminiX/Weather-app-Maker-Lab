import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWeather } from '../hooks/useWeather';
import { useSenseHatData } from '../hooks/useSenseHatData';
import { LocationSearch } from './LocationSearch';
import { CurrentWeather } from './CurrentWeather';
import { Forecast } from './Forecast';
import { WeatherMap } from './WeatherMap';
import WeatherInsights from './WeatherInsights';
import InteractiveWeatherCharts from './InteractiveWeatherCharts';
import { adaptOpenWeatherForecast, adaptOpenWeatherCurrent } from '../utils/weatherDataAdapter';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2,
      duration: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

export function WeatherDashboard() {
  const {
    location,
    setLocation,
    currentWeather,
    forecast,
    loading: weatherLoading,
    error,
    searchLocation,
    getUserLocation
  } = useWeather();
  
  const {
    currentData,
    historicalData,
    loading: senseHatLoading,
    error: senseHatError
  } = useSenseHatData();
  
  // Combine data for the components
  const senseHatData = {
    currentData,
    historicalData
  };
  
  // Adapt OpenWeather API data to our format
  const adaptedForecast = useMemo(() => {
    return adaptOpenWeatherForecast(forecast);
  }, [forecast]);
  
  const adaptedCurrentWeather = useMemo(() => {
    return adaptOpenWeatherCurrent(currentWeather);
  }, [currentWeather]);
  
  // Use either loading state
  const loading = weatherLoading || senseHatLoading;

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 py-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header and Search Section */}
      <motion.div 
        className="mb-2"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <motion.h1 
          className="text-2xl font-bold text-center mb-2"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Weather Dashboard
        </motion.h1>

        {/* Project Context Section */}
        <motion.div
          className="max-w-4xl mx-auto mb-2 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-base mb-2 text-white/90 dark:text-white/90 backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 rounded-lg p-2">
            Welcome to my Weather Monitoring System, a College Maker-Lab project that combines real-time SenseHAT data from my home with global weather information.
          </p>
          <div className="grid grid-cols-2 gap-2 text-left bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <div>
              <h3 className="font-semibold text-base mb-1 text-white/90 dark:text-white/90">🏠 SenseHAT Hub</h3>
              <p className="text-sm text-white/80 dark:text-white/80">
                View real-time temperature, humidity, and pressure readings from the SenseHAT device.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1 text-white/90 dark:text-white/90">🌍 Weather Search</h3>
              <p className="text-sm text-white/80 dark:text-white/80">
                Compare local conditions with weather anywhere in the world!
              </p>
            </div>
          </div>
        </motion.div>

        <div className="w-full max-w-3xl mx-auto">
          <LocationSearch
            onLocationSelect={{ searchLocation, setLocation }}
            onGetLocation={getUserLocation}
            loading={loading}
          />
          {error && (
            <motion.p 
              className="mt-2 text-red-500 dark:text-red-400 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      {location && (
        <motion.div 
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            variants={itemVariants}
          >
            <CurrentWeather data={currentWeather} />
            <div className="space-y-8">
              <WeatherMap center={location} currentWeather={currentWeather} />
              <motion.div variants={itemVariants}>
                <Forecast data={forecast} />
              </motion.div>
            </div>
          </motion.div>
          
          {/* Weather Insights Section */}
          <motion.div
            variants={itemVariants}
            className="mt-12"
          >
            <WeatherInsights 
              key={`insights-${location?.lat}-${location?.lon}`}
              senseHatData={senseHatData} 
              externalData={adaptedForecast}
              currentWeather={adaptedCurrentWeather}
              loading={loading} 
            />
          </motion.div>
          
          {/* Interactive Charts Section */}
          <motion.div
            variants={itemVariants}
            className="mt-8"
          >
            <InteractiveWeatherCharts 
              key={`charts-${location?.lat}-${location?.lon}`}
              senseHatData={senseHatData} 
              externalData={adaptedForecast} 
              loading={loading} 
            />
          </motion.div>
        </motion.div>
      )}

      {!location && !loading && (
        <motion.div 
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 rounded-lg p-2 max-w-2xl mx-auto">
            <p className="text-lg text-white/90 dark:text-white/90">Search for a location or use your current location to get started</p>
            <p className="mt-2 text-sm text-white/85 dark:text-white/85">Compare weather data with the SenseHAT readings from my home</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

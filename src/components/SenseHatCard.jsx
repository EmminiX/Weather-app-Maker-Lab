import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useEffect, useState, useRef } from 'react';

const SenseHatCard = ({ senseHatData, loading }) => {
  // Store previous values for animation
  const [prevData, setPrevData] = useState(null);
  const [animateTemp, setAnimateTemp] = useState(false);
  const [animateHumidity, setAnimateHumidity] = useState(false);
  const [animatePressure, setAnimatePressure] = useState(false);
  const [timestamp, setTimestamp] = useState(new Date());
  const [animateCard, setAnimateCard] = useState(false);
  
  // Track when data changes to trigger animations
  useEffect(() => {
    if (senseHatData && prevData) {
      // Check which values changed and trigger animations
      if (senseHatData.temperature !== prevData.temperature) {
        setAnimateTemp(true);
        setAnimateCard(true);
      }
      if (senseHatData.humidity !== prevData.humidity) {
        setAnimateHumidity(true);
        setAnimateCard(true);
      }
      if (senseHatData.pressure !== prevData.pressure) {
        setAnimatePressure(true);
        setAnimateCard(true);
      }
      // Update timestamp when data changes
      setTimestamp(new Date());
    } else if (senseHatData && !prevData) {
      // First data load
      setAnimateCard(true);
      setTimestamp(new Date());
    }
    
    // Store current data as previous for next comparison
    if (senseHatData) {
      setPrevData(senseHatData);
    }
  }, [senseHatData]);
  
  // Reset animations after they complete
  useEffect(() => {
    if (animateTemp) {
      const timer = setTimeout(() => setAnimateTemp(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [animateTemp]);
  
  useEffect(() => {
    if (animateHumidity) {
      const timer = setTimeout(() => setAnimateHumidity(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [animateHumidity]);
  
  useEffect(() => {
    if (animatePressure) {
      const timer = setTimeout(() => setAnimatePressure(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [animatePressure]);
  
  useEffect(() => {
    if (animateCard) {
      const timer = setTimeout(() => setAnimateCard(false), 800);
      return () => clearTimeout(timer);
    }
  }, [animateCard]);

  // Loading state with improved animation
  if (loading) {
    return (
      <motion.div 
        className="bg-gray-900/70 backdrop-blur-md rounded-lg shadow-lg p-6 h-full"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      >
        <h3 className="text-xl font-semibold text-gray-100 mb-4">SenseHAT Readings - from Emmi HUB</h3>
        <div className="animate-pulse flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-6 mt-6">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-5/6"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  // No data state with animation
  if (!senseHatData) {
    return (
      <motion.div 
        className="bg-gray-900/70 backdrop-blur-md rounded-lg shadow-lg p-6 h-full flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-gray-500 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>No SenseHAT data available</p>
        </div>
      </motion.div>
    );
  }

  const { temperature, humidity, pressure } = senseHatData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: animateCard ? 1.03 : 1,
        boxShadow: animateCard 
          ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
          : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      className="bg-gray-900/70 backdrop-blur-md rounded-lg shadow-lg p-6 h-full relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full opacity-5 bg-blue-500 dark:bg-blue-400"></div>
      <motion.h3 
        className="text-xl font-semibold text-gray-100 dark:text-gray-200 mb-4"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        SenseHAT Readings
      </motion.h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <motion.span 
            className="text-gray-600 dark:text-gray-400 flex items-center"
            whileHover={{ x: 3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Temperature
          </motion.span>
          <AnimatePresence mode="wait">
            <motion.span 
              key={`temp-${temperature}`}
              className="text-2xl font-bold text-blue-500 dark:text-blue-400"
              initial={animateTemp ? { scale: 1.5, color: "#3182CE" } : { scale: 1 }}
              animate={{ scale: 1, color: "#3182CE" }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              {temperature.toFixed(1)}°C
            </motion.span>
          </AnimatePresence>
        </div>
        
        <div className="flex items-center justify-between">
          <motion.span 
            className="text-gray-600 dark:text-gray-400 flex items-center"
            whileHover={{ x: 3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            Humidity
          </motion.span>
          <AnimatePresence mode="wait">
            <motion.span 
              key={`humidity-${humidity}`}
              className="text-lg font-semibold text-green-500 dark:text-green-400"
              initial={animateHumidity ? { scale: 1.3, color: "#48BB78" } : { scale: 1 }}
              animate={{ scale: 1, color: "#48BB78" }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              {humidity.toFixed(1)}%
            </motion.span>
          </AnimatePresence>
        </div>
        
        <div className="flex items-center justify-between">
          <motion.span 
            className="text-gray-600 dark:text-gray-400 flex items-center"
            whileHover={{ x: 3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Pressure
          </motion.span>
          <AnimatePresence mode="wait">
            <motion.span 
              key={`pressure-${pressure}`}
              className="text-lg font-semibold text-purple-500 dark:text-purple-400"
              initial={animatePressure ? { scale: 1.3, color: "#9F7AEA" } : { scale: 1 }}
              animate={{ scale: 1, color: "#9F7AEA" }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              {pressure.toFixed(1)} hPa
            </motion.span>
          </AnimatePresence>
        </div>
        
        <motion.div 
          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Last updated: {timestamp.toLocaleTimeString()}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

SenseHatCard.propTypes = {
  senseHatData: PropTypes.shape({
    temperature: PropTypes.number.isRequired,
    humidity: PropTypes.number.isRequired,
    pressure: PropTypes.number.isRequired,
  }),
  loading: PropTypes.bool.isRequired,
};

export default SenseHatCard;
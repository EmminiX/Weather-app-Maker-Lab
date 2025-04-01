import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import WeatherIcon from './WeatherIcon';

function ForecastCard({ data, index, activeCardIndex }) {
  const [isHovered, setIsHovered] = useState(false);
  const date = new Date(data.dt * 1000);
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  const fullDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 8px 20px -5px rgba(0, 0, 0, 0.2)"
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`p-4 bg-gray-800/95 dark:bg-gray-800/95 rounded-lg shadow-md cursor-pointer flex-shrink-0 w-48 relative min-h-[280px] forecast-card ${index === activeCardIndex ? 'ring-0 shadow-lg' : ''}`}
    >
      <p className="text-lg font-semibold mb-2">{dayName}</p>
      <AnimatePresence>
        {isHovered && (
          <motion.p 
            className="text-xs text-gray-600 dark:text-gray-400 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {fullDate}
          </motion.p>
        )}
      </AnimatePresence>
      <div className="mx-auto flex justify-center items-center h-20">
        <WeatherIcon 
          iconCode={data.weather[0].icon}
          description={data.weather[0].description}
          size="lg"
          animated={true}
          type="emoji"
        />
      </div>
      <div className="text-center mt-2">
        <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">{Math.round(data.main.temp)}°C</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
          {data.weather[0].description}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3 text-sm mb-16">
        <motion.div 
          className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 transition-colors"
          whileHover={{ y: -2 }}
        >
          <p className="text-gray-600 dark:text-gray-400">Wind</p>
          <p>{data.wind.speed} m/s</p>
        </motion.div>
        <motion.div 
          className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 transition-colors"
          whileHover={{ y: -2 }}
        >
          <p className="text-gray-600 dark:text-gray-400">Humidity</p>
          <p>{data.main.humidity}%</p>
        </motion.div>
      </div>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            className="absolute left-0 right-0 bottom-0 p-4 bg-gray-800/95 dark:bg-gray-800/95 rounded-b-lg border-t border-gray-700/20 dark:border-gray-700/20 shadow-lg z-10 mt-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs text-gray-600 dark:text-gray-400">Pressure: {data.main.pressure} hPa</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Min: {Math.round(data.main.temp_min)}°C / Max: {Math.round(data.main.temp_max)}°C
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Forecast({ data }) {
  // Always declare all hooks at the top level
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  
  // Set up auto-scrolling with initial delay
  useEffect(() => {
    // Skip effect if no data
    if (!data || data.length === 0) return;
    
    // Add initial delay before starting auto-scrolling
    const initialDelay = setTimeout(() => {
      const interval = setInterval(() => {
        setActiveCardIndex(prev => (prev + 1) % data.length);
      }, 3000); // 3 seconds delay between cards
      
      // Store interval ID in ref for cleanup
      return () => clearInterval(interval);
    }, 5000); // 5 seconds initial delay before starting auto-scroll
    
    return () => clearTimeout(initialDelay);
  }, [data]);
  
  // Set up scroll to active card with a gentler approach
  useEffect(() => {
    // Skip effect if no data
    if (!data || data.length === 0) return;
    
    // Only scroll after a short delay and if user hasn't scrolled manually
    let userHasScrolled = false;
    
    // Detect user scroll
    const handleScroll = () => {
      userHasScrolled = true;
      // Reset after some time to allow auto-scrolling to resume
      setTimeout(() => { userHasScrolled = false; }, 5000);
    };
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Scroll to card only if user hasn't manually scrolled
    const scrollTimeout = setTimeout(() => {
      if (!userHasScrolled) {
        const container = document.getElementById('forecast-container');
        if (container) {
          const cards = container.querySelectorAll('.forecast-card');
          if (cards[activeCardIndex]) {
            // Use scrollLeft instead of scrollIntoView to avoid page jumping
            const card = cards[activeCardIndex];
            const containerRect = container.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            const scrollLeft = cardRect.left - containerRect.left - (containerRect.width / 2) + (cardRect.width / 2);
            
            container.scrollTo({
              left: container.scrollLeft + scrollLeft,
              behavior: 'smooth'
            });
          }
        }
      }
    }, 300); // Short delay before scrolling
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [activeCardIndex, data]);

  // Early return after hooks declaration
  if (!data || data.length === 0) return null;

  return (
    <motion.div 
      className="mt-0 p-6 bg-black/30 backdrop-blur-md rounded-xl shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">5-Day Forecast</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Auto-scrolling through all days</p>
      <div 
        id="forecast-container" 
        className="flex flex-nowrap overflow-x-auto pb-4 space-x-6 scrollbar-hide"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollPaddingLeft: '1rem',
          scrollPaddingRight: '1rem'
        }}
      >
        {data.map((day, index) => (
          <ForecastCard
            key={day.dt}
            data={day}
            index={index}
            activeCardIndex={activeCardIndex}
          />
        ))}
      </div>
    </motion.div>
  );
}

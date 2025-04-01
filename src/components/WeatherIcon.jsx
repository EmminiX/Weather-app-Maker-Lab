import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { getWeatherIcon, getWeatherSvgIcon } from '../utils/weatherIcons';

/**
 * WeatherIcon component that displays a weather icon based on the weather condition
 * @param {Object} props - Component props
 * @param {string} props.iconCode - OpenWeather icon code (e.g., '01d', '02n')
 * @param {string} props.description - Weather description (fallback if iconCode not provided)
 * @param {string} props.size - Icon size (sm, md, lg, xl)
 * @param {boolean} props.animated - Whether to animate the icon
 * @param {string} props.type - Icon type (emoji, svg)
 * @returns {JSX.Element} - Weather icon component
 */
const WeatherIcon = ({ 
  iconCode, 
  description = '', 
  size = 'md', 
  animated = true,
  type = 'emoji'
}) => {
  // Determine icon size class
  const sizeClass = {
    sm: 'text-2xl w-8 h-8',
    md: 'text-4xl w-12 h-12',
    lg: 'text-5xl w-16 h-16',
    xl: 'text-6xl w-20 h-20'
  }[size] || 'text-4xl w-12 h-12';
  
  // Animation variants
  const variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      y: animated ? [0, -3, 0] : 0,
      transition: {
        y: {
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 2,
          ease: 'easeInOut'
        },
        scale: { duration: 0.3 }
      }
    },
    hover: { 
      scale: 1.1,
      transition: { duration: 0.2 }
    }
  };
  
  // Render emoji icon
  if (type === 'emoji') {
    const icon = getWeatherIcon(iconCode, description);
    
    return (
      <motion.div
        className={`inline-flex items-center justify-center ${sizeClass}`}
        initial="initial"
        animate="animate"
        whileHover="hover"
        variants={variants}
      >
        {icon}
      </motion.div>
    );
  }
  
  // Render SVG icon
  if (type === 'svg') {
    const svgIcon = getWeatherSvgIcon(iconCode, description);
    
    return (
      <motion.div
        className={`inline-flex items-center justify-center ${sizeClass}`}
        initial="initial"
        animate="animate"
        whileHover="hover"
        variants={variants}
        dangerouslySetInnerHTML={{ __html: svgIcon }}
      />
    );
  }
  
  // Fallback to emoji if type is not recognized
  const icon = getWeatherIcon(iconCode, description);
  
  return (
    <motion.div
      className={`inline-flex items-center justify-center ${sizeClass}`}
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={variants}
    >
      {icon}
    </motion.div>
  );
};

WeatherIcon.propTypes = {
  iconCode: PropTypes.string,
  description: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  animated: PropTypes.bool,
  type: PropTypes.oneOf(['emoji', 'svg'])
};

export default WeatherIcon;

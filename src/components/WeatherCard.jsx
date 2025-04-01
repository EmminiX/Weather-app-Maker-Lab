import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const WeatherCard = ({ weatherData, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="text-gray-500">No weather data available</div>
    );
  }

  const {
    main: { temp, feels_like, humidity },
    weather: [{ description, icon }],
    wind: { speed }
  } = weatherData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full opacity-5 bg-blue-500 dark:bg-blue-400"></div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Current Weather</h3>
        <img
          src={`http://openweathermap.org/img/wn/${icon}@2x.png`}
          alt={description}
          className="w-16 h-16"
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Temperature</span>
          <span className="text-2xl font-bold text-blue-500 dark:text-blue-400">{Math.round(temp)}°C</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Feels Like</span>
          <span className="text-gray-800 dark:text-gray-300">{Math.round(feels_like)}°C</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Humidity</span>
          <span className="text-gray-800 dark:text-gray-300">{humidity}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Wind Speed</span>
          <span className="text-gray-800 dark:text-gray-300">{Math.round(speed * 3.6)} km/h</span>
        </div>
        
        <div className="mt-4 text-center">
          <span className="text-gray-600 dark:text-gray-400 capitalize">{description}</span>
        </div>
      </div>
    </motion.div>
  );
};

WeatherCard.propTypes = {
  weatherData: PropTypes.shape({
    main: PropTypes.shape({
      temp: PropTypes.number.isRequired,
      feels_like: PropTypes.number.isRequired,
      humidity: PropTypes.number.isRequired,
    }).isRequired,
    weather: PropTypes.arrayOf(
      PropTypes.shape({
        description: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
      })
    ).isRequired,
    wind: PropTypes.shape({
      speed: PropTypes.number.isRequired,
    }).isRequired,
  }),
  loading: PropTypes.bool.isRequired,
};

export default WeatherCard;
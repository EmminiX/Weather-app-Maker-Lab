import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  analyzeTempTrend, 
  analyzePressure, 
  analyzeHumidity, 
  analyzeCorrelation,
  detectAnomalies 
} from '../utils/weatherAnalytics';
import { generateWeatherSummary, generateWeatherWarnings, getWindDescription } from '../utils/weatherDataAdapter';

// Helper component for displaying tooltips
const InfoTooltip = ({ children, tip }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <span className="relative inline-block">
      <span 
        className="cursor-help border-b border-dotted border-gray-400 inline-flex items-center"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
      {isVisible && (
        <div className="absolute z-10 w-64 p-2 mt-2 text-sm rounded-md shadow-lg bg-gray-800 text-gray-300 border border-gray-700 -left-4 bottom-full">
          {tip}
          <div className="absolute w-3 h-3 rotate-45 bg-gray-800 border-r border-b border-gray-700 -bottom-1.5 left-5"></div>
        </div>
      )}
    </span>
  );
};

const WeatherInsights = ({ senseHatData, externalData, currentWeather, loading }) => {
  const [insights, setInsights] = useState([]);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  
  // Auto-scroll through insights
  useEffect(() => {
    if (!insights || insights.length === 0 || !autoScrollEnabled || userInteracted) {
      return;
    }
    
    // Set up auto-scrolling with initial delay
    const initialDelay = setTimeout(() => {
      const interval = setInterval(() => {
        setSelectedInsight(prevSelected => {
          // Find current index
          const currentIndex = insights.findIndex(insight => insight.id === prevSelected);
          // Move to next insight, or back to first if at the end
          const nextIndex = (currentIndex + 1) % insights.length;
          return insights[nextIndex].id;
        });
      }, 7000); // 3 seconds between insights
      
      return () => clearInterval(interval);
    }, 3500); // 2 seconds initial delay
    
    // Reset user interaction after some time
    const interactionTimeout = setTimeout(() => {
      if (userInteracted) {
        setUserInteracted(false);
      }
    }, 10000); // Reset after 10 seconds of no interaction
    
    return () => {
      clearTimeout(initialDelay);
      clearTimeout(interactionTimeout);
    };
  }, [insights, autoScrollEnabled, userInteracted]);
  
  // Generate insights when data changes
  useEffect(() => {
    if (!senseHatData || !senseHatData.historicalData || loading) {
      return;
    }
    
    const historicalData = senseHatData.historicalData;
    const currentData = senseHatData.currentData;
    
    // Generate insights
    const newInsights = [];
    
      // Weather conditions insight (if current weather data is available)
      if (currentWeather) {
        const weatherSummary = generateWeatherSummary(currentWeather);
        const weatherWarnings = generateWeatherWarnings(currentWeather);
        
        // Add health impact information
        let healthImpact = "";
        if (currentWeather.weatherMain) {
          const weatherType = currentWeather.weatherMain.toLowerCase();
          if (weatherType.includes('rain') || weatherType.includes('drizzle')) {
            healthImpact = "\n\nHealth Impact: Rainy conditions may increase joint pain for those with arthritis. Humidity can also affect those with respiratory conditions.";
          } else if (weatherType.includes('clear')) {
            healthImpact = "\n\nHealth Impact: Clear skies allow more UV radiation. Remember sun protection if spending time outdoors.";
          } else if (weatherType.includes('cloud')) {
            healthImpact = "\n\nHealth Impact: Cloudy conditions provide natural UV protection but can impact mood in sensitive individuals.";
          } else if (weatherType.includes('snow')) {
            healthImpact = "\n\nHealth Impact: Cold snowy conditions increase risk of hypothermia and frostbite. Bright snow can cause snow blindness without eye protection.";
          } else if (weatherType.includes('thunder')) {
            healthImpact = "\n\nHealth Impact: Thunderstorms can trigger asthma attacks and increase anxiety in sensitive individuals. Seek shelter indoors.";
          } else if (weatherType.includes('fog') || weatherType.includes('mist')) {
            healthImpact = "\n\nHealth Impact: Foggy conditions can trap pollution and affect those with respiratory conditions. Visibility is also reduced.";
          }
        }
        
        // Add weather activity recommendations
        let activityRecommendation = "\n\nRecommended Activities: ";
        if (currentWeather.weatherMain) {
          const weatherType = currentWeather.weatherMain.toLowerCase();
          if (weatherType.includes('rain') || weatherType.includes('thunder') || weatherType.includes('drizzle')) {
            activityRecommendation += "Indoor activities recommended. Museums, reading, or cooking are good options.";
          } else if (weatherType.includes('clear') || weatherType.includes('sun')) {
            activityRecommendation += "Great day for outdoor activities! Hiking, cycling, or beach visits would be excellent.";
          } else if (weatherType.includes('cloud')) {
            activityRecommendation += "Good conditions for outdoor activities with reduced sun exposure. Photography often produces great results in this light.";
          } else if (weatherType.includes('snow')) {
            activityRecommendation += "If properly dressed, snow activities like sledding or building snowmen. Otherwise, enjoy the view from indoors with a hot drink.";
          } else if (weatherType.includes('fog') || weatherType.includes('mist')) {
            activityRecommendation += "Limited visibility outdoors. Indoor activities or visiting scenic overlooks for atmospheric photography (if driving safely possible).";
          } else {
            activityRecommendation += "Moderate outdoor activities with appropriate clothing for the conditions.";
          }
        }
                
        let warningsDetail = '';
        if (weatherWarnings.length > 0) {
          warningsDetail = '\n\nWeather Warnings:\n' + 
            weatherWarnings.map(w => `• ${w.description} (${w.severity} severity)`).join('\n');
        }
        
        newInsights.push({
          id: 'weather-conditions',
          title: 'Current Conditions',
          icon: getWeatherIcon(currentWeather.weatherMain, currentWeather.icon),
          summary: currentWeather.description || 'Current Weather Conditions',
          detail: `${weatherSummary}${warningsDetail}${healthImpact}${activityRecommendation}`,
          confidence: weatherWarnings.length > 0 ? '90' : '95',
          category: 'conditions'
        });
      }
    
    try {
      // Temperature trend insight
      const tempTrend = analyzeTempTrend(historicalData);
      if (tempTrend && tempTrend.trend) {
        // Get clothing recommendations based on temperature
        const clothingRecommendation = getClothingRecommendation(currentData?.temperature);
        
        // Get health impact based on temperature and trend
        const healthImpact = getTemperatureHealthImpact(currentData?.temperature, tempTrend.trend);
        
        newInsights.push({
          id: 'temp-trend',
          title: 'Temperature Trend',
          icon: getTrendIcon(tempTrend.trend),
          summary: `Temperature is ${tempTrend.trend} ${tempTrend.magnitude > 0 ? `by ${tempTrend.magnitude}%` : ''}`,
          detail: `${getTemperatureTrendDetail(tempTrend, currentData)}\n\n${clothingRecommendation}\n\n${healthImpact}`,
          confidence: tempTrend.confidence || '0',
          category: 'temperature'
        });
      }
      
      // Pressure insight
      const pressureAnalysis = analyzePressure(historicalData);
      if (pressureAnalysis && pressureAnalysis.trend && pressureAnalysis.currentPressure !== undefined) {
        // Add explanation about what pressure values mean
        let pressureExplanation = getPressureExplanation(pressureAnalysis.currentPressure);
        
        // Add pressure health impacts
        let pressureHealthImpact = getPressureHealthImpact(pressureAnalysis.trend, pressureAnalysis.currentPressure);
        
        newInsights.push({
          id: 'pressure-pattern',
          title: 'Pressure Pattern',
          icon: getPressureIcon(pressureAnalysis.trend),
          summary: pressureAnalysis.prediction || 'Unknown pressure pattern',
          detail: `Barometric pressure is ${pressureAnalysis.trend} at ${pressureAnalysis.currentPressure?.toFixed(1) || '0'} hPa, suggesting ${pressureAnalysis.prediction || 'unknown conditions'}.\n\n${pressureExplanation}\n\n${pressureHealthImpact}`,
          confidence: pressureAnalysis.confidence || '0',
          category: 'pressure'
        });
      }
      
      // Humidity insight
      const humidityAnalysis = analyzeHumidity(historicalData);
      if (humidityAnalysis && humidityAnalysis.pattern && humidityAnalysis.currentHumidity !== undefined) {
        // Add explanation about what humidity values mean
        let humidityExplanation = getHumidityExplanation(humidityAnalysis.currentHumidity);
        
        // Add humidity health impacts
        let humidityHealthImpact = getHumidityHealthImpact(humidityAnalysis.currentHumidity);
        
        // Add home recommendations based on humidity
        let humidityHomeRecommendation = getHumidityHomeRecommendation(humidityAnalysis.currentHumidity);
        
        newInsights.push({
          id: 'humidity-pattern',
          title: 'Humidity Pattern',
          icon: getHumidityIcon(humidityAnalysis.comfort),
          summary: `${humidityAnalysis.pattern || 'Unknown'}, ${humidityAnalysis.comfort || 'unknown'} conditions`,
          detail: `Humidity is currently at ${humidityAnalysis.currentHumidity?.toFixed(1) || '0'}% with ${(humidityAnalysis.pattern || 'stable').toLowerCase()}, creating ${humidityAnalysis.comfort || 'unknown'} conditions.\n\n${humidityExplanation}\n\n${humidityHealthImpact}\n\n${humidityHomeRecommendation}`,
          confidence: humidityAnalysis.confidence || '0',
          category: 'humidity'
        });
      }
    } catch (error) {
      console.error('Error generating weather insights:', error);
    }
    
    // Correlation insight (if external data available)
    if (externalData && externalData.length > 0) {
      const correlation = analyzeCorrelation(historicalData, externalData);
      newInsights.push({
        id: 'sensor-correlation',
        title: 'Sensor Correlation',
        icon: '📊',
        summary: `SenseHat vs External Data Analysis`,
        detail: `Temperature: ${correlation.temperature.description} (${correlation.temperature.correlation} correlation, ${correlation.temperature.difference}°C avg difference).
                Humidity: ${correlation.humidity.description} (${correlation.humidity.correlation} correlation, ${correlation.humidity.difference}% avg difference).`,
        confidence: Math.max(correlation.temperature.correlation * 100, correlation.humidity.correlation * 100).toFixed(0),
        category: 'correlation'
      });
    }
    
    // Anomalies
    const anomalies = detectAnomalies(historicalData);
    if (anomalies.length > 0) {
      newInsights.push({
        id: 'anomalies',
        title: 'Weather Anomalies',
        icon: '⚠️',
        summary: `${anomalies.length} weather ${anomalies.length === 1 ? 'anomaly' : 'anomalies'} detected`,
        detail: anomalies.map(a => `${a.description} (${a.confidence}% confidence)`).join('\n'),
        confidence: anomalies[0].confidence,
        category: 'anomaly'
      });
    }
    
    setInsights(newInsights);
    
    // Set default selected insight
    if (!selectedInsight && newInsights.length > 0) {
      setSelectedInsight(newInsights[0].id);
    }
  }, [senseHatData, externalData, loading]);
  
  // Loading state
  if (loading) {
    return (
      <motion.div 
        className="bg-gray-900/70 backdrop-blur-md rounded-lg shadow-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Weather Insights</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200/20 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200/20 rounded"></div>
          <div className="h-20 bg-gray-200/20 rounded"></div>
        </div>
      </motion.div>
    );
  }
  
  // No data state
  if (!insights || insights.length === 0) {
    return (
      <motion.div 
        className="bg-gray-900/70 backdrop-blur-md rounded-lg shadow-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Weather Insights</h3>
        <div className="text-gray-400 text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Not enough data to generate insights</p>
        </div>
      </motion.div>
    );
  }
  
  const selectedInsightData = insights.find(i => i.id === selectedInsight);
  
  return (
    <motion.div 
      className="bg-gray-900/70 backdrop-blur-md rounded-lg shadow-lg p-6 overflow-hidden weather-insights"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3 
        className="text-xl font-semibold text-soft-white mb-6 tracking-wide text-shadow-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Weather Insights
      </motion.h3>
      
      {/* Insight tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {insights.map((insight, index) => (
          <motion.button
            key={insight.id}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
              ${selectedInsight === insight.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`}
            onClick={() => {
              setSelectedInsight(insight.id);
              setUserInteracted(true);
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + (index * 0.1) }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{insight.icon}</span>
            <span>{insight.title}</span>
          </motion.button>
        ))}
      </div>
      
      {/* Selected insight detail */}
      <AnimatePresence mode="wait">
        {selectedInsightData && (
          <motion.div
            key={selectedInsightData.id}
            className="bg-gray-800/50 rounded-lg p-5 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Background decoration */}
            <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full opacity-5 bg-blue-500"></div>
            
            <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-soft-white text-shadow-sm">{selectedInsightData.summary}</h4>
              <div className="mt-1 text-sm text-cool-white">
                <InfoTooltip tip="Confidence indicates how reliable this insight is based on available data. Higher percentages mean more reliable predictions.">
                  Confidence: {selectedInsightData.confidence}%
                </InfoTooltip>
              </div>
            </div>
              <div className="text-3xl">{selectedInsightData.icon}</div>
            </div>
            
            <motion.div 
              className="mt-4 text-cool-white leading-relaxed whitespace-pre-line text-shadow-xs text-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {selectedInsightData.detail}
            </motion.div>
            
            {/* Confidence meter */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-warm-white mb-1">
                <span>Confidence</span>
                <span>{selectedInsightData.confidence}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedInsightData.confidence}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Helper functions for icons and text

/**
 * Get clothing recommendations based on temperature
 */
const getClothingRecommendation = (temperature) => {
  if (temperature === undefined || temperature === null) return '';
  
  if (temperature >= 30) {
    return 'Clothing Recommendation: Light, breathable clothing such as shorts, t-shirts, and sun hats. Sun protection is essential.';
  } else if (temperature >= 20) {
    return 'Clothing Recommendation: Light clothing such as short sleeves and light pants or shorts. A light jacket might be needed in the evening.';
  } else if (temperature >= 10) {
    return 'Clothing Recommendation: Medium layers such as long-sleeved shirts, light sweaters, and pants. A jacket is recommended.';
  } else if (temperature >= 0) {
    return 'Clothing Recommendation: Warm layers including sweaters, jackets, hats, and gloves. Consider thermal underwear for extended outdoor activities.';
  } else {
    return 'Clothing Recommendation: Heavy winter clothing with multiple layers, insulated coat, hat, gloves, and warm footwear. Minimize exposed skin.';
  }
};

/**
 * Get temperature-related health impact information
 */
const getTemperatureHealthImpact = (temperature, trend) => {
  if (temperature === undefined || temperature === null) return '';
  
  let impact = 'Health Impact: ';
  
  if (temperature > 35) {
    impact += 'Extreme heat can cause heat exhaustion or heatstroke. Stay hydrated, seek shade, and limit strenuous activities.';
    if (trend === 'rising') {
      impact += ' With rising temperatures, these risks increase significantly.';
    }
  } else if (temperature > 30) {
    impact += 'High temperatures can cause dehydration and heat stress. Drink plenty of water and take breaks in shade.';
    if (trend === 'rising') {
      impact += ' Monitor for worsening conditions as temperature continues to rise.';
    }
  } else if (temperature > 20) {
    impact += 'Comfortable temperatures for most people. Stay hydrated during outdoor activities.';
  } else if (temperature > 10) {
    impact += 'Mild temperatures. Light jackets may be needed, especially with wind or in the evening.';
    if (trend === 'falling') {
      impact += ' Prepare for cooler conditions as temperature continues to fall.';
    }
  } else if (temperature > 0) {
    impact += 'Cool temperatures can increase risk of hypothermia with prolonged exposure, especially if wet or windy.';
    if (trend === 'falling') {
      impact += ' Take additional precautions as temperatures drop further.';
    }
  } else {
    impact += 'Cold temperatures present risk of frostbite and hypothermia. Limit time outdoors and keep extremities covered.';
    if (trend === 'falling') {
      impact += ' Extreme danger with continued temperature drop. Avoid outdoor activities if possible.';
    }
  }
  
  return impact;
};

/**
 * Get detailed pressure explanation
 */
const getPressureExplanation = (pressure) => {
  if (pressure === undefined || pressure === null) return '';
  
  let explanation = 'What This Means: ';
  
  if (pressure > 1030) {
    explanation += 'Very high pressure typically brings settled, fair weather and clear skies. In winter, it can mean cold, frosty conditions.';
  } else if (pressure > 1020) {
    explanation += 'High pressure generally indicates stable, fair weather with light winds. Excellent conditions for outdoor activities.';
  } else if (pressure > 1010) {
    explanation += 'Normal pressure indicates relatively stable conditions, though some clouds may be present.';
  } else if (pressure > 1000) {
    explanation += 'Slightly low pressure may bring some clouds and possibility of light precipitation, especially if falling.';
  } else if (pressure > 990) {
    explanation += 'Low pressure often brings cloudy, wet, and windy conditions. Weather systems are moving through the area.';
  } else {
    explanation += 'Very low pressure indicates a strong storm system with potential for heavy precipitation and strong winds.';
  }
  
  return explanation;
};

/**
 * Get pressure-related health impact information
 */
const getPressureHealthImpact = (trend, pressure) => {
  if (pressure === undefined || pressure === null) return '';
  
  let impact = 'Health Impact: ';
  
  if (trend === 'falling') {
    impact += 'Falling barometric pressure can trigger headaches or migraines in sensitive individuals. Joint pain may increase for those with arthritis or previous injuries.';
    
    if (pressure < 1000) {
      impact += ' These effects may be more pronounced with the current low pressure.';
    }
  } else if (trend === 'rising') {
    impact += 'Rising pressure often brings relief from pressure-related pain. However, sinus issues may increase for some people.';
  } else {
    impact += 'Stable barometric pressure typically causes fewer weather-related health complaints.';
  }
  
  return impact;
};

/**
 * Get detailed humidity explanation
 */
const getHumidityExplanation = (humidity) => {
  if (humidity === undefined || humidity === null) return '';
  
  let explanation = 'What This Means: ';
  
  if (humidity > 85) {
    explanation += 'Very high humidity makes it difficult for sweat to evaporate, making it feel hotter than the actual temperature and potentially uncomfortable.';
  } else if (humidity > 65) {
    explanation += 'High humidity can make warm temperatures feel hotter. Evaporative cooling (sweating) is less effective in these conditions.';
  } else if (humidity > 45) {
    explanation += 'Moderate humidity levels are generally comfortable for most people and beneficial for plants and normal indoor activities.';
  } else if (humidity > 30) {
    explanation += 'Low-moderate humidity is comfortable for most people. Slightly dry conditions can make hot temperatures feel more bearable.';
  } else if (humidity > 20) {
    explanation += 'Low humidity can cause dryness of skin, eyes, and respiratory system. Static electricity may be more noticeable.';
  } else {
    explanation += 'Very low humidity can cause significant drying of mucous membranes, skin cracking, and respiratory discomfort. Increased risk of static electricity.';
  }
  
  return explanation;
};

/**
 * Get humidity-related health impact information
 */
const getHumidityHealthImpact = (humidity) => {
  if (humidity === undefined || humidity === null) return '';
  
  let impact = 'Health Impact: ';
  
  if (humidity > 80) {
    impact += 'High humidity increases risk of heat-related illnesses as body cooling is impaired. Mold growth is also more likely, which can trigger allergies and asthma.';
  } else if (humidity > 60) {
    impact += 'Elevated humidity may worsen symptoms for those with respiratory conditions and can promote dust mite and mold growth in homes.';
  } else if (humidity > 40) {
    impact += 'Optimal humidity range for respiratory health and comfort. Few negative health impacts in this range.';
  } else if (humidity > 25) {
    impact += 'Slightly dry conditions may cause minor skin, eye, or throat irritation in sensitive individuals.';
  } else {
    impact += 'Very dry air can cause respiratory irritation, dry skin, and eye discomfort. May worsen asthma, eczema, and sinus problems.';
  }
  
  return impact;
};

/**
 * Get humidity-related home recommendations
 */
const getHumidityHomeRecommendation = (humidity) => {
  if (humidity === undefined || humidity === null) return '';
  
  let recommendation = 'Home Advice: ';
  
  if (humidity > 70) {
    recommendation += 'Use dehumidifiers to reduce indoor moisture. Ensure good ventilation, especially in bathrooms and kitchens. Check for and address any water leaks.';
  } else if (humidity > 60) {
    recommendation += 'Consider using a dehumidifier in damp areas. Run exhaust fans during cooking and showering to remove excess moisture.';
  } else if (humidity > 40) {
    recommendation += 'Current humidity levels are ideal for indoor comfort. No specific humidity adjustment needed.';
  } else if (humidity > 30) {
    recommendation += 'Humidity is slightly low. Consider light humidification if experiencing dry skin or respiratory discomfort.';
  } else {
    recommendation += 'Use a humidifier to increase indoor moisture levels. Keep houseplants to naturally increase humidity. Use lip balm and moisturizers to protect skin.';
  }
  
  return recommendation;
};
const getTrendIcon = (trend) => {
  switch (trend) {
    case 'rising': return '📈';
    case 'falling': return '📉';
    default: return '📊';
  }
};

const getPressureIcon = (trend) => {
  switch (trend) {
    case 'rising': return '☀️';
    case 'falling': return '🌧️';
    default: return '🌤️';
  }
};

const getHumidityIcon = (comfort) => {
  switch (comfort) {
    case 'dry': return '🏜️';
    case 'humid': return '💧';
    default: return '🌡️';
  }
};

const getWeatherIcon = (weatherMain, iconCode) => {
  // Use the icon code from OpenWeather if available
  if (iconCode) {
    // Map OpenWeather icon codes to emoji
    const iconMap = {
      '01d': '☀️', // clear sky day
      '01n': '🌙', // clear sky night
      '02d': '⛅', // few clouds day
      '02n': '☁️', // few clouds night
      '03d': '☁️', // scattered clouds
      '03n': '☁️',
      '04d': '☁️', // broken clouds
      '04n': '☁️',
      '09d': '🌧️', // shower rain
      '09n': '🌧️',
      '10d': '🌦️', // rain day
      '10n': '🌧️', // rain night
      '11d': '⛈️', // thunderstorm
      '11n': '⛈️',
      '13d': '❄️', // snow
      '13n': '❄️',
      '50d': '🌫️', // mist
      '50n': '🌫️'
    };
    
    return iconMap[iconCode] || '🌤️';
  }
  
  // Fallback to weather main description
  if (weatherMain) {
    switch (weatherMain.toLowerCase()) {
      case 'clear': return '☀️';
      case 'clouds': return '☁️';
      case 'rain': return '🌧️';
      case 'drizzle': return '🌦️';
      case 'thunderstorm': return '⛈️';
      case 'snow': return '❄️';
      case 'mist': 
      case 'smoke': 
      case 'haze': 
      case 'dust': 
      case 'fog': 
      case 'sand': 
      case 'ash': 
      case 'squall': 
      case 'tornado': return '🌫️';
      default: return '🌤️';
    }
  }
  
  return '🌤️'; // Default icon
};

const getTemperatureTrendDetail = (trend, currentData) => {
  if (!currentData || !currentData.temperature) return 'Temperature data unavailable';
  
  const { temperature } = currentData;
  
  let trendDetail = '';
  switch (trend.trend) {
    case 'rising':
      trendDetail = `Temperature is rising at a rate of ${Math.abs((trend.slope || 0) * 60).toFixed(1)}°C per hour. Current temperature is ${temperature.toFixed(1)}°C.`;
      
      // Add forecast based on rise rate
      const riseRate = Math.abs((trend.slope || 0) * 60);
      if (riseRate > 2) {
        trendDetail += ` At this significant rate of increase, expect notably warmer conditions within the next few hours.`;
      } else if (riseRate > 1) {
        trendDetail += ` This moderate warming trend will continue, potentially reaching ${(temperature + 3).toFixed(1)}°C in the next 3 hours if the trend continues.`;
      } else {
        trendDetail += ` This gentle warming trend will likely continue through the day.`;
      }
      break;
      
    case 'falling':
      trendDetail = `Temperature is falling at a rate of ${Math.abs((trend.slope || 0) * 60).toFixed(1)}°C per hour. Current temperature is ${temperature.toFixed(1)}°C.`;
      
      // Add forecast based on fall rate
      const fallRate = Math.abs((trend.slope || 0) * 60);
      if (fallRate > 2) {
        trendDetail += ` This rapid cooling trend suggests a significant weather change may be occurring. Prepare for much cooler conditions soon.`;
      } else if (fallRate > 1) {
        trendDetail += ` This steady cooling will continue, potentially reaching ${(temperature - 3).toFixed(1)}°C in the next 3 hours if the trend continues.`;
      } else {
        trendDetail += ` This mild cooling trend is likely to continue gradually.`;
      }
      break;
      
    default:
      trendDetail = `Temperature is stable around ${temperature.toFixed(1)}°C with minimal fluctuations.`;
      trendDetail += ` These steady conditions are likely to persist in the near term.`;
  }
  
  // Add comfort level information
  if (temperature > 30) {
    trendDetail += ` Current temperatures are in the hot range, which may cause discomfort for some people.`;
  } else if (temperature > 23 && temperature <= 30) {
    trendDetail += ` Current temperatures are warm but generally comfortable for most people.`;
  } else if (temperature >= 18 && temperature <= 23) {
    trendDetail += ` Current temperatures are in the ideal comfort range for most activities.`;
  } else if (temperature >= 10 && temperature < 18) {
    trendDetail += ` Current temperatures are cool; a light jacket may be needed for comfort.`;
  } else if (temperature < 10) {
    trendDetail += ` Current temperatures are cold; proper warm clothing is recommended.`;
  }
  
  return trendDetail;
};

// Add custom CSS for text shadows to enhance readability on dark backgrounds
import './weatherInsightsShadows.css';

WeatherInsights.propTypes = {
  senseHatData: PropTypes.shape({
    currentData: PropTypes.object,
    historicalData: PropTypes.array
  }),
  externalData: PropTypes.array,
  currentWeather: PropTypes.object,
  loading: PropTypes.bool.isRequired
};

export default WeatherInsights;

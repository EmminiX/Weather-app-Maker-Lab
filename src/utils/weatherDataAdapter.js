/**
 * Weather Data Adapter
 * Adapts data from different sources to a consistent format for our components
 */

/**
 * Adapts OpenWeather API forecast data to match our internal format
 * @param {Array} forecastData - Array of forecast data from OpenWeather API
 * @returns {Array} - Adapted data with consistent properties
 */
export const adaptOpenWeatherForecast = (forecastData) => {
  if (!forecastData || !Array.isArray(forecastData) || forecastData.length === 0) {
    return [];
  }

  return forecastData.map(item => {
    // OpenWeather API structure:
    // main: { temp, feels_like, temp_min, temp_max, pressure, humidity }
    // weather: [{ id, main, description, icon }]
    // wind: { speed, deg }
    // dt: timestamp in seconds
    return {
      temperature: item.main?.temp || null,
      feelsLike: item.main?.feels_like || null,
      tempMin: item.main?.temp_min || null,
      tempMax: item.main?.temp_max || null,
      humidity: item.main?.humidity || null,
      pressure: item.main?.pressure || null,
      windSpeed: item.wind?.speed || null,
      windDirection: item.wind?.deg || null,
      weatherId: item.weather?.[0]?.id || null,
      weatherMain: item.weather?.[0]?.main || '',
      description: item.weather?.[0]?.description || '',
      icon: item.weather?.[0]?.icon || '',
      timestamp: item.dt ? new Date(item.dt * 1000).toISOString() : new Date().toISOString(),
      location: item.name || '',
      country: item.sys?.country || '',
      visibility: item.visibility || null,
      rain: item.rain?.['3h'] || null,
      snow: item.snow?.['3h'] || null,
      clouds: item.clouds?.all || null
    };
  });
};

/**
 * Adapts current weather data from OpenWeather API
 * @param {Object} weatherData - Current weather data from OpenWeather API
 * @returns {Object} - Adapted data with consistent properties
 */
export const adaptOpenWeatherCurrent = (weatherData) => {
  if (!weatherData) {
    return null;
  }

  return {
    temperature: weatherData.main?.temp || null,
    feelsLike: weatherData.main?.feels_like || null,
    tempMin: weatherData.main?.temp_min || null,
    tempMax: weatherData.main?.temp_max || null,
    humidity: weatherData.main?.humidity || null,
    pressure: weatherData.main?.pressure || null,
    windSpeed: weatherData.wind?.speed || null,
    windDirection: weatherData.wind?.deg || null,
    weatherId: weatherData.weather?.[0]?.id || null,
    weatherMain: weatherData.weather?.[0]?.main || '',
    description: weatherData.weather?.[0]?.description || '',
    icon: weatherData.weather?.[0]?.icon || '',
    timestamp: weatherData.dt ? new Date(weatherData.dt * 1000).toISOString() : new Date().toISOString(),
    location: weatherData.name || '',
    country: weatherData.sys?.country || '',
    sunrise: weatherData.sys?.sunrise ? new Date(weatherData.sys.sunrise * 1000).toISOString() : null,
    sunset: weatherData.sys?.sunset ? new Date(weatherData.sys.sunset * 1000).toISOString() : null,
    visibility: weatherData.visibility || null,
    rain: weatherData.rain?.['1h'] || null,
    snow: weatherData.snow?.['1h'] || null,
    clouds: weatherData.clouds?.all || null
  };
};

/**
 * Generates a human-readable weather summary from weather data
 * @param {Object} weatherData - Adapted weather data
 * @returns {String} - Human-readable weather summary
 */
export const generateWeatherSummary = (weatherData) => {
  if (!weatherData) return 'Weather data unavailable';
  
  const { weatherMain, description, temperature, feelsLike, windSpeed } = weatherData;
  
  let summary = `Currently ${description || weatherMain || 'unknown conditions'}`;
  
  if (temperature !== null) {
    summary += ` with a temperature of ${temperature.toFixed(1)}°C`;
    
    if (feelsLike !== null && Math.abs(feelsLike - temperature) > 2) {
      summary += ` (feels like ${feelsLike.toFixed(1)}°C)`;
    }
  }
  
  if (windSpeed !== null && windSpeed > 0) {
    const windDescription = getWindDescription(windSpeed);
    summary += `. ${windDescription} winds at ${windSpeed.toFixed(1)} m/s`;
  }
  
  return summary;
};

/**
 * Generates weather warnings based on weather conditions
 * @param {Object} weatherData - Adapted weather data
 * @returns {Array} - Array of warning objects with description and severity
 */
export const generateWeatherWarnings = (weatherData) => {
  if (!weatherData) return [];
  
  const warnings = [];
  const { weatherId, temperature, windSpeed, humidity, visibility, rain, snow } = weatherData;
  
  // Weather condition warnings based on OpenWeather condition codes
  if (weatherId) {
    // Thunderstorm warnings (2xx)
    if (weatherId >= 200 && weatherId < 300) {
      warnings.push({
        description: 'Thunderstorm activity detected. Seek shelter indoors.',
        severity: 'high'
      });
    }
    
    // Heavy rain warnings (5xx)
    else if (weatherId >= 500 && weatherId < 600) {
      if (weatherId >= 502) { // Heavy intensity rain or higher
        warnings.push({
          description: 'Heavy rainfall may cause flooding in low-lying areas.',
          severity: 'medium'
        });
      }
    }
    
    // Snow warnings (6xx)
    else if (weatherId >= 600 && weatherId < 700) {
      if (weatherId >= 602) { // Heavy snow
        warnings.push({
          description: 'Heavy snowfall may cause difficult travel conditions.',
          severity: 'medium'
        });
      }
    }
    
    // Fog warnings (7xx)
    else if (weatherId >= 700 && weatherId < 800) {
      if (weatherId === 762) { // Volcanic ash
        warnings.push({
          description: 'Volcanic ash detected. Avoid outdoor activities and wear protective masks.',
          severity: 'high'
        });
      } else if (weatherId === 781) { // Tornado
        warnings.push({
          description: 'Tornado warning! Seek shelter immediately in a basement or interior room.',
          severity: 'extreme'
        });
      } else if (weatherId === 771) { // Squall
        warnings.push({
          description: 'Wind squalls detected. Secure loose objects outdoors.',
          severity: 'medium'
        });
      } else if (weatherId === 751) { // Sand
        warnings.push({
          description: 'Sand/dust storm conditions. Limit outdoor exposure and wear protective eyewear.',
          severity: 'medium'
        });
      } else if (weatherId === 741) { // Fog
        warnings.push({
          description: 'Foggy conditions reducing visibility. Drive with caution.',
          severity: 'low'
        });
      }
    }
  }
  
  // Temperature warnings
  if (temperature !== null) {
    if (temperature > 35) {
      warnings.push({
        description: 'Extreme heat. Stay hydrated and avoid prolonged sun exposure.',
        severity: 'high'
      });
    } else if (temperature > 30) {
      warnings.push({
        description: 'High temperatures. Take frequent breaks if working outdoors.',
        severity: 'medium'
      });
    } else if (temperature < -15) {
      warnings.push({
        description: 'Extreme cold. Limit time outdoors and dress in layers.',
        severity: 'high'
      });
    } else if (temperature < -5) {
      warnings.push({
        description: 'Very cold conditions. Risk of hypothermia with prolonged exposure.',
        severity: 'medium'
      });
    }
  }
  
  // Wind warnings
  if (windSpeed !== null) {
    if (windSpeed > 20) {
      warnings.push({
        description: 'Dangerously high winds. Avoid outdoor activities and stay away from trees and power lines.',
        severity: 'high'
      });
    } else if (windSpeed > 10) {
      warnings.push({
        description: 'Strong winds may cause difficulty walking and driving high-profile vehicles.',
        severity: 'medium'
      });
    }
  }
  
  // Visibility warnings
  if (visibility !== null && visibility < 1000) {
    warnings.push({
      description: 'Very low visibility conditions. Drive with extreme caution.',
      severity: 'medium'
    });
  }
  
  return warnings;
};

/**
 * Get a human-readable description of wind speed
 * @param {Number} speed - Wind speed in m/s
 * @returns {String} - Wind description
 */
export function getWindDescription(speed) {
  if (speed < 0.5) return 'Calm';
  if (speed < 1.5) return 'Light';
  if (speed < 3.3) return 'Gentle';
  if (speed < 5.5) return 'Moderate';
  if (speed < 7.9) return 'Fresh';
  if (speed < 10.7) return 'Strong';
  if (speed < 13.8) return 'Near gale';
  if (speed < 17.1) return 'Gale';
  if (speed < 20.7) return 'Strong gale';
  if (speed < 24.4) return 'Storm';
  if (speed < 28.4) return 'Violent storm';
  return 'Hurricane force';
}

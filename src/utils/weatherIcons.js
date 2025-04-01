/**
 * Weather Icons Utility
 * Provides custom weather icons based on weather conditions
 */

// Map OpenWeather icon codes to custom SVG icons or emoji
export const getWeatherIcon = (iconCode, description = '') => {
  // If we have an icon code, use it for mapping
  if (iconCode) {
    // Map OpenWeather icon codes to emoji or SVG paths
    const iconMap = {
      // Clear sky
      '01d': '☀️', // day
      '01n': '🌙', // night
      
      // Few clouds
      '02d': '⛅', // day
      '02n': '☁️', // night
      
      // Scattered clouds
      '03d': '☁️',
      '03n': '☁️',
      
      // Broken clouds
      '04d': '☁️',
      '04n': '☁️',
      
      // Shower rain
      '09d': '🌧️',
      '09n': '🌧️',
      
      // Rain
      '10d': '🌦️', // day
      '10n': '🌧️', // night
      
      // Thunderstorm
      '11d': '⛈️',
      '11n': '⛈️',
      
      // Snow
      '13d': '❄️',
      '13n': '❄️',
      
      // Mist
      '50d': '🌫️',
      '50n': '🌫️'
    };
    
    return iconMap[iconCode] || '🌤️'; // Default icon if code not found
  }
  
  // Fallback to description-based icons if no icon code
  if (description) {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('clear')) return '☀️';
    if (lowerDesc.includes('few clouds')) return '⛅';
    if (lowerDesc.includes('scattered clouds')) return '☁️';
    if (lowerDesc.includes('broken clouds')) return '☁️';
    if (lowerDesc.includes('overcast')) return '☁️';
    if (lowerDesc.includes('shower rain')) return '🌧️';
    if (lowerDesc.includes('rain')) return '🌦️';
    if (lowerDesc.includes('thunderstorm')) return '⛈️';
    if (lowerDesc.includes('snow')) return '❄️';
    if (lowerDesc.includes('sleet')) return '🌨️';
    if (lowerDesc.includes('mist') || 
        lowerDesc.includes('fog') || 
        lowerDesc.includes('haze')) return '🌫️';
  }
  
  return '🌤️'; // Default icon
};

// Get a more visually appealing SVG icon for weather conditions
export const getWeatherSvgIcon = (iconCode, description = '') => {
  // Determine the weather type based on icon code or description
  let weatherType = 'default';
  
  if (iconCode) {
    const prefix = iconCode.substring(0, 2);
    
    switch (prefix) {
      case '01': weatherType = 'clear'; break;
      case '02': weatherType = 'few-clouds'; break;
      case '03': weatherType = 'scattered-clouds'; break;
      case '04': weatherType = 'broken-clouds'; break;
      case '09': weatherType = 'shower-rain'; break;
      case '10': weatherType = 'rain'; break;
      case '11': weatherType = 'thunderstorm'; break;
      case '13': weatherType = 'snow'; break;
      case '50': weatherType = 'mist'; break;
      default: weatherType = 'default';
    }
  } else if (description) {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('clear')) weatherType = 'clear';
    else if (lowerDesc.includes('few clouds')) weatherType = 'few-clouds';
    else if (lowerDesc.includes('scattered clouds')) weatherType = 'scattered-clouds';
    else if (lowerDesc.includes('broken clouds') || lowerDesc.includes('overcast')) weatherType = 'broken-clouds';
    else if (lowerDesc.includes('shower rain')) weatherType = 'shower-rain';
    else if (lowerDesc.includes('rain')) weatherType = 'rain';
    else if (lowerDesc.includes('thunderstorm')) weatherType = 'thunderstorm';
    else if (lowerDesc.includes('snow')) weatherType = 'snow';
    else if (lowerDesc.includes('mist') || lowerDesc.includes('fog') || lowerDesc.includes('haze')) weatherType = 'mist';
  }
  
  // Return SVG markup based on weather type
  switch (weatherType) {
    case 'clear':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`;
      
    case 'few-clouds':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
        <circle cx="5" cy="12" r="2.5" fill="currentColor" class="text-yellow-400"></circle>
      </svg>`;
      
    case 'scattered-clouds':
    case 'broken-clouds':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
      </svg>`;
      
    case 'shower-rain':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
        <line x1="8" y1="19" x2="8" y2="21"></line>
        <line x1="12" y1="19" x2="12" y2="22"></line>
        <line x1="16" y1="19" x2="16" y2="21"></line>
      </svg>`;
      
    case 'rain':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#9CA3AF"></path>
        <line x1="10" y1="19" x2="10" y2="22" class="text-blue-400"></line>
        <line x1="14" y1="19" x2="14" y2="22" class="text-blue-400"></line>
      </svg>`;
      
    case 'thunderstorm':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-500">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#9CA3AF"></path>
        <path d="M13 10l-4 8h5l-2 4 4-8h-5l2-4z" fill="#FBBF24" stroke="#FBBF24"></path>
      </svg>`;
      
    case 'snow':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-200">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="#9CA3AF"></path>
        <circle cx="10" cy="19" r="1" fill="currentColor"></circle>
        <circle cx="14" cy="19" r="1" fill="currentColor"></circle>
        <circle cx="12" cy="21" r="1" fill="currentColor"></circle>
      </svg>`;
      
    case 'mist':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <line x1="5" y1="14" x2="19" y2="14"></line>
        <line x1="7" y1="18" x2="17" y2="18"></line>
      </svg>`;
      
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2a9 9 0 0 1 9 9"></path>
      </svg>`;
  }
};

// Get a CSS class for styling based on weather condition
export const getWeatherIconClass = (iconCode, description = '') => {
  // Determine the weather type based on icon code or description
  let weatherType = 'default';
  
  if (iconCode) {
    const prefix = iconCode.substring(0, 2);
    
    switch (prefix) {
      case '01': weatherType = 'clear'; break;
      case '02': weatherType = 'few-clouds'; break;
      case '03': weatherType = 'scattered-clouds'; break;
      case '04': weatherType = 'broken-clouds'; break;
      case '09': weatherType = 'shower-rain'; break;
      case '10': weatherType = 'rain'; break;
      case '11': weatherType = 'thunderstorm'; break;
      case '13': weatherType = 'snow'; break;
      case '50': weatherType = 'mist'; break;
      default: weatherType = 'default';
    }
  } else if (description) {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('clear')) weatherType = 'clear';
    else if (lowerDesc.includes('few clouds')) weatherType = 'few-clouds';
    else if (lowerDesc.includes('scattered clouds')) weatherType = 'scattered-clouds';
    else if (lowerDesc.includes('broken clouds') || lowerDesc.includes('overcast')) weatherType = 'broken-clouds';
    else if (lowerDesc.includes('shower rain')) weatherType = 'shower-rain';
    else if (lowerDesc.includes('rain')) weatherType = 'rain';
    else if (lowerDesc.includes('thunderstorm')) weatherType = 'thunderstorm';
    else if (lowerDesc.includes('snow')) weatherType = 'snow';
    else if (lowerDesc.includes('mist') || lowerDesc.includes('fog') || lowerDesc.includes('haze')) weatherType = 'mist';
  }
  
  // Return CSS class based on weather type
  switch (weatherType) {
    case 'clear': return 'weather-icon-clear';
    case 'few-clouds': return 'weather-icon-few-clouds';
    case 'scattered-clouds': return 'weather-icon-scattered-clouds';
    case 'broken-clouds': return 'weather-icon-broken-clouds';
    case 'shower-rain': return 'weather-icon-shower-rain';
    case 'rain': return 'weather-icon-rain';
    case 'thunderstorm': return 'weather-icon-thunderstorm';
    case 'snow': return 'weather-icon-snow';
    case 'mist': return 'weather-icon-mist';
    default: return 'weather-icon-default';
  }
};

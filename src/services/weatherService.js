import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

class WeatherService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      params: {
        appid: API_KEY,
        units: 'metric'
      }
    });
  }

  async getCurrentWeather(lat, lon) {
    try {
      const response = await this.api.get('/weather', {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  }

  async getForecast(lat, lon) {
    try {
      const response = await this.api.get('/forecast', {
        params: { lat, lon }
      });
      
      // Group forecast by day
      const dailyForecasts = response.data.list.reduce((acc, forecast) => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = forecast;
        }
        return acc;
      }, {});

      return Object.values(dailyForecasts);
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  }

  async searchLocation(query) {
    try {
      const response = await axios.get(`${GEO_URL}/direct`, {
        params: {
          q: query,
          limit: 5,
          appid: API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching location:', error);
      throw error;
    }
  }

  async reverseGeocode(lat, lon) {
    try {
      const response = await axios.get(`${GEO_URL}/reverse`, {
        params: {
          lat,
          lon,
          limit: 1,
          appid: API_KEY
        }
      });
      return response.data[0];
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  }

  getWeatherMapUrl(layer) {
    return `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${API_KEY}`;
  }
}

export const weatherService = new WeatherService();
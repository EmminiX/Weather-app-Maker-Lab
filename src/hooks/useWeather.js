import { useState, useEffect } from 'react';
import { weatherService } from '../services/weatherService';

const LOCATION_KEY = 'lastLocation';

export function useWeather() {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem(LOCATION_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location) {
      localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
      fetchWeatherData();
    }
  }, [location]);

  async function fetchWeatherData() {
    setLoading(true);
    setError(null);
    try {
      const [weather, forecastData] = await Promise.all([
        weatherService.getCurrentWeather(location.lat, location.lon),
        weatherService.getForecast(location.lat, location.lon)
      ]);
      setCurrentWeather(weather);
      setForecast(forecastData);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function searchLocation(query) {
    setLoading(true);
    setError(null);
    try {
      const results = await weatherService.searchLocation(query);
      return results;
    } catch (err) {
      setError('Location search failed. Please try again.');
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function getUserLocation() {
    setLoading(true);
    setError(null);
    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Use a timeout to handle slow geolocation responses
      const position = await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Geolocation request timed out'));
        }, 10000); // 10 second timeout

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (err) => {
            clearTimeout(timeoutId);
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
      
      const { latitude: lat, longitude: lon } = position.coords;
      console.log('Got coordinates:', lat, lon);
      
      try {
        const locationData = await weatherService.reverseGeocode(lat, lon);
        console.log('Reverse geocode result:', locationData);
        
        await setLocation({
          lat,
          lon,
          name: locationData.name,
          country: locationData.country
        });
        return true; // Return success
      } catch (geocodeErr) {
        console.error('Reverse geocoding failed:', geocodeErr);
        // Fallback: Use coordinates without city name
        await setLocation({
          lat,
          lon,
          name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
          country: ''
        });
        return true; // Return success even with fallback
      }
    } catch (err) {
      console.error('Geolocation error:', err);
      setError(`Failed to get your location: ${err.message}. Please try again or search manually.`);
      return false; // Return failure
    } finally {
      setLoading(false);
    }
  }

  return {
    location,
    setLocation,
    currentWeather,
    forecast,
    loading,
    error,
    searchLocation,
    getUserLocation
  };
}
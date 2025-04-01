import { useState, useEffect } from 'react';
import { useWeather } from './useWeather';
import { useSenseHatData } from './useSenseHatData';

export function useWeatherComparison() {
  const {
    currentWeather: openWeatherData,
    location,
    loading: openWeatherLoading
  } = useWeather();

  const {
    currentData: senseHatData,
    historicalData: senseHatHistory,
    loading: senseHatLoading
  } = useSenseHatData();

  const [combinedData, setCombinedData] = useState({
    temperature: [],
    humidity: [],
    pressure: []
  });

  useEffect(() => {
    if (senseHatHistory && openWeatherData) {
      // Process temperature data
      const tempData = {
        indoor: senseHatHistory.map(entry => ({
          timestamp: new Date(entry.timestamp),
          value: entry.temperature
        })),
        outdoor: openWeatherData.main.temp
      };

      // Process humidity data
      const humidityData = {
        indoor: senseHatHistory.map(entry => ({
          timestamp: new Date(entry.timestamp),
          value: entry.humidity
        })),
        outdoor: openWeatherData.main.humidity
      };

      // Process pressure data
      const pressureData = {
        indoor: senseHatHistory.map(entry => ({
          timestamp: new Date(entry.timestamp),
          value: entry.pressure
        })),
        outdoor: openWeatherData.main.pressure
      };

      setCombinedData({
        temperature: tempData,
        humidity: humidityData,
        pressure: pressureData
      });
    }
  }, [senseHatHistory, openWeatherData]);

  return {
    combinedData,
    loading: openWeatherLoading || senseHatLoading,
    location,
    currentComparison: {
      indoor: senseHatData,
      outdoor: openWeatherData
    }
  };
}
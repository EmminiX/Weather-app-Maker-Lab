import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { generateMockCurrentData, generateMockHistoricalData } from '../utils/mockSenseHatData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const REFRESH_INTERVAL = 60000; // 1 minute
const USE_MOCK_DATA = true; // Set to false to use real API

export const useSenseHatData = () => {
  const [currentData, setCurrentData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    // Use mock data for development/testing
    if (USE_MOCK_DATA) {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setCurrentData(generateMockCurrentData());
        setHistoricalData(generateMockHistoricalData(24));
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Error generating mock data:', err);
        setError('Failed to generate mock data');
        setLoading(false);
      }
      return;
    }
    
    // Use real API
    try {
      const [currentResponse, historicalResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/data`),
        axios.get(`${API_BASE_URL}/data/history`)
      ]);

      setCurrentData(currentResponse.data);
      setHistoricalData(historicalResponse.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sensor data');
      console.error('Error fetching sensor data:', err);
      
      // Fallback to mock data if API fails
      setCurrentData(generateMockCurrentData());
      setHistoricalData(generateMockHistoricalData(24));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    currentData,
    historicalData,
    loading,
    error,
    refetch: fetchData
  };
};

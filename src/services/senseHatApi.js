import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const getCurrentSenseHatData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sensehat/current`);
    return response.data;
  } catch (error) {
    console.error('Error fetching SenseHAT data:', error);
    throw error;
  }
};

export const getHistoricalSenseHatData = async (hours = 24) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sensehat/historical`, {
      params: { hours }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching historical SenseHAT data:', error);
    throw error;
  }
};
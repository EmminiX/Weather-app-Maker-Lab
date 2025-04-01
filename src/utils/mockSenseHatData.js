/**
 * Mock SenseHat data provider
 * This utility provides mock data for testing when the actual SenseHat API is not available
 */

// Generate a random value within a range
const randomInRange = (min, max) => {
  return Math.random() * (max - min) + min;
};

// Generate a timestamp for a specific time ago in minutes
const getTimestampMinutesAgo = (minutesAgo) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutesAgo);
  return date.toISOString();
};

// Generate mock current data
export const generateMockCurrentData = () => {
  return {
    temperature: randomInRange(18, 25),
    humidity: randomInRange(30, 70),
    pressure: randomInRange(990, 1030),
    timestamp: new Date().toISOString()
  };
};

// Generate mock historical data
export const generateMockHistoricalData = (count = 24) => {
  const data = [];
  
  // Base values
  let temp = randomInRange(18, 25);
  let humidity = randomInRange(30, 70);
  let pressure = randomInRange(990, 1030);
  
  // Generate data points with slight variations to simulate trends
  for (let i = 0; i < count; i++) {
    // Add some randomness but maintain a trend
    temp += randomInRange(-0.5, 0.5);
    humidity += randomInRange(-2, 2);
    pressure += randomInRange(-1, 1);
    
    // Keep values in reasonable ranges
    temp = Math.max(10, Math.min(35, temp));
    humidity = Math.max(10, Math.min(95, humidity));
    pressure = Math.max(970, Math.min(1050, pressure));
    
    data.push({
      temperature: temp,
      humidity: humidity,
      pressure: pressure,
      timestamp: getTimestampMinutesAgo(count - i)
    });
  }
  
  return data;
};

// Generate complete mock SenseHat data
export const generateMockSenseHatData = () => {
  return {
    currentData: generateMockCurrentData(),
    historicalData: generateMockHistoricalData(24)
  };
};

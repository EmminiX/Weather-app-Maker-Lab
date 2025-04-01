/**
 * Weather Analytics Utility
 * Provides functions for analyzing weather data patterns and generating insights
 */

/**
 * Analyzes temperature trends from historical data
 * @param {Array} data - Array of weather data points with temperature values
 * @param {Number} timeWindow - Number of data points to consider for trend (default: all)
 * @returns {Object} Trend analysis with direction, magnitude, and confidence
 */
export const analyzeTempTrend = (data, timeWindow = null) => {
  if (!data || data.length < 2) {
    return { trend: 'unknown', magnitude: 0, confidence: 0 };
  }

  // Use specified window or all data
  const relevantData = timeWindow ? data.slice(-timeWindow) : data;
  
  // Calculate linear regression
  const n = relevantData.length;
  const temps = relevantData.map(d => d.temperature);
  
  // Simple linear regression to determine trend
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += temps[i];
    sumXY += i * temps[i];
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  // Calculate R-squared for confidence
  const avgY = sumY / n;
  let totalVariation = 0, explainedVariation = 0;
  const predictions = [];
  
  for (let i = 0; i < n; i++) {
    const prediction = (slope * i) + ((sumY - slope * sumX) / n);
    predictions.push(prediction);
    totalVariation += Math.pow(temps[i] - avgY, 2);
    explainedVariation += Math.pow(prediction - avgY, 2);
  }
  
  const rSquared = explainedVariation / totalVariation;
  const confidence = Math.min(Math.abs(rSquared * 100), 100);
  
  // Determine trend direction and magnitude
  let trend = 'stable';
  if (slope > 0.1) trend = 'rising';
  else if (slope < -0.1) trend = 'falling';
  
  // Calculate magnitude as percentage change
  const firstTemp = temps[0];
  const lastTemp = temps[temps.length - 1];
  const percentChange = firstTemp ? ((lastTemp - firstTemp) / Math.abs(firstTemp)) * 100 : 0;
  
  return {
    trend,
    magnitude: Math.abs(percentChange).toFixed(1),
    confidence: confidence.toFixed(0),
    slope
  };
};

/**
 * Analyzes pressure patterns to predict weather changes
 * @param {Array} data - Array of weather data points with pressure values
 * @returns {Object} Pressure analysis with prediction and confidence
 */
export const analyzePressure = (data) => {
  if (!data || data.length < 3) {
    return { prediction: 'unknown', confidence: 0 };
  }
  
  const pressures = data.map(d => d.pressure);
  const latestPressure = pressures[pressures.length - 1];
  
  // Calculate trend
  const trend = analyzeTrend(pressures);
  
  // Weather prediction based on barometric pressure trends
  let prediction = 'stable weather';
  let confidence = Number(trend.confidence);
  
  // Rising pressure typically indicates improving weather
  if (trend.trend === 'rising') {
    prediction = 'improving weather conditions';
    if (latestPressure > 1022) {
      prediction = 'clear and fair weather approaching';
    }
  } 
  // Falling pressure often indicates deteriorating weather
  else if (trend.trend === 'falling') {
    prediction = 'changing weather conditions';
    if (latestPressure < 1000) {
      prediction = 'rain or storms may be approaching';
      confidence = Math.min(confidence + 15, 100);
    }
  }
  // Stable but low pressure
  else if (latestPressure < 995) {
    prediction = 'potential stormy conditions';
    confidence = Math.min(confidence + 10, 100);
  }
  // Stable but high pressure
  else if (latestPressure > 1025) {
    prediction = 'continued fair weather';
    confidence = Math.min(confidence + 10, 100);
  }
  
  return {
    prediction,
    confidence: confidence.toFixed(0),
    trend: trend.trend,
    currentPressure: latestPressure
  };
};

/**
 * Analyzes humidity patterns
 * @param {Array} data - Array of weather data points with humidity values
 * @returns {Object} Humidity analysis with pattern and comfort level
 */
export const analyzeHumidity = (data) => {
  if (!data || data.length < 2) {
    return { pattern: 'unknown', comfort: 'unknown', confidence: 0 };
  }
  
  const humidities = data.map(d => d.humidity);
  const latestHumidity = humidities[humidities.length - 1];
  
  // Calculate trend
  const trend = analyzeTrend(humidities);
  
  // Determine comfort level based on humidity
  let comfort = 'comfortable';
  if (latestHumidity < 30) {
    comfort = 'dry';
  } else if (latestHumidity > 70) {
    comfort = 'humid';
  }
  
  // Determine pattern description
  let pattern = 'stable humidity';
  if (trend.trend === 'rising') {
    pattern = 'increasing humidity';
  } else if (trend.trend === 'falling') {
    pattern = 'decreasing humidity';
  }
  
  // Determine if there are significant fluctuations
  const fluctuation = calculateFluctuation(humidities);
  if (fluctuation > 15) {
    pattern += ' with significant fluctuations';
  }
  
  return {
    pattern,
    comfort,
    confidence: trend.confidence,
    currentHumidity: latestHumidity
  };
};

/**
 * Analyzes correlation between SenseHat and external weather data
 * @param {Array} senseHatData - Array of SenseHat data points
 * @param {Array} externalData - Array of external weather data points
 * @returns {Object} Correlation analysis for temperature, humidity, etc.
 */
export const analyzeCorrelation = (senseHatData, externalData) => {
  if (!senseHatData || !externalData || senseHatData.length < 2 || externalData.length < 2) {
    return { 
      temperature: { correlation: 0, description: 'insufficient data' },
      humidity: { correlation: 0, description: 'insufficient data' }
    };
  }
  
  // Match timestamps or use closest points
  const matchedData = matchDataPoints(senseHatData, externalData);
  
  // Calculate temperature correlation
  const tempCorrelation = calculateCorrelation(
    matchedData.map(d => d.senseHat.temperature),
    matchedData.map(d => d.external.temperature)
  );
  
  // Calculate humidity correlation
  const humidityCorrelation = calculateCorrelation(
    matchedData.map(d => d.senseHat.humidity),
    matchedData.map(d => d.external.humidity)
  );
  
  // Generate descriptions
  const tempDescription = getCorrelationDescription(tempCorrelation, 'temperature');
  const humidityDescription = getCorrelationDescription(humidityCorrelation, 'humidity');
  
  // Calculate average differences
  const tempDiff = calculateAverageDifference(
    matchedData.map(d => d.senseHat.temperature),
    matchedData.map(d => d.external.temperature)
  );
  
  const humidityDiff = calculateAverageDifference(
    matchedData.map(d => d.senseHat.humidity),
    matchedData.map(d => d.external.humidity)
  );
  
  return {
    temperature: {
      correlation: Math.abs(tempCorrelation).toFixed(2),
      description: tempDescription,
      difference: tempDiff.toFixed(1)
    },
    humidity: {
      correlation: Math.abs(humidityCorrelation).toFixed(2),
      description: humidityDescription,
      difference: humidityDiff.toFixed(1)
    }
  };
};

/**
 * Detects anomalies in weather data
 * @param {Array} data - Array of weather data points
 * @returns {Array} List of detected anomalies with descriptions
 */
export const detectAnomalies = (data) => {
  if (!data || data.length < 5) {
    return [];
  }
  
  const anomalies = [];
  
  // Extract data series
  const temps = data.map(d => d.temperature);
  const humidities = data.map(d => d.humidity);
  const pressures = data.map(d => d.pressure);
  
  // Calculate statistics
  const tempStats = calculateStats(temps);
  const humidityStats = calculateStats(humidities);
  const pressureStats = calculateStats(pressures);
  
  // Check for temperature anomalies (beyond 2 standard deviations)
  const latestTemp = temps[temps.length - 1];
  if (Math.abs(latestTemp - tempStats.mean) > tempStats.stdDev * 2) {
    anomalies.push({
      type: 'temperature',
      description: `Unusual temperature reading of ${latestTemp.toFixed(1)}°C`,
      confidence: calculateAnomalyConfidence(latestTemp, tempStats)
    });
  }
  
  // Check for rapid pressure changes (potential storm indicator)
  if (data.length > 3) {
    const pressureChange = pressures[pressures.length - 1] - pressures[pressures.length - 3];
    if (Math.abs(pressureChange) > 6) { // 6 hPa in short period is significant
      anomalies.push({
        type: 'pressure',
        description: `Rapid pressure ${pressureChange > 0 ? 'increase' : 'decrease'} of ${Math.abs(pressureChange).toFixed(1)} hPa`,
        confidence: Math.min(Math.abs(pressureChange) * 5, 95)
      });
    }
  }
  
  // Check for extreme humidity values
  const latestHumidity = humidities[humidities.length - 1];
  if (latestHumidity > 95) {
    anomalies.push({
      type: 'humidity',
      description: 'Very high humidity, precipitation likely',
      confidence: 85
    });
  } else if (latestHumidity < 20) {
    anomalies.push({
      type: 'humidity',
      description: 'Extremely dry conditions',
      confidence: 90
    });
  }
  
  return anomalies;
};

// Helper functions

/**
 * Calculates basic trend from an array of values
 */
function analyzeTrend(values) {
  const n = values.length;
  
  // Simple linear regression
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  // Calculate R-squared for confidence
  const avgY = sumY / n;
  let totalVariation = 0, explainedVariation = 0;
  
  for (let i = 0; i < n; i++) {
    const prediction = (slope * i) + ((sumY - slope * sumX) / n);
    totalVariation += Math.pow(values[i] - avgY, 2);
    explainedVariation += Math.pow(prediction - avgY, 2);
  }
  
  const rSquared = Math.min(Math.abs(explainedVariation / totalVariation), 1);
  const confidence = Math.min(rSquared * 100, 100);
  
  // Determine trend direction
  let trend = 'stable';
  if (slope > 0.05) trend = 'rising';
  else if (slope < -0.05) trend = 'falling';
  
  return {
    trend,
    slope,
    confidence: confidence.toFixed(0)
  };
}

/**
 * Calculates the Pearson correlation coefficient between two data series
 */
function calculateCorrelation(series1, series2) {
  if (series1.length !== series2.length) {
    throw new Error('Data series must have the same length');
  }
  
  const n = series1.length;
  
  // Calculate means
  const mean1 = series1.reduce((sum, val) => sum + val, 0) / n;
  const mean2 = series2.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate correlation coefficient
  let numerator = 0;
  let denom1 = 0;
  let denom2 = 0;
  
  for (let i = 0; i < n; i++) {
    const diff1 = series1[i] - mean1;
    const diff2 = series2[i] - mean2;
    
    numerator += diff1 * diff2;
    denom1 += diff1 * diff1;
    denom2 += diff2 * diff2;
  }
  
  if (denom1 === 0 || denom2 === 0) return 0;
  
  return numerator / Math.sqrt(denom1 * denom2);
}

/**
 * Matches data points from two series based on timestamps
 */
function matchDataPoints(senseHatData, externalData) {
  const matched = [];
  
  // For simplicity, we'll just pair them sequentially
  // In a real implementation, you'd match by closest timestamp
  const minLength = Math.min(senseHatData.length, externalData.length);
  
  for (let i = 0; i < minLength; i++) {
    matched.push({
      senseHat: senseHatData[i],
      external: externalData[i]
    });
  }
  
  return matched;
}

/**
 * Generates a human-readable description of correlation
 */
function getCorrelationDescription(correlation, metric) {
  const absCorrelation = Math.abs(correlation);
  
  if (absCorrelation > 0.8) {
    return `SenseHat ${metric} readings closely match external data`;
  } else if (absCorrelation > 0.5) {
    return `SenseHat ${metric} shows moderate agreement with external data`;
  } else if (absCorrelation > 0.3) {
    return `SenseHat ${metric} shows some agreement with external data`;
  } else {
    return `SenseHat ${metric} differs significantly from external data`;
  }
}

/**
 * Calculates the average absolute difference between two data series
 */
function calculateAverageDifference(series1, series2) {
  if (series1.length !== series2.length) {
    throw new Error('Data series must have the same length');
  }
  
  let totalDiff = 0;
  
  for (let i = 0; i < series1.length; i++) {
    totalDiff += Math.abs(series1[i] - series2[i]);
  }
  
  return totalDiff / series1.length;
}

/**
 * Calculates basic statistics for a data series
 */
function calculateStats(values) {
  const n = values.length;
  const mean = values.reduce((sum, val) => sum + val, 0) / n;
  
  let sumSquaredDiffs = 0;
  for (let i = 0; i < n; i++) {
    sumSquaredDiffs += Math.pow(values[i] - mean, 2);
  }
  
  const variance = sumSquaredDiffs / n;
  const stdDev = Math.sqrt(variance);
  
  return {
    mean,
    median: calculateMedian(values),
    stdDev,
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

/**
 * Calculates the median of a data series
 */
function calculateMedian(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
}

/**
 * Calculates the confidence level for an anomaly
 */
function calculateAnomalyConfidence(value, stats) {
  const deviations = Math.abs(value - stats.mean) / stats.stdDev;
  return Math.min(deviations * 25, 95).toFixed(0);
}

/**
 * Calculates the fluctuation in a data series
 */
function calculateFluctuation(values) {
  if (values.length < 2) return 0;
  
  let totalChange = 0;
  for (let i = 1; i < values.length; i++) {
    totalChange += Math.abs(values[i] - values[i-1]);
  }
  
  return totalChange / (values.length - 1);
}

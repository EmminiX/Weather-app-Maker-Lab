import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Time range options
const TIME_RANGES = [
  { label: '24h', value: 24 },
  { label: '7d', value: 168 },
  { label: '30d', value: 720 }
];

// Chart types
const CHART_TYPES = [
  { label: 'Temperature', value: 'temperature' },
  { label: 'Humidity', value: 'humidity' },
  { label: 'Pressure', value: 'pressure' }
];

const InteractiveWeatherCharts = ({ senseHatData, externalData, loading }) => {
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES[0].value);
  const [selectedChart, setSelectedChart] = useState(CHART_TYPES[0].value);
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef(null);

  // Force refresh when external data changes
  useEffect(() => {
    if (!loading && senseHatData?.historicalData) {
      const historicalData = senseHatData.historicalData;
      const filteredData = historicalData.slice(-selectedRange);
      prepareChartData(filteredData, externalData, selectedChart);
    }
  }, [externalData, loading]); // Only depend on external data and loading state

  // Prepare chart data when inputs change
  useEffect(() => {
    if (loading || !senseHatData?.historicalData) return;

    const historicalData = senseHatData.historicalData;
    const filteredData = historicalData.slice(-selectedRange);
    prepareChartData(filteredData, externalData, selectedChart);
    
  }, [senseHatData, selectedRange, selectedChart, loading]); // Remove externalData dependency here

  // Update chart instance when chartData changes
  useEffect(() => {
    if (chartRef.current && chartData) {
      chartRef.current.data = {
        labels: chartData.labels,
        datasets: chartData.datasets
      };
      chartRef.current.options = chartData.options;
      chartRef.current.update('none'); // Use 'none' mode for smoother updates
    }
  }, [chartData]);

  // Prepare chart data based on selected type
  const prepareChartData = (senseHatData, externalData, chartType) => {
    if (!senseHatData || senseHatData.length === 0) return;
    
    try {
      // Format timestamps for x-axis
      const labels = senseHatData.map(item => {
        if (!item || !item.timestamp) return '';
        try {
          const date = new Date(item.timestamp);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
          console.error('Error formatting timestamp:', e);
          return '';
        }
      });
    
      // Prepare datasets based on chart type
      let datasets = [];
      let options = {};
      
      switch (chartType) {
        case 'temperature':
          datasets = [
            {
              label: 'SenseHAT Temperature (°C)',
              data: senseHatData.map(item => item?.temperature || null),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              tension: 0.4,
              fill: false,
            }
          ];
          
          // Add external temperature data if available
          if (externalData && externalData.length > 0) {
            datasets.push({
              label: 'External Temperature (°C)',
              data: externalData.slice(0, senseHatData.length).map(item => item?.temperature || null),
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              tension: 0.4,
              fill: false,
            });
          }
        
        options = {
          scales: {
            y: {
              title: {
                display: true,
                text: 'Temperature (°C)'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Temperature Comparison'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}°C`;
                }
              }
            }
          }
        };
        break;
        
        case 'humidity':
          datasets = [
            {
              label: 'SenseHAT Humidity (%)',
              data: senseHatData.map(item => item?.humidity || null),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.4,
              fill: false,
            }
          ];
          
          // Add external humidity data if available
          if (externalData && externalData.length > 0) {
            datasets.push({
              label: 'External Humidity (%)',
              data: externalData.slice(0, senseHatData.length).map(item => item?.humidity || null),
              borderColor: 'rgb(153, 102, 255)',
              backgroundColor: 'rgba(153, 102, 255, 0.5)',
              tension: 0.4,
              fill: false,
            });
          }
        
        options = {
          scales: {
            y: {
              title: {
                display: true,
                text: 'Humidity (%)'
              },
              min: 0,
              max: 100
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Humidity Comparison'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                }
              }
            }
          }
        };
        break;
        
        case 'pressure':
          // Define pressure thresholds for weather changes
          const lowPressureThreshold = 1000; // hPa
          const highPressureThreshold = 1020; // hPa
          
          datasets = [
            {
              label: 'Barometric Pressure (hPa)',
              data: senseHatData.map(item => item?.pressure || null),
              borderColor: 'rgb(255, 159, 64)',
              backgroundColor: 'rgba(255, 159, 64, 0.5)',
              tension: 0.4,
              fill: false,
            },
            // Add threshold lines
            {
              label: 'Low Pressure Threshold',
              data: Array(senseHatData.length).fill(lowPressureThreshold),
              borderColor: 'rgba(255, 99, 132, 0.7)',
              borderDash: [5, 5],
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
            },
            {
              label: 'High Pressure Threshold',
              data: Array(senseHatData.length).fill(highPressureThreshold),
              borderColor: 'rgba(54, 162, 235, 0.7)',
              borderDash: [5, 5],
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
            }
          ];
        
        options = {
          scales: {
            y: {
              title: {
                display: true,
                text: 'Pressure (hPa)'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Pressure Trend with Weather Change Thresholds'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  if (context.datasetIndex === 0) {
                    return `Pressure: ${context.parsed.y.toFixed(1)} hPa`;
                  } else if (context.datasetIndex === 1) {
                    return `Low Pressure Threshold: ${lowPressureThreshold} hPa (Potential storms)`;
                  } else {
                    return `High Pressure Threshold: ${highPressureThreshold} hPa (Fair weather)`;
                  }
                }
              }
            }
          }
        };
        break;
        
      default:
        break;
    }
    
    // Common options for all charts
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: 'rgb(229, 231, 235)', // text-gray-200
            font: {
              family: "'Inter', sans-serif"
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.8)', // bg-gray-900/80
          titleColor: 'rgb(243, 244, 246)', // text-gray-100
          bodyColor: 'rgb(229, 231, 235)', // text-gray-200
          borderColor: 'rgba(107, 114, 128, 0.2)', // border-gray-500/20
          borderWidth: 1,
          padding: 10,
          boxPadding: 5,
          usePointStyle: true,
          bodyFont: {
            family: "'Inter', sans-serif"
          },
          titleFont: {
            family: "'Inter', sans-serif",
            weight: 'bold'
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(75, 85, 99, 0.2)' // gray-600/20
          },
          ticks: {
            color: 'rgb(156, 163, 175)' // text-gray-400
          }
        },
        y: {
          grid: {
            color: 'rgba(75, 85, 99, 0.2)' // gray-600/20
          },
          ticks: {
            color: 'rgb(156, 163, 175)' // text-gray-400
          }
        }
      }
    };
    
    // Merge common options with chart-specific options
    const mergedOptions = {
      ...commonOptions,
      ...options,
      plugins: {
        ...commonOptions.plugins,
        ...(options.plugins || {})
      },
      scales: {
        ...commonOptions.scales,
        ...(options.scales || {}),
        y: {
          ...commonOptions.scales.y,
          ...(options.scales?.y || {})
        }
      }
    };
    
      setChartData({
        labels,
        datasets,
        options: mergedOptions
      });
    } catch (error) {
      console.error('Error preparing chart data:', error);
      // Set a fallback empty chart
      setChartData({
        labels: [],
        datasets: [{
          label: 'No data available',
          data: [],
          borderColor: 'rgb(156, 163, 175)',
          backgroundColor: 'rgba(156, 163, 175, 0.5)',
        }],
        options: {}
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <motion.div 
        className="bg-gray-900/70 backdrop-blur-md rounded-lg shadow-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Interactive Weather Charts</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200/20 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200/20 rounded"></div>
        </div>
      </motion.div>
    );
  }
  
  // No data state
  if (!senseHatData?.historicalData || senseHatData.historicalData.length === 0) {
    return (
      <motion.div 
        className="bg-gray-900/70 backdrop-blur-md rounded-lg shadow-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Interactive Weather Charts</h3>
        <div className="text-gray-400 text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>No historical data available for charts</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-gray-900/70 backdrop-blur-md rounded-lg shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3 
        className="text-xl font-semibold text-gray-100 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Interactive Weather Charts
      </motion.h3>
      
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Chart type selector */}
        <div className="flex flex-wrap gap-2">
          {CHART_TYPES.map((type, index) => (
            <motion.button
              key={type.value}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${selectedChart === type.value 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`}
              onClick={() => setSelectedChart(type.value)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + (index * 0.1) }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {type.label}
            </motion.button>
          ))}
        </div>
        
        {/* Time range selector */}
        <div className="flex flex-wrap gap-2 ml-auto">
          {TIME_RANGES.map((range, index) => (
            <motion.button
              key={range.value}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${selectedRange === range.value 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`}
              onClick={() => setSelectedRange(range.value)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + (index * 0.1) }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {range.label}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Chart */}
      <motion.div 
        className="h-80 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {chartData ? (
          <Line 
            ref={chartRef}
            data={{
              labels: chartData.labels,
              datasets: chartData.datasets
            }}
            options={chartData.options}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Preparing chart data...</div>
          </div>
        )}
      </motion.div>
      
      {/* Chart description */}
      <motion.div 
        className="mt-6 text-sm text-gray-400 bg-gray-800/30 p-4 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {selectedChart === 'temperature' && (
          <p>This chart shows temperature readings over time. Compare SenseHAT readings with external weather data to see how indoor and outdoor temperatures differ.</p>
        )}
        {selectedChart === 'humidity' && (
          <p>This chart displays humidity levels over time. Humidity affects comfort levels and can indicate potential precipitation when levels are high.</p>
        )}
        {selectedChart === 'pressure' && (
          <p>This chart tracks barometric pressure with weather change thresholds. Falling pressure (below 1000 hPa) often indicates approaching storms, while high pressure (above 1020 hPa) typically signals fair weather.</p>
        )}
      </motion.div>
    </motion.div>
  );
};

InteractiveWeatherCharts.propTypes = {
  senseHatData: PropTypes.shape({
    currentData: PropTypes.object,
    historicalData: PropTypes.array
  }),
  externalData: PropTypes.array,
  loading: PropTypes.bool.isRequired
};

export default InteractiveWeatherCharts;

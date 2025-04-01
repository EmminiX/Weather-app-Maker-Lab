import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

export function SensorCard({
  title,
  value,
  unit,
  icon,
  historicalData,
  loading,
  error,
  min,
  max,
  gradient
}) {
  const chartData = {
    labels: historicalData?.map(d => d.timestamp.toLocaleTimeString()) || [],
    datasets: [
      {
        label: title,
        data: historicalData?.map(d => d.value) || [],
        borderColor: gradient[1],
        backgroundColor: `${gradient[1]}33`,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        min,
        max,
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10" style={{ background: `linear-gradient(45deg, ${gradient[0]}, ${gradient[1]})` }}></div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.span 
            className="text-gray-600 dark:text-gray-400"
            whileHover={{ rotate: 15, scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            {icon}
          </motion.span>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {loading ? (
          <div className="animate-pulse h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        ) : error ? (
          <span className="text-red-500">Error</span>
        ) : (
          <motion.div 
            className="text-right"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-2xl font-bold" style={{ color: gradient[1] }}>
              {value?.toFixed(1)}
            </span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">
              {unit}
            </span>
          </motion.div>
        )}
      </div>

      <div className="h-32">
        {loading ? (
          <div className="animate-pulse h-full w-full bg-gray-200 dark:bg-gray-700 rounded" />
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            Failed to load data
          </div>
        ) : historicalData && historicalData.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Line data={chartData} options={chartOptions} />
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No historical data
          </div>
        )}
      </div>
    </motion.div>
  );
}

SensorCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number,
  unit: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  historicalData: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.instanceOf(Date),
      value: PropTypes.number
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.any,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  gradient: PropTypes.arrayOf(PropTypes.string).isRequired
};
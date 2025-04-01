import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useWeatherComparison } from '../hooks/useWeatherComparison';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    }
  }
};

function ComparisonCard({ title, indoor, outdoor, unit, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    >
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Indoor</p>
          <p className="text-2xl font-bold" style={{ color }}>
            {indoor} {unit}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Outdoor</p>
          <p className="text-2xl font-bold" style={{ color }}>
            {outdoor} {unit}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function TrendChart({ data, label, color }) {
  if (!data?.indoor?.length) return null;

  const chartData = {
    labels: data.indoor.map(entry => {
      const date = new Date(entry.timestamp);
      return date.toLocaleTimeString();
    }),
    datasets: [
      {
        label: 'Indoor',
        data: data.indoor.map(entry => entry.value),
        borderColor: color,
        backgroundColor: `${color}33`,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Outdoor',
        data: Array(data.indoor.length).fill(data.outdoor),
        borderColor: `${color}88`,
        borderDash: [5, 5],
        fill: false
      }
    ]
  };

  return (
    <div className="h-[300px] w-full">
      <Line options={chartOptions} data={chartData} />
    </div>
  );
}

export function WeatherComparison() {
  const { combinedData, currentComparison, loading } = useWeatherComparison();

  if (loading || !currentComparison.indoor || !currentComparison.outdoor) {
    return null;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Indoor vs Outdoor Conditions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ComparisonCard
          title="Temperature"
          indoor={currentComparison.indoor.temperature.toFixed(1)}
          outdoor={currentComparison.outdoor.main.temp.toFixed(1)}
          unit="°C"
          color="#ff6b6b"
        />
        <ComparisonCard
          title="Humidity"
          indoor={currentComparison.indoor.humidity.toFixed(0)}
          outdoor={currentComparison.outdoor.main.humidity.toFixed(0)}
          unit="%"
          color="#4dabf7"
        />
        <ComparisonCard
          title="Pressure"
          indoor={currentComparison.indoor.pressure.toFixed(0)}
          outdoor={currentComparison.outdoor.main.pressure.toFixed(0)}
          unit="hPa"
          color="#fab005"
        />
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Temperature Trends</h3>
          <TrendChart
            data={combinedData.temperature}
            label="Temperature"
            color="#ff6b6b"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Humidity Trends</h3>
          <TrendChart
            data={combinedData.humidity}
            label="Humidity"
            color="#4dabf7"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Pressure Trends</h3>
          <TrendChart
            data={combinedData.pressure}
            label="Pressure"
            color="#fab005"
          />
        </div>
      </div>
    </div>
  );
}
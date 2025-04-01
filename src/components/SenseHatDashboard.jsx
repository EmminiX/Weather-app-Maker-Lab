import React from 'react';
import { useSenseHatData } from '../hooks/useSenseHatData';
import { SensorCard } from './SensorCard';

// Simple SVG icons
function TemperatureIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
    </svg>
  );
}

function HumidityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  );
}

function PressureIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M2 12h20"/>
    </svg>
  );
}

export function SenseHatDashboard() {
  const { currentData, historicalData, loading, error } = useSenseHatData();

  const sensors = [
    {
      title: 'Temperature',
      value: currentData?.temperature,
      unit: '°C',
      icon: <TemperatureIcon />,
      historicalData: historicalData?.map(d => ({
        timestamp: new Date(d.timestamp),
        value: d.temperature
      })),
      min: 15,
      max: 30,
      gradient: ['#48BB78', '#F56565']
    },
    {
      title: 'Humidity',
      value: currentData?.humidity,
      unit: '%',
      icon: <HumidityIcon />,
      historicalData: historicalData?.map(d => ({
        timestamp: new Date(d.timestamp),
        value: d.humidity
      })),
      min: 0,
      max: 100,
      gradient: ['#4299E1', '#90CDF4']
    },
    {
      title: 'Pressure',
      value: currentData?.pressure,
      unit: 'hPa',
      icon: <PressureIcon />,
      historicalData: historicalData?.map(d => ({
        timestamp: new Date(d.timestamp),
        value: d.pressure
      })),
      min: 980,
      max: 1020,
      gradient: ['#9F7AEA', '#ED64A6']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-black/30 backdrop-blur-md rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">SenseHat Readings - emmi.zone hub</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map((sensor) => (
            <SensorCard
              key={sensor.title}
              title={sensor.title}
              value={sensor.value}
              unit={sensor.unit}
              icon={sensor.icon}
              historicalData={sensor.historicalData}
              loading={loading}
              error={error}
              min={sensor.min}
              max={sensor.max}
              gradient={sensor.gradient}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
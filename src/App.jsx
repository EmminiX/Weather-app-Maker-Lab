import React from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { SenseHatDashboard } from './components/SenseHatDashboard';
import { WeatherDashboard } from './components/WeatherDashboard';
import { WeatherComparison } from './components/WeatherComparison';

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Header />
        <main className="container mx-auto px-4 py-4 font-lexend">
          <h1 className="text-3xl font-bold text-center mb-4">
            Weather Monitoring System
          </h1>
          <div className="space-y-8">
            <SenseHatDashboard />
            <WeatherDashboard />
            <WeatherComparison />
          </div>
        </main>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
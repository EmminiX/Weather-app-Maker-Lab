import React from 'react';
import { Footer } from './Footer';
import { MovingBackground } from './MovingBackground';

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Moving background */}
      <MovingBackground />
      
      {/* Main content */}
      <div className="relative z-10 pt-14 pb-16">
        {children}
        <Footer />
      </div>
    </div>
  );
}
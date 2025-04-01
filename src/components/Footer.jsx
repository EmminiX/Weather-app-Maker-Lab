import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Update the year in case the component stays mounted across year boundaries
    const interval = setInterval(() => {
      setYear(new Date().getFullYear());
    }, 1000 * 60 * 60); // Check every hour
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.footer 
      className="fixed bottom-0 left-0 right-0 z-[100] border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-4 text-gray-600 dark:text-gray-400 text-sm">
          {/* Copyright */}
          <p>Copyright © <span id="year">{year}</span> EMMI.zone</p>
          
          {/* Separator */}
          <p className="hidden md:block">|</p>
          
          {/* Creator attribution */}
          <p>By <a 
            href="https://emmi.zone" 
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            target="_blank" 
            rel="noopener noreferrer"
          >Emmi C.</a></p>
        </div>
      </div>
    </motion.footer>
  );
}

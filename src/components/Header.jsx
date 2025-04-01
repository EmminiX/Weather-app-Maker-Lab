import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="fixed top-0 z-[100] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            <a 
              href="https://emmi.zone" 
              className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              target="_blank" 
              rel="noopener noreferrer"
            >
              emmi.zone
            </a>
            {' - Weather Dashboard'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
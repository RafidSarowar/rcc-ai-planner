import React from 'react';
import { TigerIcon } from './Icons';
import ThemeSwitcher from './ThemeSwitcher';

const Header: React.FC = () => {
  return (
    <header className="bg-background-component shadow-md border-b border-border">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TigerIcon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold text-text-primary">
            TigerTracks
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeSwitcher />
          <a
            href="https://www.rcc.edu/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors hidden sm:block"
          >
            Visit RCC
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
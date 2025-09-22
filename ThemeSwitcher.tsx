import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { THEMES } from '../constants';
import { PaintBrushIcon } from './Icons';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative">
      <label htmlFor="theme-switcher" className="sr-only">Select Theme</label>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <PaintBrushIcon className="w-5 h-5 text-text-secondary" />
      </div>
      <select
        id="theme-switcher"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="block w-full pl-10 pr-4 py-2 text-base text-text-primary border-border bg-background-component hover:bg-background-component-hover focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md appearance-none"
      >
        {THEMES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;

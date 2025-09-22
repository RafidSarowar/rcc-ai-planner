import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { THEMES } from '../constants';
import type { Theme } from '../types';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyTheme = (themeName: string) => {
    const theme: Theme | undefined = THEMES.find(t => t.value === themeName);
    if (!theme) {
        console.warn(`Theme "${themeName}" not found.`);
        const defaultTheme = THEMES[0];
        if(!defaultTheme) return;
        // FIX: Use Object.keys to ensure value is treated as a string
        Object.keys(defaultTheme.colors).forEach((key) => {
            document.documentElement.style.setProperty(key, defaultTheme.colors[key]);
        });
        return;
    }

    const root = document.documentElement;
    // FIX: Use Object.keys to ensure value is treated as a string
    Object.keys(theme.colors).forEach((key) => {
        root.style.setProperty(key, theme.colors[key]);
    });
};


export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<string>(() => {
    try {
      const savedTheme = window.localStorage.getItem('app-theme');
      return savedTheme || 'tiger';
    } catch (error) {
      return 'tiger';
    }
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: string) => {
    try {
      window.localStorage.setItem('app-theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme to localStorage', error);
    }
    setThemeState(newTheme);
  };
  
  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
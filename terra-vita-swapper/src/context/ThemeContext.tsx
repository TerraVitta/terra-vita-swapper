import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isBlurEnabled: boolean;
  toggleBlur: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isBlurEnabled, setIsBlurEnabled] = useState<boolean>(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleBlur = () => {
    setIsBlurEnabled((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isBlurEnabled, toggleBlur }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
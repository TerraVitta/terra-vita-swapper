import React, { createContext, useContext, useState, useEffect } from 'react';

interface GlassBlurContextType {
  blurEnabled: boolean;
  toggleBlur: () => void;
}

const GlassBlurContext = createContext<GlassBlurContextType | undefined>(undefined);

export const GlassBlurProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blurEnabled, setBlurEnabled] = useState(true);

  useEffect(() => {
    // Persist blur preference to localStorage
    const saved = localStorage.getItem('glass-blur-enabled');
    if (saved !== null) {
      setBlurEnabled(JSON.parse(saved));
    }
    
    // Update CSS variable
    document.documentElement.style.setProperty(
      '--blur-enabled',
      saved !== null ? JSON.parse(saved) ? '1' : '0' : '1'
    );
  }, []);

  const toggleBlur = () => {
    setBlurEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('glass-blur-enabled', JSON.stringify(newValue));
      document.documentElement.style.setProperty(
        '--blur-enabled',
        newValue ? '1' : '0'
      );
      // Dispatch custom event for all glass elements to respond
      window.dispatchEvent(new CustomEvent('glassBlurToggled', { detail: { enabled: newValue } }));
      return newValue;
    });
  };

  return (
    <GlassBlurContext.Provider value={{ blurEnabled, toggleBlur }}>
      {children}
    </GlassBlurContext.Provider>
  );
};

export const useGlassBlur = () => {
  const context = useContext(GlassBlurContext);
  if (!context) {
    throw new Error('useGlassBlur must be used within GlassBlurProvider');
  }
  return context;
};

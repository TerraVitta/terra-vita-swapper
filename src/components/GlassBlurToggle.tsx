import React, { useState, useEffect } from 'react';
import { useGlassBlur } from '@/hooks/useGlassBlur';
import { Wind, Eye } from 'lucide-react';

export const GlassBlurToggle: React.FC = () => {
  const { blurEnabled, toggleBlur } = useGlassBlur();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleBlur();
    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <div className="fixed top-6 right-6 z-50 glass-blur-toggle-wrapper">
      <button
        onClick={handleToggle}
        className={`glass-blur-toggle transition-all duration-300 ease-out ${
          isAnimating ? 'animate-toggle-pulse' : ''
        }`}
        title={blurEnabled ? 'Disable glass blur for crystal clarity' : 'Enable glass blur for frosted effect'}
        aria-label="Toggle glass blur effect"
      >
        {/* Outer glow effect */}
        <div className="glass-blur-toggle-glow" />
        
        {/* Inner capsule */}
        <div className="glass-blur-toggle-inner">
          {/* Icon container with transition */}
          <div className="glass-blur-toggle-icon">
            {blurEnabled ? (
              <Wind className="h-5 w-5 animate-icon-rotate" />
            ) : (
              <Eye className="h-5 w-5 animate-icon-rotate" />
            )}
          </div>

          {/* Text label */}
          <span className="glass-blur-toggle-label">
            {blurEnabled ? 'Frosted' : 'Crystal'}
          </span>

          {/* Shimmer effect */}
          <div className="glass-blur-toggle-shimmer" />
        </div>

        {/* Ripple effect on click */}
        <div className="glass-blur-toggle-ripple" />
      </button>

      {/* Tooltip */}
      <div className="glass-blur-toggle-tooltip">
        <div className="glass-blur-tooltip-content">
          {blurEnabled 
            ? '✨ Frosted Glass - Soft & Diffused' 
            : '💎 Crystal Clear - Sharp & Precise'}
        </div>
      </div>
    </div>
  );
};

export default GlassBlurToggle;

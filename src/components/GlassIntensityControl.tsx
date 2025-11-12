/**
 * GlassIntensityControl - Allows users to adjust glass visual complexity
 * Low: CSS-only, Medium: CSS + animations, High: WebGL shaders
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Sparkles, Zap, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  detectDeviceCapabilities,
  getRecommendedGlassIntensity,
  setGlassIntensityPreference,
} from '@/lib/performanceDetect';

export type GlassIntensity = 'low' | 'medium' | 'high';

export const GlassIntensityControl: React.FC<{
  className?: string;
  onIntensityChange?: (intensity: GlassIntensity) => void;
}> = ({ className, onIntensityChange }) => {
  const [capabilities] = useState(() => detectDeviceCapabilities());
  const [intensity, setIntensity] = useState<GlassIntensity>(() => {
    const stored = localStorage.getItem('glassIntensity') as GlassIntensity | null;
    return stored || getRecommendedGlassIntensity(capabilities.performanceTier);
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Apply intensity to CSS variable
    document.documentElement.style.setProperty(
      '--glass-complexity',
      intensity === 'low' ? '0.5' : intensity === 'medium' ? '1' : '1.5'
    );

    // Save preference
    setGlassIntensityPreference(intensity);

    // Notify parent
    onIntensityChange?.(intensity);
  }, [intensity, onIntensityChange]);

  const intensityOptions: Array<{
    value: GlassIntensity;
    label: string;
    description: string;
    icon: React.ReactNode;
    disabled?: boolean;
  }> = [
    {
      value: 'low',
      label: 'Low',
      description: 'CSS-only, best performance',
      icon: <Zap className="h-4 w-4" />,
    },
    {
      value: 'medium',
      label: 'Medium',
      description: 'CSS + light animations',
      icon: <Droplets className="h-4 w-4" />,
    },
    {
      value: 'high',
      label: 'High',
      description: 'WebGL shaders + effects',
      icon: <Sparkles className="h-4 w-4" />,
      disabled: !capabilities.webglSupported,
    },
  ];

  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      {isOpen && (
        <div className="glass-panel liquid-shimmer rounded-2xl p-4 mb-4 space-y-3 animate-scale-in">
          <div className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Glass Quality
          </div>

          {intensityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => !option.disabled && setIntensity(option.value)}
              disabled={option.disabled}
              className={cn(
                'w-full glass-light rounded-xl p-3 text-left transition-all duration-300',
                'hover:scale-[1.02] active:scale-[0.98]',
                intensity === option.value && 'ring-2 ring-primary bg-primary/10',
                option.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center',
                    intensity === option.value ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                  )}
                >
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
                {intensity === option.value && (
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            </button>
          ))}

          {capabilities.performanceTier === 'low' && (
            <div className="text-xs text-muted-foreground bg-accent/50 rounded-lg p-2">
              ℹ️ Your device may experience better performance with Low or Medium settings.
            </div>
          )}
        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-panel liquid-shimmer rounded-2xl px-5 py-3 h-auto border-0 hover:scale-105 transition-all duration-500 shadow-xl"
        title="Adjust Glass Quality"
      >
        <Settings className="h-5 w-5 text-primary" />
      </Button>
    </div>
  );
};

export default GlassIntensityControl;

/**
 * FluidBackground - Interactive fluid simulation background
 * Full GPU-accelerated Navier-Stokes simulation with pointer interaction
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { FluidSimulation, type PointerData } from '@/lib/fluidSimulation';
import { detectDeviceCapabilities } from '@/lib/performanceDetect';

export interface FluidBackgroundProps {
  /** Fluid viscosity (0.0001-0.02) */
  viscosity?: number;
  /** Vorticity strength (0-50) */
  vorticityStrength?: number;
  /** Enable pointer interaction */
  interactive?: boolean;
  /** Simulation resolution multiplier */
  resolutionScale?: number;
  /** Enable CSS fallback */
  forceFallback?: boolean;
  /** Complexity level: low, medium, high */
  complexity?: 'low' | 'medium' | 'high';
  /** Children (glass panels) */
  children?: React.ReactNode;
  /** className */
  className?: string;
}

export const FluidBackground: React.FC<FluidBackgroundProps> = ({
  viscosity = 0.001,
  vorticityStrength = 20,
  interactive = true,
  resolutionScale = 0.5,
  forceFallback = false,
  complexity = 'medium',
  children,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<FluidSimulation | null>(null);
  const animationFrameRef = useRef<number>();
  const pointersRef = useRef<Map<number, PointerData>>(new Map());
  
  const { theme } = useTheme();
  const [useWebGL, setUseWebGL] = useState(true);
  const [capabilities] = useState(() => detectDeviceCapabilities());
  
  // Determine if we should use WebGL
  const shouldUseWebGL = useWebGL && 
    !forceFallback && 
    capabilities.webglSupported && 
    capabilities.performanceTier !== 'low' &&
    !capabilities.prefersReducedMotion;
  
  // Get theme colors for dye injection
  const getThemeColor = useCallback((): [number, number, number] => {
    if (theme === 'dark') {
      // Dark mode: cool blues and purples
      const colors: Array<[number, number, number]> = [
        [0.3, 0.5, 0.9], // Blue
        [0.6, 0.3, 0.9], // Purple
        [0.3, 0.8, 0.8], // Cyan
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    } else {
      // Light mode: warm pastels
      const colors: Array<[number, number, number]> = [
        [0.9, 0.6, 0.3], // Orange
        [0.9, 0.3, 0.6], // Pink
        [0.6, 0.9, 0.4], // Green
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  }, [theme]);
  
  // Initialize fluid simulation
  useEffect(() => {
    if (!shouldUseWebGL || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio, 2);
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const simRes = complexity === 'high' ? 512 : complexity === 'medium' ? 384 : 256;
    
    try {
      simulationRef.current = new FluidSimulation(canvas, {
        viscosity,
        vorticityStrength,
        pressureIterations: complexity === 'high' ? 25 : 20,
        dyeDecay: 0.985,
        simWidth: simRes,
        simHeight: simRes,
        dyeResolution: complexity === 'high' ? 1.5 : 1.0,
        splatRadius: 0.003,
      });
      
      // Animation loop
      const animate = (time: number) => {
        if (simulationRef.current) {
          simulationRef.current.update(time);
          simulationRef.current.render(null);
        }
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    } catch (error) {
      console.warn('Failed to initialize fluid simulation, falling back to CSS:', error);
      setUseWebGL(false);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (simulationRef.current) {
        simulationRef.current.destroy();
      }
    };
  }, [shouldUseWebGL, viscosity, vorticityStrength, complexity]);
  
  // Handle pointer events
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!interactive || !simulationRef.current || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    
    const pointer: PointerData = {
      id: e.pointerId,
      x,
      y,
      dx: 0,
      dy: 0,
      down: true,
      moved: false,
      color: getThemeColor(),
    };
    
    pointersRef.current.set(e.pointerId, pointer);
    simulationRef.current.addPointer(pointer);
    
    // Initial splash
    const force = e.pointerType === 'touch' ? 15 : 10;
    const dx = (Math.random() - 0.5) * force;
    const dy = (Math.random() - 0.5) * force;
    simulationRef.current.updatePointer(e.pointerId, x + dx * 0.001, y + dy * 0.001);
  }, [interactive, getThemeColor]);
  
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!interactive || !simulationRef.current || !canvasRef.current) return;
    
    const pointer = pointersRef.current.get(e.pointerId);
    if (!pointer) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    
    simulationRef.current.updatePointer(e.pointerId, x, y);
  }, [interactive]);
  
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!interactive || !simulationRef.current) return;
    
    simulationRef.current.removePointer(e.pointerId);
    pointersRef.current.delete(e.pointerId);
  }, [interactive]);
  
  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !simulationRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;
      
      simulationRef.current.resize(rect.width * dpr, rect.height * dpr);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div
      ref={containerRef}
      className={cn('fixed inset-0 -z-10 overflow-hidden', className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* WebGL Canvas */}
      {shouldUseWebGL && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ 
            touchAction: 'none',
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, hsl(220, 40%, 8%), hsl(260, 40%, 12%))' 
              : 'linear-gradient(135deg, hsl(210, 50%, 92%), hsl(240, 45%, 95%))'
          }}
        />
      )}
      
      {/* CSS Fallback */}
      {!shouldUseWebGL && (
        <div 
          className={cn(
            'absolute inset-0 w-full h-full',
            'bg-gradient-to-br',
            theme === 'dark' 
              ? 'from-[hsl(220,40%,8%)] via-[hsl(240,40%,10%)] to-[hsl(260,40%,12%)]'
              : 'from-[hsl(210,50%,92%)] via-[hsl(220,45%,94%)] to-[hsl(240,45%,95%)]'
          )}
          style={{
            backgroundSize: '400% 400%',
            animation: capabilities.prefersReducedMotion ? 'none' : 'gradient-shift 15s ease infinite',
          }}
        />
      )}
      
      {/* Content overlay */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default FluidBackground;

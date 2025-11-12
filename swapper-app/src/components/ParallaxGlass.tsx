/**
 * ParallaxGlass - Parallax and refraction effects for glass panels
 * Adds depth and motion-based interactivity
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { throttle, debounce } from '@/lib/performanceDetect';

export interface ParallaxGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Parallax intensity (0-1) */
  intensity?: number;
  /** Enable tilt effect */
  enableTilt?: boolean;
  /** Enable device orientation (mobile) */
  enableOrientation?: boolean;
  /** Easing function */
  easing?: 'linear' | 'easeOut' | 'spring';
  /** Children */
  children?: React.ReactNode;
}

export const ParallaxGlass = React.forwardRef<HTMLDivElement, ParallaxGlassProps>(
  (
    {
      intensity = 0.5,
      enableTilt = true,
      enableOrientation = true,
      easing = 'spring',
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Easing functions
    const easingFunctions = {
      linear: (t: number) => t,
      easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
      spring: (t: number) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
      },
    };

    const ease = easingFunctions[easing];

    // Handle mouse movement for parallax
    const handleMouseMove = useCallback(
      throttle((e: MouseEvent) => {
        const container = containerRef.current;
        if (!container || !isHovered) return;

        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate normalized position (-1 to 1)
        const x = (e.clientX - centerX) / (rect.width / 2);
        const y = (e.clientY - centerY) / (rect.height / 2);

        // Apply intensity and easing
        const easedX = ease(Math.abs(x)) * Math.sign(x) * intensity;
        const easedY = ease(Math.abs(y)) * Math.sign(y) * intensity;

        setTransform({
          x: easedX * 20,
          y: easedY * 20,
          rotateX: enableTilt ? -easedY * 8 : 0,
          rotateY: enableTilt ? easedX * 8 : 0,
        });
      }, 16),
      [isHovered, intensity, enableTilt, ease]
    );

    // Handle device orientation (mobile)
    useEffect(() => {
      if (!enableOrientation) return;

      const handleOrientation = throttle((e: DeviceOrientationEvent) => {
        if (!containerRef.current || isHovered) return;

        // Normalize orientation values (-1 to 1)
        const beta = e.beta ? e.beta / 90 : 0; // front-back tilt
        const gamma = e.gamma ? e.gamma / 90 : 0; // left-right tilt

        const easedGamma = ease(Math.abs(gamma)) * Math.sign(gamma) * intensity;
        const easedBeta = ease(Math.abs(beta)) * Math.sign(beta) * intensity;

        setTransform({
          x: easedGamma * 15,
          y: easedBeta * 15,
          rotateX: enableTilt ? -easedBeta * 5 : 0,
          rotateY: enableTilt ? easedGamma * 5 : 0,
        });
      }, 16);

      window.addEventListener('deviceorientation', handleOrientation as any);
      return () => window.removeEventListener('deviceorientation', handleOrientation as any);
    }, [enableOrientation, isHovered, intensity, enableTilt, ease]);

    // Mouse enter/leave handlers
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => {
        setIsHovered(false);
        setTransform({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
      };

      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, []);

    // Global mouse move listener
    useEffect(() => {
      window.addEventListener('mousemove', handleMouseMove as any);
      return () => window.removeEventListener('mousemove', handleMouseMove as any);
    }, [handleMouseMove]);

    // Transition timing based on easing
    const transitionDuration = easing === 'spring' ? '0.6s' : '0.3s';
    const transitionTiming = easing === 'spring' ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : 
                             easing === 'easeOut' ? 'cubic-bezier(0.16, 1, 0.3, 1)' : 'linear';

    const transformStyle: React.CSSProperties = {
      transform: `
        perspective(1400px)
        translate3d(${transform.x}px, ${transform.y}px, 0)
        rotateX(${transform.rotateX}deg)
        rotateY(${transform.rotateY}deg)
      `,
      transition: `transform ${transitionDuration} ${transitionTiming}`,
      transformStyle: 'preserve-3d',
      willChange: isHovered ? 'transform' : 'auto',
    };

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn('relative', className)}
        style={{ ...transformStyle, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ParallaxGlass.displayName = 'ParallaxGlass';

export default ParallaxGlass;

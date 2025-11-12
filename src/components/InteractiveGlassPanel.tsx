/**
 * InteractiveGlassPanel - Fully interactive liquid-glass panel with physics
 * Includes hover tilt, refraction, drag, and fluid coupling
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

export interface InteractiveGlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Panel variant */
  variant?: 'light' | 'medium' | 'heavy';
  /** Enable interactive hover effects */
  interactive?: boolean;
  /** Enable draggable */
  draggable?: boolean;
  /** Enable keyboard focus */
  focusable?: boolean;
  /** ARIA label */
  a11yLabel?: string;
  /** Refraction strength (0-1) */
  refractionStrength?: number;
  /** Hover callbacks */
  onHoverStart?: (pointer: { x: number; y: number }) => void;
  onHoverMove?: (pointer: { x: number; y: number }) => void;
  onHoverEnd?: () => void;
  onPanelDragStart?: () => void;
  onPanelDrag?: (x: number, y: number) => void;
  onPanelDrop?: () => void;
  /** Children */
  children?: React.ReactNode;
}

interface SpringState {
  position: { x: number; y: number; scale: number; rotateX: number; rotateY: number };
  velocity: { x: number; y: number; scale: number; rotateX: number; rotateY: number };
  target: { x: number; y: number; scale: number; rotateX: number; rotateY: number };
}

const SPRING_CONFIG = {
  hoverTiltStiffness: 120,
  hoverTiltDamping: 12,
  hoverTiltMax: 8,
  hoverScaleMax: 1.02,
  hoverRefractionMax: 0.035,
};

export const InteractiveGlassPanel = React.forwardRef<HTMLDivElement, InteractiveGlassPanelProps>(
  (
    {
      variant = 'medium',
      interactive = true,
      draggable = false,
      focusable = true,
      a11yLabel,
      refractionStrength = 0.5,
      onHoverStart,
      onHoverMove,
      onHoverEnd,
      onPanelDragStart,
      onPanelDrag,
      onPanelDrop,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [spring, setSpring] = useState<SpringState>({
      position: { x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0 },
      velocity: { x: 0, y: 0, scale: 0, rotateX: 0, rotateY: 0 },
      target: { x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0 },
    });
    
    const animationFrameRef = useRef<number>();
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    
    // Spring physics simulation
    const updateSpring = useCallback(() => {
      setSpring(prev => {
        const dt = 1 / 60; // Fixed timestep
        const stiffness = SPRING_CONFIG.hoverTiltStiffness;
        const damping = SPRING_CONFIG.hoverTiltDamping;
        
        const newState = { ...prev };
        
        // Update each spring parameter
        (['x', 'y', 'scale', 'rotateX', 'rotateY'] as const).forEach(key => {
          const force = (prev.target[key] - prev.position[key]) * stiffness;
          const dampingForce = prev.velocity[key] * damping;
          
          newState.velocity[key] = prev.velocity[key] + (force - dampingForce) * dt;
          newState.position[key] = prev.position[key] + newState.velocity[key] * dt;
        });
        
        return newState;
      });
      
      animationFrameRef.current = requestAnimationFrame(updateSpring);
    }, []);
    
    // Start spring animation
    useEffect(() => {
      if (interactive && (isHovered || isDragging)) {
        animationFrameRef.current = requestAnimationFrame(updateSpring);
      }
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [interactive, isHovered, isDragging, updateSpring]);
    
    // Pointer enter
    const handlePointerEnter = useCallback((e: React.PointerEvent) => {
      if (!interactive) return;
      
      setIsHovered(true);
      
      if (onHoverStart) {
        const rect = panelRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          onHoverStart({ x, y });
        }
      }
    }, [interactive, onHoverStart]);
    
    // Pointer move
    const handlePointerMove = useCallback((e: React.PointerEvent) => {
      if (!interactive || !panelRef.current) return;
      
      const rect = panelRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Normalized position (-1 to 1)
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      
      if (isDragging) {
        // Drag mode
        setSpring(prev => ({
          ...prev,
          target: {
            x: e.clientX - dragOffsetRef.current.x,
            y: e.clientY - dragOffsetRef.current.y,
            scale: 1.05,
            rotateX: 0,
            rotateY: 0,
          },
        }));
        
        if (onPanelDrag) {
          onPanelDrag(e.clientX - dragOffsetRef.current.x, e.clientY - dragOffsetRef.current.y);
        }
      } else {
        // Hover mode
        setSpring(prev => ({
          ...prev,
          target: {
            x: 0,
            y: 0,
            scale: SPRING_CONFIG.hoverScaleMax,
            rotateX: -y * SPRING_CONFIG.hoverTiltMax,
            rotateY: x * SPRING_CONFIG.hoverTiltMax,
          },
        }));
      }
      
      if (onHoverMove) {
        const normalizedX = (e.clientX - rect.left) / rect.width;
        const normalizedY = (e.clientY - rect.top) / rect.height;
        onHoverMove({ x: normalizedX, y: normalizedY });
      }
    }, [interactive, isDragging, onHoverMove, onPanelDrag]);
    
    // Pointer leave
    const handlePointerLeave = useCallback(() => {
      if (!interactive) return;
      
      setIsHovered(false);
      setIsDragging(false);
      
      // Reset spring
      setSpring(prev => ({
        ...prev,
        target: { x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0 },
      }));
      
      if (onHoverEnd) {
        onHoverEnd();
      }
    }, [interactive, onHoverEnd]);
    
    // Pointer down
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
      if (!draggable || !panelRef.current) return;
      
      const rect = panelRef.current.getBoundingClientRect();
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      
      setIsDragging(true);
      
      if (onPanelDragStart) {
        onPanelDragStart();
      }
    }, [draggable, onPanelDragStart]);
    
    // Pointer up
    const handlePointerUp = useCallback(() => {
      if (!isDragging) return;
      
      setIsDragging(false);
      
      // Reset to center with momentum
      setSpring(prev => ({
        ...prev,
        target: { x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0 },
      }));
      
      if (onPanelDrop) {
        onPanelDrop();
      }
    }, [isDragging, onPanelDrop]);
    
    // Glass variant classes
    const variantClass = {
      light: 'glass-light',
      medium: 'glass-panel',
      heavy: 'glass-heavy',
    }[variant];
    
    // Transform style
    const transformStyle: React.CSSProperties = {
      transform: `
        translate3d(${spring.position.x}px, ${spring.position.y}px, 0)
        scale(${spring.position.scale})
        perspective(1000px)
        rotateX(${spring.position.rotateX}deg)
        rotateY(${spring.position.rotateY}deg)
      `,
      willChange: isHovered || isDragging ? 'transform' : 'auto',
      transition: 'none', // Spring handles all animation
    };
    
    return (
      <div
        ref={(node) => {
          (panelRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          'relative',
          variantClass,
          'liquid-shimmer crystal-edge transition-glass',
          interactive && 'cursor-pointer',
          draggable && isDragging && 'cursor-grabbing',
          draggable && !isDragging && 'cursor-grab',
          className
        )}
        style={{ ...transformStyle, ...style }}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        role={interactive ? 'button' : undefined}
        tabIndex={focusable ? 0 : undefined}
        aria-label={a11yLabel}
        {...props}
      >
        {/* Refraction overlay effect */}
        {interactive && isHovered && (
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: `radial-gradient(circle at ${50 + spring.position.rotateY * 2}% ${50 - spring.position.rotateX * 2}%, 
                rgba(255,255,255,${refractionStrength * 0.3}) 0%, 
                transparent 60%)`,
              mixBlendMode: 'overlay',
            }}
          />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Ripple effect on hover */}
        {interactive && isHovered && (
          <div
            className="absolute inset-0 pointer-events-none animate-[ripple_0.6s_ease-out]"
            style={{
              background: `radial-gradient(circle at ${50 + spring.position.rotateY * 3}% ${50 - spring.position.rotateX * 3}%, 
                hsla(var(--primary), 0.15) 0%, 
                transparent 50%)`,
            }}
          />
        )}
      </div>
    );
  }
);

InteractiveGlassPanel.displayName = 'InteractiveGlassPanel';

export default InteractiveGlassPanel;

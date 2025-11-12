/**
 * LiquidGlassPanel - Advanced glass panel with WebGL shader support and CSS fallback
 * Includes parallax, refraction, physics-based animations, and accessibility features
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import {
  detectDeviceCapabilities,
  FrameRateMonitor,
  getRecommendedGlassIntensity,
  getOptimizedShaderSettings,
  throttle,
} from '@/lib/performanceDetect';
import {
  createShader,
  createProgram,
  liquidGlassFragmentShader,
  liquidGlassVertexShader,
  defaultUniforms,
  type ShaderUniforms,
} from '@/lib/glassShader';
import { TiltSpring, computeTiltFromPointer } from '@/utils/springPhysics';
import { computeRefractiveDisplacement, PanelSlosh } from '@/utils/fluidPanelCoupling';

export interface LiquidGlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Glass tint color override */
  tint?: string;
  /** Blur strength (0-1) */
  blur?: number;
  /** Opacity (0-1) */
  opacity?: number;
  /** Refraction strength (0-1) */
  refractionStrength?: number;
  /** Enable interactive effects */
  interactive?: boolean;
  /** Glass variant */
  variant?: 'light' | 'medium' | 'heavy';
  /** Enable WebGL shader (auto-detected if undefined) */
  useWebGL?: boolean;
  /** Enable parallax effect */
  enableParallax?: boolean;
  /** Enable physics animations */
  enablePhysics?: boolean;
  /** Enable fluid coupling (panels affect fluid) */
  enableFluidCoupling?: boolean;
  /** Hover tilt max angle in degrees */
  hoverTiltMax?: number;
  /** Hover physics config */
  hoverTiltStiffness?: number;
  hoverTiltDamping?: number;
  /** Callbacks */
  onHoverStart?: (pointer: { x: number; y: number }) => void;
  onHoverMove?: (pointer: { x: number; y: number }) => void;
  onHoverEnd?: () => void;
  /** Children */
  children?: React.ReactNode;
}

export const LiquidGlassPanel = React.forwardRef<HTMLDivElement, LiquidGlassPanelProps>(
  (
    {
      tint,
      blur = 0.7,
      opacity = 0.8,
      refractionStrength = 0.5,
      interactive = true,
      variant = 'medium',
      useWebGL,
      enableParallax = true,
      enablePhysics = true,
      enableFluidCoupling = false,
      hoverTiltMax = 8,
      hoverTiltStiffness = 120,
      hoverTiltDamping = 12,
      onHoverStart,
      onHoverMove,
      onHoverEnd,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();
    
    const [capabilities] = useState(() => detectDeviceCapabilities());
    const [shouldUseWebGL, setShouldUseWebGL] = useState(
      useWebGL ?? (capabilities.webglSupported && capabilities.performanceTier !== 'low')
    );
    
    const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
    const [isHovered, setIsHovered] = useState(false);
    const [hoverIntensity, setHoverIntensity] = useState(0);
    const frameRateMonitor = useRef(new FrameRateMonitor());
    const animationFrameId = useRef<number>();
    const uniformsRef = useRef<ShaderUniforms>({ ...defaultUniforms });
    const tiltSpring = useRef<TiltSpring>(
      new TiltSpring({ stiffness: hoverTiltStiffness, damping: hoverTiltDamping })
    );
    const slosh = useRef<PanelSlosh>(new PanelSlosh(16, 0.85, 40));

    // Performance-based settings
    const settings = getOptimizedShaderSettings(
      getRecommendedGlassIntensity(capabilities.performanceTier)
    );

    // Respect prefers-reduced-motion
    const enableAnimations = !capabilities.prefersReducedMotion && enablePhysics;

    // WebGL initialization
    useEffect(() => {
      if (!shouldUseWebGL || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const gl = canvas.getContext('webgl', { 
        alpha: true, 
        premultipliedAlpha: false,
        antialias: true,
      });

      if (!gl) {
        console.warn('WebGL not available, falling back to CSS');
        setShouldUseWebGL(false);
        return;
      }

      // Create shaders
      const vertexShader = createShader(gl, gl.VERTEX_SHADER, liquidGlassVertexShader);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, liquidGlassFragmentShader);

      if (!vertexShader || !fragmentShader) {
        setShouldUseWebGL(false);
        return;
      }

      // Create program
      const program = createProgram(gl, vertexShader, fragmentShader);
      if (!program) {
        setShouldUseWebGL(false);
        return;
      }

      gl.useProgram(program);

      // Setup geometry (full-screen quad)
      const positions = new Float32Array([
        -1, -1,  1, -1,  -1, 1,
        -1, 1,   1, -1,   1, 1,
      ]);
      const texCoords = new Float32Array([
        0, 1,  1, 1,  0, 0,
        0, 0,  1, 1,  1, 0,
      ]);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const positionLoc = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      const texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

      const texCoordLoc = gl.getAttribLocation(program, 'a_texCoord');
      gl.enableVertexAttribArray(texCoordLoc);
      gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

      // Get uniform locations
      const uniformLocations = {
        u_time: gl.getUniformLocation(program, 'u_time'),
        u_resolution: gl.getUniformLocation(program, 'u_resolution'),
        u_mouse: gl.getUniformLocation(program, 'u_mouse'),
        u_themeIntensity: gl.getUniformLocation(program, 'u_themeIntensity'),
        u_refraction: gl.getUniformLocation(program, 'u_refraction'),
        u_curlScale: gl.getUniformLocation(program, 'u_curlScale'),
        u_curlSpeed: gl.getUniformLocation(program, 'u_curlSpeed'),
        u_curlAmplitude: gl.getUniformLocation(program, 'u_curlAmplitude'),
        u_chromaticAberration: gl.getUniformLocation(program, 'u_chromaticAberration'),
        u_fresnelPower: gl.getUniformLocation(program, 'u_fresnelPower'),
        u_fresnelBias: gl.getUniformLocation(program, 'u_fresnelBias'),
        u_lightDirection: gl.getUniformLocation(program, 'u_lightDirection'),
        u_roughness: gl.getUniformLocation(program, 'u_roughness'),
        u_specularIntensity: gl.getUniformLocation(program, 'u_specularIntensity'),
        u_hoverIntensity: gl.getUniformLocation(program, 'u_hoverIntensity'),
        u_hoverCenter: gl.getUniformLocation(program, 'u_hoverCenter'),
        u_sloshAmplitude: gl.getUniformLocation(program, 'u_sloshAmplitude'),
      };

      // Render loop
      let startTime = performance.now();
      const render = () => {
        if (!canvasRef.current) return;

        // Update frame rate monitor
        frameRateMonitor.current.update();
        
        // Auto-fallback if performance drops
        if (frameRateMonitor.current.shouldFallback()) {
          console.warn('Performance dropped, falling back to CSS');
          setShouldUseWebGL(false);
          return;
        }

        const currentTime = (performance.now() - startTime) / 1000;
        const dt = 1 / 60; // fixed timestep

        // Update physics
        const tilt = tiltSpring.current.update(dt);
        slosh.current.update(dt);
        
        // Update uniforms
        const uniforms = uniformsRef.current;
        uniforms.u_time = enableAnimations ? currentTime : 0;
        uniforms.u_resolution = [canvas.width, canvas.height];
        uniforms.u_mouse = [mousePosition.x, mousePosition.y];
        uniforms.u_themeIntensity = theme === 'dark' ? 1 : 0;
        uniforms.u_refraction = refractionStrength * settings.refraction;
        uniforms.u_curlScale = settings.curlScale;
        uniforms.u_curlSpeed = settings.curlSpeed;
        uniforms.u_curlAmplitude = settings.curlAmplitude;
        uniforms.u_chromaticAberration = settings.chromaticAberration;
        uniforms.u_hoverIntensity = hoverIntensity;
        uniforms.u_hoverCenter = [mousePosition.x, mousePosition.y];
        
        // Compute slosh amplitude from physics
        const sloshHeights = slosh.current.getHeights();
        const avgSlosh = sloshHeights.reduce((a, b) => a + Math.abs(b), 0) / sloshHeights.length;
        uniforms.u_sloshAmplitude = avgSlosh * 0.1;

        // Set uniforms
        gl.uniform1f(uniformLocations.u_time, uniforms.u_time);
        gl.uniform2f(uniformLocations.u_resolution, uniforms.u_resolution[0], uniforms.u_resolution[1]);
        gl.uniform2f(uniformLocations.u_mouse, uniforms.u_mouse[0], uniforms.u_mouse[1]);
        gl.uniform1f(uniformLocations.u_themeIntensity, uniforms.u_themeIntensity);
        gl.uniform1f(uniformLocations.u_refraction, uniforms.u_refraction);
        gl.uniform1f(uniformLocations.u_curlScale, uniforms.u_curlScale);
        gl.uniform1f(uniformLocations.u_curlSpeed, uniforms.u_curlSpeed);
        gl.uniform1f(uniformLocations.u_curlAmplitude, uniforms.u_curlAmplitude);
        gl.uniform1f(uniformLocations.u_chromaticAberration, uniforms.u_chromaticAberration);
        gl.uniform1f(uniformLocations.u_fresnelPower, uniforms.u_fresnelPower);
        gl.uniform1f(uniformLocations.u_fresnelBias, uniforms.u_fresnelBias);
        gl.uniform3f(uniformLocations.u_lightDirection, 
          uniforms.u_lightDirection[0],
          uniforms.u_lightDirection[1],
          uniforms.u_lightDirection[2]
        );
        gl.uniform1f(uniformLocations.u_roughness, uniforms.u_roughness);
        gl.uniform1f(uniformLocations.u_specularIntensity, uniforms.u_specularIntensity);
        gl.uniform1f(uniformLocations.u_hoverIntensity, uniforms.u_hoverIntensity);
        gl.uniform2f(uniformLocations.u_hoverCenter, uniforms.u_hoverCenter[0], uniforms.u_hoverCenter[1]);
        gl.uniform1f(uniformLocations.u_sloshAmplitude, uniforms.u_sloshAmplitude);

        // Render
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        animationFrameId.current = requestAnimationFrame(render);
      };

      render();

      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }, [shouldUseWebGL, mousePosition, theme, refractionStrength, enableAnimations, settings]);

    // Handle mouse/touch movement for parallax and hover physics
    const handlePointerMove = useCallback(
      throttle((e: React.PointerEvent<HTMLDivElement>) => {
        if (!interactive) return;

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        setMousePosition({ x, y });

        if (enableParallax && isHovered) {
          // Compute tilt based on pointer position
          const tilt = computeTiltFromPointer(x, y, 0.5, 0.5, hoverTiltMax);
          tiltSpring.current.setTarget(tilt.pitch, tilt.yaw);

          // Inject slosh impulse at pointer x
          slosh.current.impulse(x, (x - 0.5) * 2);

          onHoverMove?.({ x, y });
        }
      }, 16),
      [interactive, enableParallax, isHovered, hoverTiltMax, onHoverMove]
    );

    // Handle hover enter
    const handlePointerEnter = useCallback(() => {
      setIsHovered(true);
      setHoverIntensity(1);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        onHoverStart?.({ x: 0.5, y: 0.5 });
      }
    }, [onHoverStart]);

    // Handle hover leave
    const handlePointerLeave = useCallback(() => {
      setIsHovered(false);
      setHoverIntensity(0);
      setMousePosition({ x: 0.5, y: 0.5 });
      tiltSpring.current.reset();
      onHoverEnd?.();
    }, [onHoverEnd]);

    // CSS fallback classes
    const variantClass = {
      light: 'glass-light',
      medium: 'glass-panel',
      heavy: 'glass-heavy',
    }[variant];

    // Inline styles for custom properties
    const customStyle: React.CSSProperties = {
      ...style,
      ...(tint && { '--glass-tint': tint } as any),
      ...(blur !== 0.7 && { '--blur-multiplier': blur } as any),
      ...(opacity !== 0.8 && { opacity } as any),
    };

    // Physics-based hover animation
    const hoverClass = enablePhysics && !capabilities.prefersReducedMotion ? 'refract-hover' : '';

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          'relative',
          !shouldUseWebGL && variantClass,
          !shouldUseWebGL && 'liquid-shimmer crystal-edge',
          hoverClass,
          interactive && 'cursor-pointer',
          className
        )}
        style={customStyle}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        role={props.onClick ? 'button' : undefined}
        tabIndex={props.onClick ? 0 : undefined}
        aria-label={props['aria-label']}
        {...props}
      >
        {/* WebGL Canvas (if enabled) */}
        {shouldUseWebGL && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            width={1920}
            height={1080}
            style={{
              borderRadius: 'inherit',
              mixBlendMode: 'normal',
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

LiquidGlassPanel.displayName = 'LiquidGlassPanel';

export default LiquidGlassPanel;

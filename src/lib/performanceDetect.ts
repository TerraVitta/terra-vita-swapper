/**
 * Performance Detection Utilities
 * Automatically detects device capabilities and adjusts visual quality
 */

export interface DeviceCapabilities {
  webglSupported: boolean;
  backdropFilterSupported: boolean;
  performanceTier: 'low' | 'medium' | 'high';
  prefersReducedMotion: boolean;
  devicePixelRatio: number;
  maxTextureSize: number;
}

/**
 * Detects device capabilities and performance tier
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  const capabilities: DeviceCapabilities = {
    webglSupported: false,
    backdropFilterSupported: false,
    performanceTier: 'medium',
    prefersReducedMotion: false,
    devicePixelRatio: window.devicePixelRatio || 1,
    maxTextureSize: 2048,
  };

  // Check WebGL support
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  capabilities.webglSupported = !!gl;
  
  if (gl && 'getParameter' in gl) {
    capabilities.maxTextureSize = (gl as WebGLRenderingContext).getParameter(
      (gl as WebGLRenderingContext).MAX_TEXTURE_SIZE
    );
  }

  // Check backdrop-filter support
  capabilities.backdropFilterSupported = CSS.supports('backdrop-filter', 'blur(10px)') || 
                                         CSS.supports('-webkit-backdrop-filter', 'blur(10px)');

  // Check prefers-reduced-motion
  capabilities.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Determine performance tier based on various factors
  capabilities.performanceTier = determinePerformanceTier(capabilities);

  return capabilities;
}

/**
 * Determines performance tier based on device characteristics
 */
function determinePerformanceTier(capabilities: DeviceCapabilities): 'low' | 'medium' | 'high' {
  let score = 0;

  // WebGL support
  if (capabilities.webglSupported) score += 3;
  
  // Backdrop filter support
  if (capabilities.backdropFilterSupported) score += 2;
  
  // High DPR devices (Retina, etc.)
  if (capabilities.devicePixelRatio >= 2) score += 2;
  
  // Large texture support indicates better GPU
  if (capabilities.maxTextureSize >= 4096) score += 2;
  
  // Hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2;
  if (cores >= 8) score += 3;
  else if (cores >= 4) score += 2;
  else score += 1;
  
  // Memory (if available)
  const memory = (navigator as any).deviceMemory;
  if (memory) {
    if (memory >= 8) score += 2;
    else if (memory >= 4) score += 1;
  }

  // Classify performance tier
  if (score >= 10) return 'high';
  if (score >= 6) return 'medium';
  return 'low';
}

/**
 * Frame rate monitor for auto-fallback detection
 */
export class FrameRateMonitor {
  private frameTimes: number[] = [];
  private lastFrameTime: number = performance.now();
  private readonly sampleSize: number = 60;
  private readonly targetFPS: number = 45;

  update(): void {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.frameTimes.push(delta);
    if (this.frameTimes.length > this.sampleSize) {
      this.frameTimes.shift();
    }
  }

  getAverageFPS(): number {
    if (this.frameTimes.length === 0) return 60;
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return 1000 / avgFrameTime;
  }

  shouldFallback(): boolean {
    return this.frameTimes.length >= this.sampleSize && this.getAverageFPS() < this.targetFPS;
  }

  reset(): void {
    this.frameTimes = [];
    this.lastFrameTime = performance.now();
  }
}

/**
 * Gets recommended glass intensity based on performance tier
 */
export function getRecommendedGlassIntensity(tier: 'low' | 'medium' | 'high'): 'low' | 'medium' | 'high' {
  const userPreference = localStorage.getItem('glassIntensity') as 'low' | 'medium' | 'high' | null;
  
  if (userPreference) {
    return userPreference;
  }
  
  return tier;
}

/**
 * Sets glass intensity preference
 */
export function setGlassIntensityPreference(intensity: 'low' | 'medium' | 'high'): void {
  localStorage.setItem('glassIntensity', intensity);
}

/**
 * Gets optimized shader settings based on performance tier
 */
export function getOptimizedShaderSettings(tier: 'low' | 'medium' | 'high') {
  const settings = {
    low: {
      curlScale: 2.0,
      curlSpeed: 0.1,
      curlAmplitude: 0.8,
      chromaticAberration: 0.001,
      refraction: 0.02,
      updateInterval: 32, // ~30fps
    },
    medium: {
      curlScale: 3.0,
      curlSpeed: 0.15,
      curlAmplitude: 1.2,
      chromaticAberration: 0.003,
      refraction: 0.04,
      updateInterval: 16, // ~60fps
    },
    high: {
      curlScale: 4.0,
      curlSpeed: 0.2,
      curlAmplitude: 1.5,
      chromaticAberration: 0.005,
      refraction: 0.06,
      updateInterval: 8, // ~120fps
    },
  };

  return settings[tier];
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

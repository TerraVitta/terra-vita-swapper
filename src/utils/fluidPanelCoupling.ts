/**
 * Fluid-Panel Coupling Utilities
 * Handles two-way interaction between glass panels and fluid simulation
 */

import type { ExternalForce } from '@/lib/fluidSimulation';

export interface PanelState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number; // velocity
  vy: number;
  mass: number;
}

export interface CouplingConfig {
  enabled: boolean;
  strength: number; // 0-1, how much panels affect fluid
  velocityThreshold: number; // minimum velocity to inject force
  radiusMultiplier: number; // force field radius relative to panel size
}

/**
 * Compute external forces from moving panels
 */
export function computePanelForces(
  panels: PanelState[],
  config: CouplingConfig
): ExternalForce[] {
  if (!config.enabled) return [];

  const forces: ExternalForce[] = [];

  for (const panel of panels) {
    const speed = Math.sqrt(panel.vx * panel.vx + panel.vy * panel.vy);

    // Only inject if moving fast enough
    if (speed < config.velocityThreshold) continue;

    // Normalize direction
    const dirX = panel.vx / speed;
    const dirY = panel.vy / speed;

    // Force strength based on mass and velocity
    const strength = speed * panel.mass * config.strength;

    // Inject force at panel center
    forces.push({
      x: panel.x + panel.width * 0.5,
      y: panel.y + panel.height * 0.5,
      dx: dirX * strength,
      dy: dirY * strength,
      radius: Math.max(panel.width, panel.height) * config.radiusMultiplier,
      strength: strength,
    });
  }

  return forces;
}

/**
 * Compute ripple injection from hover/click
 */
export function createRippleForce(
  x: number,
  y: number,
  intensity: number = 0.6,
  radiusPx: number = 96
): ExternalForce {
  // Create outward radial force
  const angle = Math.random() * Math.PI * 2;
  const force = intensity * 10;

  return {
    x,
    y,
    dx: Math.cos(angle) * force,
    dy: Math.sin(angle) * force,
    radius: radiusPx / 1000, // convert to normalized
    strength: intensity,
  };
}

/**
 * Compute refractive displacement for panel based on pointer
 */
export function computeRefractiveDisplacement(
  pointerX: number,
  pointerY: number,
  panelCenterX: number,
  panelCenterY: number,
  maxDisplacement: number = 0.035
): { u: number; v: number } {
  const dx = pointerX - panelCenterX;
  const dy = pointerY - panelCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Smooth falloff with distance
  const falloff = Math.max(0, 1 - distance);
  const smoothFalloff = falloff * falloff * (3 - 2 * falloff); // smoothstep

  const magnitude = maxDisplacement * smoothFalloff;

  // Direction toward pointer
  if (distance > 0.001) {
    return {
      u: (dx / distance) * magnitude,
      v: (dy / distance) * magnitude,
    };
  }

  return { u: 0, v: 0 };
}

/**
 * Per-panel slosh simulation (simple)
 */
export class PanelSlosh {
  private height: number[];
  private velocity: number[];
  private width: number;
  private damping: number;
  private stiffness: number;

  constructor(
    width: number = 16,
    damping: number = 0.85,
    stiffness: number = 40
  ) {
    this.width = width;
    this.damping = damping;
    this.stiffness = stiffness;
    this.height = new Array(width).fill(0);
    this.velocity = new Array(width).fill(0);
  }

  public impulse(x: number, force: number): void {
    const index = Math.floor(x * this.width);
    if (index >= 0 && index < this.width) {
      this.velocity[index] += force;
    }
  }

  public update(dt: number): void {
    // Simple wave equation
    for (let i = 0; i < this.width; i++) {
      const left = this.height[(i - 1 + this.width) % this.width];
      const right = this.height[(i + 1) % this.width];
      const current = this.height[i];

      // Spring force from neighbors
      const force = (left + right - 2 * current) * this.stiffness;
      this.velocity[i] += force * dt;
      this.velocity[i] *= this.damping;

      // Clamp
      const maxSlosh = 14; // pixels
      this.velocity[i] = Math.max(-maxSlosh, Math.min(maxSlosh, this.velocity[i]));
    }

    // Update heights
    for (let i = 0; i < this.width; i++) {
      this.height[i] += this.velocity[i] * dt;
    }
  }

  public getHeights(): number[] {
    return this.height;
  }

  public getNormalOffset(x: number): { nx: number; ny: number } {
    const index = Math.floor(x * this.width);
    if (index < 1 || index >= this.width - 1) return { nx: 0, ny: 0 };

    const left = this.height[index - 1];
    const right = this.height[index + 1];

    // Gradient for normal
    const dx = (right - left) * 0.5;

    return {
      nx: dx * 0.01,
      ny: this.height[index] * 0.01,
    };
  }
}

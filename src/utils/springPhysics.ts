/**
 * Spring Physics Utilities
 * Critically-damped spring animations for smooth, physically-plausible motion
 */

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass?: number;
  precision?: number;
}

export class Spring {
  private position: number;
  private velocity: number;
  private target: number;
  private config: Required<SpringConfig>;

  constructor(initialValue: number = 0, config: SpringConfig) {
    this.position = initialValue;
    this.velocity = 0;
    this.target = initialValue;
    this.config = {
      mass: 1,
      precision: 0.001,
      ...config,
    };
  }

  public setTarget(target: number): void {
    this.target = target;
  }

  public setValue(value: number): void {
    this.position = value;
    this.velocity = 0;
  }

  public update(dt: number): number {
    const force = (this.target - this.position) * this.config.stiffness;
    const damping = this.velocity * this.config.damping;
    const acceleration = (force - damping) / this.config.mass;

    this.velocity += acceleration * dt;
    this.position += this.velocity * dt;

    // Stop if close enough to target
    if (
      Math.abs(this.velocity) < this.config.precision &&
      Math.abs(this.target - this.position) < this.config.precision
    ) {
      this.position = this.target;
      this.velocity = 0;
    }

    return this.position;
  }

  public getValue(): number {
    return this.position;
  }

  public isAtRest(): boolean {
    return (
      Math.abs(this.velocity) < this.config.precision &&
      Math.abs(this.target - this.position) < this.config.precision
    );
  }
}

/**
 * 2D Vector Spring for position tracking
 */
export class Vector2Spring {
  private x: Spring;
  private y: Spring;

  constructor(initialX: number = 0, initialY: number = 0, config: SpringConfig) {
    this.x = new Spring(initialX, config);
    this.y = new Spring(initialY, config);
  }

  public setTarget(x: number, y: number): void {
    this.x.setTarget(x);
    this.y.setTarget(y);
  }

  public setValue(x: number, y: number): void {
    this.x.setValue(x);
    this.y.setValue(y);
  }

  public update(dt: number): { x: number; y: number } {
    return {
      x: this.x.update(dt),
      y: this.y.update(dt),
    };
  }

  public getValue(): { x: number; y: number } {
    return {
      x: this.x.getValue(),
      y: this.y.getValue(),
    };
  }

  public isAtRest(): boolean {
    return this.x.isAtRest() && this.y.isAtRest();
  }
}

/**
 * Tilt physics for panels (pitch and yaw)
 */
export interface TiltState {
  pitch: number; // rotation around X axis (degrees)
  yaw: number;   // rotation around Y axis (degrees)
}

export class TiltSpring {
  private pitch: Spring;
  private yaw: Spring;

  constructor(config: SpringConfig = { stiffness: 120, damping: 12 }) {
    this.pitch = new Spring(0, config);
    this.yaw = new Spring(0, config);
  }

  public setTarget(pitch: number, yaw: number): void {
    this.pitch.setTarget(pitch);
    this.yaw.setTarget(yaw);
  }

  public update(dt: number): TiltState {
    return {
      pitch: this.pitch.update(dt),
      yaw: this.yaw.update(dt),
    };
  }

  public reset(): void {
    this.pitch.setValue(0);
    this.yaw.setValue(0);
  }

  public isAtRest(): boolean {
    return this.pitch.isAtRest() && this.yaw.isAtRest();
  }
}

/**
 * Smoothstep utility for smooth falloff
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Compute pointer-based tilt angles
 * Returns pitch and yaw in degrees based on normalized pointer delta
 */
export function computeTiltFromPointer(
  pointerX: number,
  pointerY: number,
  centerX: number,
  centerY: number,
  maxTilt: number = 8
): TiltState {
  const dx = (pointerX - centerX) * 2; // -1 to 1
  const dy = (pointerY - centerY) * 2;

  return {
    pitch: -dy * maxTilt, // negative for natural tilt
    yaw: dx * maxTilt,
  };
}

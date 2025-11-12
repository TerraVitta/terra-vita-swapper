# Terra Vitta Interactive Fluid Glass System

## Production-Ready Implementation Guide

This document provides a complete specification for the GPU-accelerated fluid simulation background with interactive liquid-glass panels in the Terra Vitta Swapper UI.

---

## Core Architecture

### 1. Fluid Simulation (WebGL2 / GLSL)

**Implementation:** `src/lib/fluidSimulation.ts` + GLSL shaders

The fluid simulation implements physically-plausible 2D Navier-Stokes equations using:

#### Simulation Pipeline
1. **Advection** (semi-Lagrangian): Move velocity and dye along velocity field
2. **Divergence Computation**: Calculate velocity divergence field
3. **Pressure Solve**: Iterative Jacobi method to compute pressure field (20 iterations default)
4. **Gradient Subtraction**: Make velocity field divergence-free
5. **Vorticity Confinement**: Add rotational forces to prevent energy dissipation
6. **Dye Advection**: Advect color field with decay

#### Framebuffer Architecture
- **Double-buffered FBOs**: Velocity, Density (dye), Pressure
- **Single FBOs**: Divergence, Curl
- **Texture formats**: RG16F (velocity), RGBA16F (dye), R16F (pressure/div/curl)
- **Ping-pong rendering**: Read from one FBO, write to other, swap

#### Exposed Parameters

```typescript
interface FluidSimConfig {
  viscosity: number;          // 0.0001–0.02 (default: 0.001)
  diffusion: number;          // 0.0–1.0 (default: 0.0)
  vorticityStrength: number;  // 0–50 (default: 20)
  pressureIterations: number; // 10–40 (default: 20)
  dyeDecay: number;          // 0.95–0.999 (default: 0.98)
  dt: number;                // 0.016 (fixed timestep)
  simWidth: number;          // 256–512 (complexity dependent)
  simHeight: number;         // 256–512
  dyeResolution: number;     // 1.0–1.5 (dye texture scale)
  splatRadius: number;       // 0.001–0.01 (default: 0.005)
}
```

#### Shader Uniforms

**All shaders:**
- `u_time`: float (animation time)
- `u_resolution`: vec2 (canvas dimensions)
- `texelSize`: vec2 (1.0 / simResolution)

**Advection shader:**
- `uVelocity`: sampler2D (velocity field)
- `uSource`: sampler2D (field to advect)
- `dt`: float (timestep)
- `dissipation`: float (decay rate)

**Pressure shader (Jacobi):**
- `uPressure`: sampler2D (current pressure)
- `uDivergence`: sampler2D (divergence field)

**Vorticity shader:**
- `uVelocity`: sampler2D
- `uCurl`: sampler2D (curl field)
- `curl`: float (vorticity strength)
- `dt`: float

**Splat shader:**
- `uTarget`: sampler2D (target field)
- `point`: vec2 (injection point, 0-1)
- `color`: vec3 (RGB color/force)
- `radius`: float (splat size)
- `aspectRatio`: float

---

### 2. Pointer Input System

**Implementation:** `src/components/FluidBackground.tsx`

#### Pointer Data Structure
```typescript
interface PointerData {
  id: number;         // Unique pointer ID (for multi-touch)
  x: number;          // Normalized X (0-1)
  y: number;          // Normalized Y (0-1)
  dx: number;         // Delta X (velocity)
  dy: number;         // Delta Y (velocity)
  down: boolean;      // Is pressed
  moved: boolean;     // Moved this frame
  color: [r, g, b];   // Dye color (0-1)
}
```

#### Input Injection
- **On pointer down**: Inject initial velocity impulse + dye splash
  - Touch: Stronger force (15x), larger radius
  - Mouse: Moderate force (10x)
- **On pointer move**: Inject velocity based on delta + dye trail
- **Multi-touch**: Simultaneous independent splats
- **Throttling**: 60Hz update via `requestAnimationFrame`

#### Theme-Aware Colors
- **Dark mode**: Cool blues, purples, cyans
- **Light mode**: Warm oranges, pinks, greens
- **Random selection** per pointer

---

### 3. Glass Panel System

**Implementation:** `src/components/InteractiveGlassPanel.tsx`

#### Interactive Features

##### A. Hover Physics
```typescript
const SPRING_CONFIG = {
  hoverTiltStiffness: 120,    // Spring stiffness
  hoverTiltDamping: 12,       // Damping coefficient
  hoverTiltMax: 8,            // Max rotation (degrees)
  hoverScaleMax: 1.02,        // Max scale on hover
  hoverRefractionMax: 0.035,  // Max UV offset
};
```

**Spring Animation:**
```typescript
// Critically-damped spring (per frame)
velocity += (target - position) * stiffness * dt - velocity * damping * dt;
position += velocity * dt;
```

**Applied to:**
- `translateX`, `translateY` (parallax)
- `scale` (grow on hover)
- `rotateX`, `rotateY` (3D tilt toward pointer)

##### B. Refraction Effect
- Compute normalized pointer position relative to panel center (-1 to 1)
- Apply `rotateY = pointerX * hoverTiltMax`
- Apply `rotateX = -pointerY * hoverTiltMax`
- Overlay radial gradient for local refraction highlight

##### C. Fluid Coupling (Optional)
- On hover: Emit ripple into fluid sim at panel center
- On drag: Continuous velocity injection along drag path
- **Decoupled**: Panels read fluid texture, don't write to avoid feedback

##### D. Drag Physics
- **On pointer down**: Enter drag mode, store drag offset
- **During drag**: Follow pointer with spring physics, scale up to 1.05
- **On release**: Snap back to origin with inertia/momentum

#### Props API

```typescript
interface InteractiveGlassPanelProps {
  variant?: 'light' | 'medium' | 'heavy';
  interactive?: boolean;
  draggable?: boolean;
  focusable?: boolean;
  a11yLabel?: string;
  refractionStrength?: number;
  onHoverStart?: (pointer: {x, y}) => void;
  onHoverMove?: (pointer: {x, y}) => void;
  onHoverEnd?: () => void;
  onDragStart?: () => void;
  onDrag?: (x, y) => void;
  onDrop?: () => void;
  children?: React.ReactNode;
}
```

---

### 4. CSS Fallback (No WebGL2)

**Implementation:** `src/components/FluidBackground.tsx` (fallback branch)

#### Fallback Strategy
- **Background**: Animated CSS gradient (keyframe `gradient-shift`)
- **Panels**: Use existing CSS classes (`glass-panel`, `backdrop-filter`)
- **No simulation**: Static or simple CSS animations only

#### Detection
```typescript
const capabilities = detectDeviceCapabilities();
const useWebGL = capabilities.webglSupported && 
                 capabilities.performanceTier !== 'low' &&
                 !capabilities.prefersReducedMotion;
```

---

### 5. Accessibility

#### Keyboard Navigation
- All interactive panels: `tabIndex={0}`, `role="button"`
- Focus visible: High-contrast rings (defined in CSS)
- Enter/Space: Trigger click handlers

#### Reduced Motion
```typescript
if (capabilities.prefersReducedMotion) {
  // Freeze fluid sim at frame 0
  // Disable spring animations (use instant transitions)
  // No parallax or tilt effects
}
```

#### ARIA
- `aria-label` on all interactive panels
- Semantic HTML (`<button>`, `<nav>`, etc.)
- Text alternatives for visual-only info

#### Contrast
- Ensure WCAG 2.1 AA contrast over glass
- Auto-compute foreground color based on luminance
- Update CSS variable `--tv-foreground-on-glass`

---

### 6. Theming

#### CSS Tokens (`:root`)
```css
:root {
  --tv-bg-contrast: hsl(...);
  --tv-accent: hsl(...);
  --tv-glass-tint: rgba(...);
  --tv-glass-opacity: 0.8;
  --tv-edge-contrast: 1.0;
  --themeIntensity: 0; /* 0 = light, 1 = dark */
}

.theme-dark {
  --themeIntensity: 1;
  --tv-bg-contrast: hsl(220, 40%, 8%);
  /* ... */
}
```

#### Shader Integration
- Pass `--themeIntensity` to shader as `u_themeIntensity`
- Blend dye colors, ambient light based on theme
- Dark mode: Deeper blacks, higher dye saturation, lower ambient

---

### 7. Performance

#### Targets
- **Desktop**: 90+ FPS
- **Mobile (mid-range)**: 60 FPS
- **LCP**: < 2.5s
- **CLS**: < 0.05
- **JS budget**: < 200KB gzipped

#### Optimizations
1. **Resolution Scaling**
   - Clamp `devicePixelRatio` to max 1.5x on mobile
   - Complexity levels: Low (256x256), Medium (384x384), High (512x512)

2. **Auto-Fallback**
   - Measure frame time over 1s warmup
   - If median > 22ms: Degrade to CSS fallback

3. **Shader Caching**
   - Compile shaders once, reuse programs
   - Cache framebuffers, avoid recreating

4. **Throttling**
   - Pointer events: 60Hz via `requestAnimationFrame`
   - No redundant state updates

5. **LQIP & Assets**
   - Serve AVIF/WebP compressed backgrounds
   - Prewarmed tiny jittered normal texture for first paint

---

### 8. Complexity Levels

**User-selectable via settings:**

#### Low (CSS-only)
- No WebGL, animated gradient background
- Standard glass panels with `backdrop-filter`
- No pointer interaction with fluid

#### Medium (Default)
- WebGL fluid sim at 384x384
- 20 pressure iterations
- Dye resolution 1.0x
- Pointer interaction enabled

#### High
- WebGL fluid sim at 512x512
- 25 pressure iterations
- Dye resolution 1.5x
- Panel-fluid coupling enabled

---

### 9. Testing Checklist

- [ ] WebGL2 renders correctly on Chrome/Firefox/Safari
- [ ] CSS fallback works on older browsers
- [ ] Auto-fallback triggers when FPS < 45
- [ ] Pointer injection works (mouse + touch + multi-touch)
- [ ] Panels tilt and scale on hover
- [ ] Drag mode follows pointer with physics
- [ ] Theme switching updates colors (dark/light)
- [ ] `prefers-reduced-motion` disables animations
- [ ] Keyboard navigation (Tab, Enter, Space)
- [ ] ARIA labels present
- [ ] Text contrast meets WCAG AA
- [ ] Lighthouse score > 90

---

### 10. File Structure

```
src/
  lib/
    fluidSimulation.ts          # Fluid sim class + GLSL shaders
    performanceDetect.ts        # Device capability detection
  components/
    FluidBackground.tsx         # Fluid sim background wrapper
    InteractiveGlassPanel.tsx   # Interactive glass panel
  hooks/
    useTheme.tsx                # Theme context
  index.css                     # Design tokens, animations
FLUID_SYSTEM_DOCS.md           # This file
```

---

## Usage Examples

### Basic Setup

```tsx
import FluidBackground from '@/components/FluidBackground';
import InteractiveGlassPanel from '@/components/InteractiveGlassPanel';

function App() {
  return (
    <FluidBackground 
      complexity="medium" 
      vorticityStrength={20}
      interactive={true}
    >
      <div className="container mx-auto p-8">
        <InteractiveGlassPanel
          variant="medium"
          interactive={true}
          draggable={true}
          a11yLabel="Product card"
          className="p-6 rounded-2xl"
        >
          <h2>Interactive Card</h2>
          <p>Hover, drag, and interact!</p>
        </InteractiveGlassPanel>
      </div>
    </FluidBackground>
  );
}
```

### Complexity Control

```tsx
const [complexity, setComplexity] = useState<'low' | 'medium' | 'high'>('medium');

<FluidBackground complexity={complexity}>
  <select onChange={(e) => setComplexity(e.target.value)}>
    <option value="low">Low (CSS)</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
  </select>
</FluidBackground>
```

---

## Shader Pseudocode

### Advection (semi-Lagrangian)
```glsl
// Sample velocity at current fragment
vec2 vel = texture(uVelocity, vUv).xy;

// Trace back along velocity
vec2 prevCoord = vUv - dt * vel * texelSize;

// Sample source at traced position
vec4 result = dissipation * texture(uSource, prevCoord);
```

### Divergence
```glsl
float L = texture(uVelocity, vUv - vec2(dx, 0)).x;
float R = texture(uVelocity, vUv + vec2(dx, 0)).x;
float T = texture(uVelocity, vUv + vec2(0, dy)).y;
float B = texture(uVelocity, vUv - vec2(0, dy)).y;

float div = 0.5 * (R - L + T - B);
```

### Pressure (Jacobi iteration)
```glsl
float L = texture(uPressure, vUv - vec2(dx, 0)).x;
float R = texture(uPressure, vUv + vec2(dx, 0)).x;
float T = texture(uPressure, vUv + vec2(0, dy)).x;
float B = texture(uPressure, vUv - vec2(0, dy)).x;
float divergence = texture(uDivergence, vUv).x;

float pressure = (L + R + B + T - divergence) * 0.25;
```

### Gradient Subtraction
```glsl
vec2 vel = texture(uVelocity, vUv).xy;
float L = texture(uPressure, vUv - vec2(dx, 0)).x;
float R = texture(uPressure, vUv + vec2(dx, 0)).x;
float T = texture(uPressure, vUv + vec2(0, dy)).x;
float B = texture(uPressure, vUv - vec2(0, dy)).x;

vel -= vec2(R - L, T - B) * 0.5;
```

### Curl (vorticity)
```glsl
float L = texture(uVelocity, vUv - vec2(dx, 0)).y;
float R = texture(uVelocity, vUv + vec2(dx, 0)).y;
float T = texture(uVelocity, vUv + vec2(0, dy)).x;
float B = texture(uVelocity, vUv - vec2(0, dy)).x;

float curl = (R - L - T + B) * 0.5;
```

### Vorticity Confinement
```glsl
// Compute curl gradient
float L = texture(uCurl, vUv - vec2(dx, 0)).x;
float R = texture(uCurl, vUv + vec2(dx, 0)).x;
float T = texture(uCurl, vUv + vec2(0, dy)).x;
float B = texture(uCurl, vUv - vec2(0, dy)).x;
float C = texture(uCurl, vUv).x;

vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
force = normalize(force) * curl * C;

vec2 vel = texture(uVelocity, vUv).xy;
vel += force * dt;
```

---

## Production Notes

### Design Decisions

1. **Ping-pong FBOs**: Required for iterative solvers, allows reading + writing in single pass
2. **Half-float textures**: Balance between precision and memory
3. **Fixed timestep**: Ensures stable simulation regardless of frame rate
4. **Jacobi iterations**: Trade accuracy for speed (Gauss-Seidel would be more accurate but slower)

### CPU/GPU Tradeoffs

- **CPU**: Pointer data management, spring physics for panels
- **GPU**: All fluid simulation, rendering
- **Bottleneck**: Pressure solve iterations (most expensive)

### Tuning for Device Classes

**High-end Desktop:**
- Resolution: 512x512
- Pressure iterations: 25
- Dye resolution: 1.5x

**Mid-range Mobile:**
- Resolution: 384x384
- Pressure iterations: 20
- Dye resolution: 1.0x

**Low-end / Older:**
- CSS fallback
- No simulation

---

## Changelog

**v1.0.0** - Initial production release
- Full WebGL2 Navier-Stokes implementation
- Interactive glass panels with spring physics
- Multi-touch support
- Progressive fallback
- Accessibility compliance
- Theme integration

---

## Support

For questions or issues, refer to the main project README or contact the development team.

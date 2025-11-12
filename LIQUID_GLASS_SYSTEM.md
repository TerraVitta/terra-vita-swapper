# Terra Vitta Liquid Glass System

## Overview

A comprehensive, production-ready liquid glass design system with WebGL shaders, CSS fallbacks, and full accessibility support. This system creates realistic glass effects with refraction, caustics, chromatic aberration, and physics-based animations.

## Features

### 🎨 Visual Effects
- **WebGL Shaders**: Real-time refraction, caustics, and chromatic dispersion
- **CSS Fallbacks**: Graceful degradation for older browsers
- **Chromatic Aberration**: Color-splitting at edges for realistic glass
- **Fresnel Effects**: Edge highlighting and rim lights
- **Curl Noise Flow**: Organic, liquid-like movement
- **Parallax Refraction**: Motion-driven depth effects

### ⚡ Performance
- **Auto-Detection**: Automatically detects device capabilities
- **Performance Tiers**: Low, Medium, High quality modes
- **Auto-Fallback**: Switches to CSS if framerates drop
- **Frame Rate Monitoring**: Continuous performance tracking
- **Throttled Events**: Optimized pointer and scroll handling
- **GPU Acceleration**: Uses transform3d and will-change strategically

### ♿ Accessibility
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **Keyboard Navigation**: Full keyboard support
- **ARIA Labels**: Proper semantic markup
- **Focus Visible**: High-contrast focus rings
- **Theme Integration**: Works with light/dark modes

### 🎯 Components

#### 1. LiquidGlassPanel
Main glass panel component with WebGL support.

```tsx
import { LiquidGlassPanel } from '@/components/LiquidGlassPanel';

<LiquidGlassPanel
  variant="medium"           // 'light' | 'medium' | 'heavy'
  blur={0.7}                // 0-1
  opacity={0.8}             // 0-1
  refractionStrength={0.5}  // 0-1
  interactive={true}        // Enable hover effects
  useWebGL={true}           // Auto-detected if undefined
  enableParallax={true}     // Mouse-driven parallax
  enablePhysics={true}      // Physics-based animations
>
  {/* Your content */}
</LiquidGlassPanel>
```

#### 2. ParallaxGlass
Adds parallax and tilt effects.

```tsx
import { ParallaxGlass } from '@/components/ParallaxGlass';

<ParallaxGlass
  intensity={0.5}           // 0-1
  enableTilt={true}         // 3D tilt effect
  enableOrientation={true}  // Mobile device orientation
  easing="spring"           // 'linear' | 'easeOut' | 'spring'
>
  {/* Your content */}
</ParallaxGlass>
```

#### 3. GlassBlurToggle
Toggle between frosted and crystal-clear glass.

```tsx
import GlassBlurToggle from '@/components/GlassBlurToggle';

<GlassBlurToggle />
```

#### 4. GlassIntensityControl
Lets users choose quality level (Low/Medium/High).

```tsx
import { GlassIntensityControl } from '@/components/GlassIntensityControl';

<GlassIntensityControl 
  onIntensityChange={(intensity) => console.log(intensity)}
/>
```

## CSS Utilities

### Glass Variants
```css
.glass-panel    /* Standard glass */
.glass-light    /* Ultra-transparent */
.glass-heavy    /* Maximum depth */
.glass-button   /* Interactive glass button */
```

### Effects
```css
.liquid-shimmer     /* Animated shimmer */
.crystal-edge       /* Chromatic edge */
.glass-breathe      /* Breathing animation */
.liquid-flow        /* Flowing light */
.glass-refraction   /* Top refraction highlight */
```

### Interactions
```css
.refract-hover      /* 3D hover effect */
.card-hover         /* Card lift on hover */
.click-ripple       /* Ripple on click */
```

### Transitions
```css
.transition-glass   /* Smooth glass transitions */
.transition-spring  /* Spring physics */
.transition-liquid  /* Liquid easing */
```

## CSS Variables

### Dynamic Controls
```css
--blur-enabled: 1;              /* 0 = no blur, 1 = full blur */
--blur-multiplier: 1;           /* Blur strength multiplier */
--glass-complexity: 1;          /* Visual complexity (0.5-1.5) */
--chromatic-aberration: 2px;    /* Edge color split */
--internal-glow-intensity: 0.6; /* Internal luminescence */
--specular-intensity: 0.9;      /* Highlight brightness */
```

### Glass Materials
```css
--glass-ultra-light: rgba(255, 255, 255, 0.85);
--glass-light: rgba(255, 255, 255, 0.6);
--glass-medium: rgba(255, 255, 255, 0.35);
--glass-heavy: rgba(255, 255, 255, 0.18);
```

### Blur Values
```css
--blur-xs: calc(8px * var(--blur-multiplier));
--blur-sm: calc(16px * var(--blur-multiplier));
--blur-md: calc(28px * var(--blur-multiplier));
--blur-lg: calc(44px * var(--blur-multiplier));
--blur-xl: calc(64px * var(--blur-multiplier));
```

## WebGL Shader Uniforms

The WebGL shader accepts these uniforms for customization:

```typescript
{
  u_time: number;                    // Animation time
  u_resolution: [number, number];    // Canvas size
  u_mouse: [number, number];         // Mouse position (0-1)
  u_themeIntensity: number;          // 0=light, 1=dark
  u_refraction: number;              // Refraction strength
  u_curlScale: number;               // Noise scale
  u_curlSpeed: number;               // Flow speed
  u_curlAmplitude: number;           // Flow strength
  u_chromaticAberration: number;     // Color dispersion
  u_fresnelPower: number;            // Edge highlight power
  u_lightDirection: [number, number, number]; // Light angle
}
```

## Performance Optimization

### Automatic Detection
The system automatically detects:
- WebGL support
- Backdrop-filter support
- Device performance tier
- Reduced motion preference
- GPU capabilities
- CPU cores and memory

### Quality Tiers

**Low (CSS-only)**
- Backdrop-filter blur
- Basic gradients
- No animations with reduced motion
- Best for older devices

**Medium (CSS + Animations)**
- All Low features
- Liquid shimmer effects
- Breathing animations
- Optimized for mid-range devices

**High (WebGL + Full Effects)**
- Real-time shader rendering
- Caustics and refraction
- Chromatic aberration
- Device orientation support
- For modern high-end devices

### Auto-Fallback
If frame rate drops below 45fps during the warm-up period, the system automatically switches from WebGL to CSS-only mode.

## Theme Integration

The system fully integrates with light/dark modes:

```typescript
import { useTheme } from '@/hooks/useTheme';

const { theme, toggleTheme } = useTheme();
// Glass panels automatically adapt to theme changes
```

### Light Mode
- Bright, crystalline appearance
- Cool white tinting
- Subtle pastel highlights
- High contrast with dark text

### Dark Mode
- Deep, rich glass
- Cool blue-gray tinting
- Bioluminescent effects
- Glowing edges and highlights

## Accessibility

### Keyboard Navigation
All interactive glass elements are keyboard accessible:
- Tab to focus
- Enter/Space to activate
- Focus visible with high-contrast rings

### Reduced Motion
When `prefers-reduced-motion` is detected:
- Shader animations freeze at a static state
- CSS animations use instant transitions
- Parallax effects are disabled
- Physics animations are removed

### Color Contrast
- Text over glass maintains WCAG 2.1 AA contrast
- Automatic text shadow for readability
- High-contrast borders and focus rings

## Browser Support

### Modern Browsers (Full Features)
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Older Browsers (CSS Fallback)
- Chrome 76+ (backdrop-filter support)
- Firefox 70+ (backdrop-filter support)
- Safari 9+ (webkit-backdrop-filter)

### Graceful Degradation
- No WebGL: Falls back to CSS
- No backdrop-filter: Uses SVG filters
- No filter support: Semi-transparent backgrounds

## Examples

### Hero Section
```tsx
<LiquidGlassPanel
  variant="medium"
  className="rounded-3xl p-12"
  enableParallax={true}
>
  <h1 className="text-5xl font-bold">Your Content</h1>
</LiquidGlassPanel>
```

### Interactive Card
```tsx
<ParallaxGlass intensity={0.7} enableTilt={true}>
  <LiquidGlassPanel
    variant="light"
    className="rounded-2xl p-6 cursor-pointer"
    interactive={true}
    onClick={() => console.log('Clicked!')}
  >
    <h3>Interactive Card</h3>
  </LiquidGlassPanel>
</ParallaxGlass>
```

### Button
```tsx
<button className="glass-button liquid-shimmer rounded-xl px-6 py-3">
  <Sparkles className="mr-2" />
  Click Me
</button>
```

## Performance Metrics

### Target Goals
- LCP: < 2.5s
- FPS: 60fps (min 45fps)
- CLS: < 0.05
- Initial JS: < 150KB gzipped

### Optimization Techniques
- Lazy shader compilation
- Cached WebGL programs
- Throttled event listeners (16ms)
- Passive scroll listeners
- Progressive enhancement
- Code splitting for WebGL components

## Testing Checklist

- [ ] WebGL renders correctly on supported devices
- [ ] CSS fallback works on older browsers
- [ ] Auto-fallback triggers when FPS drops
- [ ] Theme switching updates glass appearance
- [ ] Reduced motion disables animations
- [ ] Keyboard navigation works
- [ ] Touch/mobile gestures work
- [ ] Device orientation (mobile) works
- [ ] Blur toggle transitions smoothly
- [ ] Quality control works correctly
- [ ] Lighthouse score > 90

## Troubleshooting

### Issue: Glass panels look pixelated
**Solution**: Increase canvas resolution or device pixel ratio

### Issue: Performance is poor
**Solution**: Lower glass intensity or disable WebGL

### Issue: Blur not working
**Solution**: Check browser support for backdrop-filter

### Issue: Animations stuttering
**Solution**: Enable hardware acceleration or use CSS-only mode

### Issue: Dark mode colors wrong
**Solution**: Check CSS variable values in dark mode

## Future Enhancements

- [ ] Normal map texture support
- [ ] Background texture sampling
- [ ] Advanced caustics rendering
- [ ] Gesture-based intensity control
- [ ] Custom shader presets
- [ ] Animation timeline control
- [ ] Multi-layer glass stacking

## Credits

Built for Terra Vitta Swappers with inspiration from:
- iOS frosted glass design
- Cinema 4D liquid materials
- Physically-based rendering principles
- Modern web glassmorphism trends

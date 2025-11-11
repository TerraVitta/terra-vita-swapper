# 🔮 Liquid Glass Quick Reference

## 🎯 Essential Classes

| Class | Purpose | Blur | Use Case |
|-------|---------|------|----------|
| `.glass-panel` | General container | 28px | Cards, sections, panels |
| `.glass-light` | Light glass | 16px | Navbars, headers, chrome |
| `.glass-heavy` | Deep glass | 44px | Modals, important UI |
| `.glass-button` | Interactive glass | 16px | Buttons, controls |
| `.navbar-glass` | Navigation | 20px | Top/side navigation |
| `.modal-glass` | Dialogs | 48px | Modals, overlays |
| `.sidebar-glass` | Sidebar | 32px | Side navigation |
| `.glass-input` | Form input | 16px | Text fields, search |

## 💎 Effect Classes

| Class | Effect |
|-------|--------|
| `.liquid-shimmer` | Breathing undulation animation |
| `.specular-highlight` | Animated light reflection sweep |
| `.liquid-reflection` | Bottom reflection pool |
| `.molten-edge` | Chromatic aberration edge glow |
| `.glass-float` | Floating motion |
| `.glass-breathe` | Subtle breathing scale |
| `.glass-text` | Optimized text on glass |
| `.liquid-glass-container` | Base container setup |

## 🎚️ Blur Toggle

```tsx
// Access in any component
import { useGlassBlur } from '@/hooks/useGlassBlur';

const { blurEnabled, toggleBlur } = useGlassBlur();
```

**Toggle automatically appears in top-right corner**

## 🌊 Animations

| Animation | Duration | Effect |
|-----------|----------|--------|
| `refraction-shimmer` | 6s | Top highlight wave |
| `refract-shift` | 10s | Border color shift |
| `shimmer-pulse` | 5s | Glow pulse |
| `liquid-undulate` | 8s | Shimmer flow |
| `specular-dance` | 8s | Light reflection move |
| `edge-glow` | 6s | Edge brightness shift |
| `glass-float` | 6s | Vertical float |
| `toggle-ripple` | 0.5s | Button click ripple |

## 📊 Blur Amounts

```css
--blur-xs: 8px;      /* Minimal blur */
--blur-sm: 16px;     /* Light blur */
--blur-md: 28px;     /* Medium blur (default) */
--blur-lg: 44px;     /* Heavy blur */
--blur-xl: 64px;     /* Maximum blur */
```

## 🎨 Colors

### Glass Opacity (Light Mode)
```css
--glass-ultra-light: rgba(255, 255, 255, 0.7);
--glass-light: rgba(255, 255, 255, 0.4);
--glass-medium: rgba(255, 255, 255, 0.18);
--glass-heavy: rgba(255, 255, 255, 0.08);
```

### Glass Opacity (Dark Mode)
```css
--glass-ultra-light: rgba(60, 75, 100, 0.5);
--glass-light: rgba(40, 55, 80, 0.35);
--glass-medium: rgba(25, 35, 55, 0.45);
--glass-heavy: rgba(15, 20, 35, 0.65);
```

## 🔌 Setup

```tsx
// In App.tsx
import { GlassBlurProvider } from '@/hooks/useGlassBlur';
import GlassBlurToggle from '@/components/GlassBlurToggle';

export default function App() {
  return (
    <GlassBlurProvider>
      <GlassBlurToggle />
      {/* Your app */}
    </GlassBlurProvider>
  );
}
```

## 🎯 Common Patterns

### Premium Card
```tsx
<div className="glass-panel rounded-2xl p-6 card-hover">
  <h3>Title</h3>
  <p>Content</p>
</div>
```

### Glass Button
```tsx
<button className="glass-button rounded-lg px-6 py-2 btn-glow">
  Click Me
</button>
```

### Glass Form
```tsx
<div className="glass-panel rounded-2xl p-8">
  <input className="glass-input w-full mb-4" />
  <button className="glass-button w-full">Submit</button>
</div>
```

### Navigation Bar
```tsx
<nav className="navbar-glass sticky top-0">
  <div className="container flex justify-between py-4">
    <div>Logo</div>
    <button className="glass-button">Sign In</button>
  </div>
</nav>
```

### Modal
```tsx
<div className="modal-glass rounded-2xl p-8">
  <h2>Title</h2>
  <p>Content</p>
</div>
```

## 🎬 Easing Functions

All glass animations use:
```css
cubic-bezier(0.34, 1.56, 0.64, 1)  /* iOS spring physics */
```

For standard timing:
```css
ease-in-out
cubic-bezier(0.4, 0, 0.2, 1)  /* Material Design */
```

## 📱 Mobile Adjustments

```css
@media (max-width: 640px) {
  :root {
    --blur-md: 16px;  /* Reduce blur on mobile */
  }
}
```

## 🐛 Debug Tips

Check if blur is enabled:
```tsx
const style = getComputedStyle(document.documentElement);
console.log(style.getPropertyValue('--blur-enabled'));
```

Force blur on/off in DevTools Console:
```js
document.documentElement.style.setProperty('--blur-enabled', '0');  // Off
document.documentElement.style.setProperty('--blur-enabled', '1');  // On
```

## 💾 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 76+ | ✅ Full | Perfect support |
| Firefox 60+ | ✅ Full | Perfect support |
| Safari 15+ | ✅ Full | Uses `-webkit-` prefix |
| Edge 79+ | ✅ Full | Chromium-based |
| Older Browsers | ⚠️ Fallback | Semi-transparent backgrounds |

## 🎨 Customization Checklist

- [ ] Adjusted blur amounts to preference
- [ ] Modified color palette for brand
- [ ] Tested on light and dark modes
- [ ] Verified text legibility
- [ ] Tested on mobile devices
- [ ] Checked performance with DevTools
- [ ] Verified accessibility (focus states, reduced motion)
- [ ] Customized toggle button position/styling
- [ ] Added hover/active states to interactive elements
- [ ] Tested in all target browsers

## 🚀 Performance Tips

1. Use `will-change` on animated elements
2. Prefer `transform` over position changes
3. Avoid animating `blur` directly
4. Use `GPU-accelerated` properties only
5. Test performance on lower-end devices
6. Limit simultaneous animations
7. Use `requestAnimationFrame` for complex interactions

## 🎓 Learning Resources

- Check `LIQUID_GLASS_GUIDE.md` for complete documentation
- Review `index.css` for CSS implementation
- Check `App.css` for component styles
- Look at `GlassBlurToggle.tsx` for toggle implementation
- Study `useGlassBlur.tsx` for context usage

## 💡 Pro Tips

1. Layer multiple glass panels for depth
2. Combine effects (e.g., `glass-panel liquid-shimmer`)
3. Use `.glass-text` with legible foreground colors
4. Add `.card-hover` for interactive cards
5. Always test `.glass-button:active` feel
6. Use animations sparingly for impact
7. Monitor animations in DevTools for jank
8. Respect user motion preferences
9. Test color contrast for accessibility
10. Profile performance regularly

## ✨ That's All!

You're ready to build stunning liquid glass UIs. Start with `.glass-panel`, add effects as needed, and let the toggle do its magic! 🎉

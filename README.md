Terra Vitta Swapper — mini storefront demo

Development
-----------

- Start the dev server: `npm run dev`

GSAP SplitText (animated title)
--------------------------------
This project includes a reusable `SplitText` React component using GSAP + @gsap/react to animate headings / hero text. The landing page hero title "Shop with Purpose" has been updated to use it.

Install the runtime dependencies before running the app:

```bash
npm install gsap @gsap/react
```

Usage example (already applied to the landing page):

```tsx
import SplitText from '@/components/SplitText';

<SplitText
	tag="h1"
	text={`Shop with\nPurpose`}
	className="text-5xl md:text-6xl lg:text-7xl font-bold"
	splitType="chars"
	delay={40}
	duration={0.6}
	from={{ opacity: 0, y: 40 }}
	to={{ opacity: 1, y: 0 }}
	onLetterAnimationComplete={() => console.log('animation done')}
/>
```

Note: the SplitText plugin may require licensing for some GSAP packages — if you encounter errors about SplitText availability you can fallback to word/char wrappers and animate via gsap.fromTo manually.

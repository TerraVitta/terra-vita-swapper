import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// SplitText is a GSAP plugin. Types may not exist in this repo so we'll treat it as any.
// If your environment has @types/gsap or the plugin types, replace `any` with the correct type.
// We intentionally avoid importing the paid GSAP SplitText plugin directly so builds won't fail
// if the plugin isn't available. Instead this component manually splits the text into
// elements (chars/words/lines) and animates them with GSAP core + ScrollTrigger.
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

type SplitTextProps = {
  text: string;
  className?: string;
  delay?: number; // ms per character stagger
  duration?: number; // seconds
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines' | string;
  from?: Record<string, any>;
  to?: Record<string, any>;
  threshold?: number;
  rootMargin?: string;
  textAlign?: React.CSSProperties['textAlign'];
  tag?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  onLetterAnimationComplete?: () => void;
};

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const animationCompletedRef = useRef(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if ((document as any).fonts?.status === 'loaded') {
      setFontsLoaded(true);
    } else if ((document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => setFontsLoaded(true));
    } else {
      // fallback: assume loaded
      setFontsLoaded(true);
    }
  }, []);

  useGSAP(() => {
    if (!ref.current || !text || !fontsLoaded) return;
    const el = ref.current as HTMLElement & { _rbsplitInstance?: any };

    // clear any previous ScrollTriggers tied to this element
    const startPct = (1 - threshold) * 100;
    const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
    const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
    const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
    const sign =
      marginValue === 0 ? '' : marginValue < 0 ? `-=${Math.abs(marginValue)}${marginUnit}` : `+=${marginValue}${marginUnit}`;
    const start = `top ${startPct}%${sign}`;

    // pick targets based on splitType (we create spans in the render output with these classes)
    let targets: Element[] = [];
    if (splitType.includes('chars')) targets = Array.from(el.querySelectorAll('.split-char'));
    if (!targets.length && splitType.includes('words')) targets = Array.from(el.querySelectorAll('.split-word'));
    if (!targets.length && splitType.includes('lines')) targets = Array.from(el.querySelectorAll('.split-line'));
    if (!targets.length) targets = Array.from(el.querySelectorAll('.split-char, .split-word, .split-line'));

    if (targets.length) {
      const anim = gsap.fromTo(
        targets,
        { ...from },
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
            fastScrollEnd: true,
            anticipatePin: 0.4
          },
          onComplete: () => {
            animationCompletedRef.current = true;
            onLetterAnimationComplete?.();
          },
          willChange: 'transform, opacity',
          force3D: true
        }
      );

      // cleanup reference
      (el as any)._rbsplitInstance = anim;
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if ((st as any).trigger === el) st.kill();
      });
      try {
        (el as any)._rbsplitInstance?.kill?.();
      } catch (e) {
        // ignore
      }
      (el as any)._rbsplitInstance = null;
    };
  },
  {
    dependencies: [
      text,
      delay,
      duration,
      ease,
      splitType,
      JSON.stringify(from),
      JSON.stringify(to),
      threshold,
      rootMargin,
      fontsLoaded,
      onLetterAnimationComplete
    ],
    scope: ref as any
  });

  const renderTag = () => {
    const style: React.CSSProperties = {
      textAlign,
      wordWrap: 'break-word',
      willChange: 'transform, opacity'
    };
    const classes = `split-parent overflow-hidden inline-block whitespace-normal ${className}`;

    const buildChildren = () => {
      // split into lines first by \n -> then words/chars
      const lines = text.split(/\n/);
      return lines.map((line, lineIndex) => {
        const words = line.split(/(\s+)/).filter(Boolean); // keep spaces as tokens

        if (splitType.includes('chars')) {
          // create a sequence of character spans
          const chars = Array.from(line).map((ch, i) => (
            <span key={`c-${lineIndex}-${i}`} className="split-char inline-block" aria-hidden>
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ));
          return (
            <span key={`line-${lineIndex}`} className="split-line block whitespace-pre-wrap">
              {chars}
            </span>
          );
        }

        if (splitType.includes('words')) {
          const wordNodes = words.map((w, i) => (
            <span key={`w-${lineIndex}-${i}`} className="split-word inline-block">
              {w}
            </span>
          ));
          return (
            <span key={`line-${lineIndex}`} className="split-line block">
              {wordNodes}
            </span>
          );
        }

        // default to words
        const defaultNodes = words.map((w, i) => (
          <span key={`d-${lineIndex}-${i}`} className="split-word inline-block">
            {w}
          </span>
        ));
        return (
          <span key={`line-${lineIndex}`} className="split-line block">
            {defaultNodes}
          </span>
        );
      });
    };

    const children = buildChildren();

    switch (tag) {
      case 'h1':
        return (
          <h1 ref={ref as any} style={style} className={classes}>
            {children}
          </h1>
        );
      case 'h2':
        return (
          <h2 ref={ref as any} style={style} className={classes}>
            {children}
          </h2>
        );
      case 'h3':
        return (
          <h3 ref={ref as any} style={style} className={classes}>
            {children}
          </h3>
        );
      case 'h4':
        return (
          <h4 ref={ref as any} style={style} className={classes}>
            {children}
          </h4>
        );
      case 'h5':
        return (
          <h5 ref={ref as any} style={style} className={classes}>
            {children}
          </h5>
        );
      case 'h6':
        return (
          <h6 ref={ref as any} style={style} className={classes}>
            {children}
          </h6>
        );
      default:
        return (
          <p ref={ref as any} style={style} className={classes}>
            {children}
          </p>
        );
    }
  };

  return renderTag();
};

export default SplitText;

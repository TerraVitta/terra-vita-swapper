import { useEffect, useRef } from 'react';
import Aurora from './Aurora';
import { useTheme } from '@/hooks/useTheme';

const FluidRibbons = () => {
  const { theme } = useTheme();
  const ribbonsRef = useRef<HTMLDivElement>(null);

  // Dynamically adjust ribbons based on scroll and mouse movement
  useEffect(() => {
    const ribbons = ribbonsRef.current;
    if (!ribbons) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth) * 100;
      const y = (clientY / window.innerHeight) * 100;

      // Smooth transform based on mouse position
      ribbons.style.setProperty('--mouse-x', `${x}%`);
      ribbons.style.setProperty('--mouse-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={ribbonsRef}
      className="fixed inset-0 overflow-hidden pointer-events-none" 
      style={{ zIndex: 0 }}
    >
      {/* Aurora background effect */}
      <Aurora 
        colorStops={theme === 'dark' ? 
          ['#004953', '#17B169', '#008080'] : // Dark mode colors
          ['#38A3A5', '#57CC99', '#80ED99']   // Light mode colors
        }
        amplitude={0.8}
        blend={0.6}
        speed={0.5}
      />
      
      {/* Enhanced fluid ribbons with glass effect */}
      <div 
        className="fluid-ribbon fluid-ribbon-left glass-morphism" 
        aria-hidden="true"
        style={{
          opacity: theme === 'dark' ? 0.15 : 0.25,
          transform: 'translate(var(--mouse-x, 0), var(--mouse-y, 0)) rotate(-15deg)'
        }}
      />
      <div 
        className="fluid-ribbon fluid-ribbon-right glass-morphism" 
        aria-hidden="true"
        style={{
          opacity: theme === 'dark' ? 0.15 : 0.25,
          transform: 'translate(calc(-1 * var(--mouse-x, 0)), calc(-1 * var(--mouse-y, 0))) rotate(15deg)'
        }}
      />
    </div>
  );
};

export default FluidRibbons;

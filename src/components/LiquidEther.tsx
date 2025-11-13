import React, { useEffect, useRef } from 'react';

export interface LiquidEtherProps {
  colors?: string[];
  style?: React.CSSProperties;
  className?: string;
}

export default function LiquidEther({
  colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
  style = {},
  className = '',
}: LiquidEtherProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateCanvasSize();

    // Particle system for fluid-like effect
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    }

    const particles: Particle[] = [];
    let time = 0;

    const createParticles = (count: number) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * (canvas.offsetWidth),
          y: Math.random() * (canvas.offsetHeight),
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: Math.random(),
        });
      }
    };

    createParticles(50);

    const animate = () => {
      // Clear canvas with semi-transparent background for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      time += 0.01;

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Update position with some noise
        const noise = Math.sin(time + i) * 0.5;
        p.x += p.vx + noise;
        p.y += p.vy + Math.cos(time * 0.5 + i) * 0.5;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth) p.x = 0;
        if (p.y < 0) p.y = canvas.offsetHeight;
        if (p.y > canvas.offsetHeight) p.y = 0;

        // Update life
        p.life += 0.002;
        if (p.life > 2) {
          p.life = 0;
          p.x = Math.random() * canvas.offsetWidth;
          p.y = Math.random() * canvas.offsetHeight;
        }

        // Draw particle with gradient
        const colorIndex = Math.floor((time + i) % colors.length);
        const nextColorIndex = (colorIndex + 1) % colors.length;

        // Interpolate between colors
        const alpha = Math.max(0, 1 - p.life);
        ctx.fillStyle = colors[colorIndex];
        ctx.globalAlpha = alpha * 0.3;

        // Draw glowing circle
        const radius = 30 + Math.sin(time + i) * 10;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        gradient.addColorStop(0, colors[colorIndex]);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(p.x - radius, p.y - radius, radius * 2, radius * 2);
      }

      ctx.globalAlpha = 1;

      // Add subtle flowing lines
      ctx.strokeStyle = colors[0];
      ctx.globalAlpha = 0.1;
      ctx.lineWidth = 1;

      for (let i = 0; i < particles.length - 1; i++) {
        const p1 = particles[i];
        const p2 = particles[i + 1];
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      updateCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [colors]);

  return (
    <canvas
      ref={canvasRef}
      className={`liquid-ether-container ${className || ''}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        ...style,
      }}
    />
  );
}


import { useEffect, useRef } from 'react';

export default function LiquidEther({
  colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
  style = {},
  className = '',
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<any[] | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Detect device performance
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEnd = !!(navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4;
    const particleCount = isMobile || isLowEnd ? 25 : 40;
    const maxConnectDistance = isMobile || isLowEnd ? 60 : 100;
    const particleRadius = isMobile || isLowEnd ? 20 : 30;

    // Set canvas size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateCanvasSize();

    // Initialize particles
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      life: Math.random(),
    }));
    particlesRef.current = particles;

    // Frame rate limiter
    let lastFrameTime = 0;
    const targetFPS = isMobile ? 30 : 50;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      // Frame rate limiting
      if (currentTime - lastFrameTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = currentTime;

      // Clear with fade trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      timeRef.current += 0.01;
      const time = timeRef.current;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Smooth movement with noise
        const noise = Math.sin(time * 0.5 + i) * 0.3;
        p.x += p.vx + noise;
        p.y += p.vy + Math.cos(time * 0.3 + i) * 0.3;

        // Wrap around edges
        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Update life
        p.life += 0.0015;
        if (p.life > 1.5) {
          p.life = 0;
          p.x = Math.random() * w;
          p.y = Math.random() * h;
        }

        // Draw particle with glow
        const colorIndex = Math.floor(time + i) % colors.length;
        const alpha = Math.max(0, 1 - p.life);

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, particleRadius);
        gradient.addColorStop(0, colors[colorIndex]);
        gradient.addColorStop(0.7, colors[colorIndex] + '80');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.globalAlpha = alpha * 0.4;
        ctx.fillStyle = gradient;
        ctx.fillRect(p.x - particleRadius, p.y - particleRadius, particleRadius * 2, particleRadius * 2);
      }

      ctx.globalAlpha = 1;

      // Draw connections between nearby particles
      ctx.strokeStyle = colors[0];
      ctx.globalAlpha = 0.08;
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxConnectDistance) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

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


import React, { useEffect, useRef } from 'react';

/**
 * AtmosphericVFX: Lightweight Canvas particle overlay for living graphic novel illustrations.
 * Types: 'dust' | 'rain' | 'sparks' | 'gold' | 'none'
 */
export default function AtmosphericVFX({ type = 'dust' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || type === 'none') return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 300);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initialize particles based on atmosphere type
    const count = type === 'rain' ? 45 : type === 'gold' ? 35 : type === 'sparks' ? 25 : 30;
    const particles = Array.from({ length: count }, () => createParticle(type, width, height, true));

    function createParticle(kind, w, h, randomizeY = false) {
      if (kind === 'rain') {
        return {
          x: Math.random() * (w + 60) - 30,
          y: randomizeY ? Math.random() * h : -20,
          len: 12 + Math.random() * 16,
          speed: 7 + Math.random() * 5,
          opacity: 0.15 + Math.random() * 0.25,
          wind: -1.5,
        };
      }
      if (kind === 'sparks') {
        return {
          x: Math.random() * w,
          y: randomizeY ? Math.random() * h : h + 10,
          size: 1 + Math.random() * 2,
          speedY: -(0.8 + Math.random() * 1.6),
          speedX: (Math.random() - 0.5) * 1.2,
          opacity: 0.4 + Math.random() * 0.5,
          life: 0.6 + Math.random() * 0.4,
        };
      }
      if (kind === 'gold') {
        return {
          x: Math.random() * w,
          y: randomizeY ? Math.random() * h : -10,
          size: 1.5 + Math.random() * 2.5,
          speedY: 0.3 + Math.random() * 0.7,
          speedX: (Math.random() - 0.5) * 0.6,
          opacity: 0.3 + Math.random() * 0.6,
          pulse: Math.random() * Math.PI,
        };
      }
      // Default: 'dust' (warm sunlit dust motes)
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        size: 1.2 + Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.25,
        opacity: 0.15 + Math.random() * 0.35,
        pulse: Math.random() * Math.PI,
      };
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (type === 'rain') {
          p.x += p.wind;
          p.y += p.speed;

          if (p.y > height || p.x < -30) {
            particles[i] = createParticle('rain', width, height, false);
          }

          ctx.strokeStyle = `rgba(200, 220, 240, ${p.opacity})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.wind * 2.5, p.y + p.len);
          ctx.stroke();
        } else if (type === 'sparks') {
          p.x += p.speedX;
          p.y += p.speedY;
          p.opacity -= 0.003;

          if (p.y < -10 || p.opacity <= 0) {
            particles[i] = createParticle('sparks', width, height, false);
          }

          ctx.fillStyle = `rgba(255, 180, 50, ${Math.max(0, p.opacity)})`;
          ctx.shadowColor = 'rgba(255, 140, 0, 0.8)';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (type === 'gold') {
          p.x += p.speedX;
          p.y += p.speedY;
          p.pulse += 0.03;
          const currentOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

          if (p.y > height + 10) {
            particles[i] = createParticle('gold', width, height, false);
          }

          ctx.fillStyle = `rgba(240, 200, 80, ${Math.max(0, currentOpacity)})`;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.9)';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // 'dust'
          p.x += p.speedX;
          p.y += p.speedY;
          p.pulse += 0.02;
          const currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.fillStyle = `rgba(235, 215, 175, ${currentOpacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [type]);

  if (type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-none w-full h-full mix-blend-screen"
    />
  );
}

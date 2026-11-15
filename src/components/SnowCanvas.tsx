import React, { useEffect, useRef } from 'react';

interface SnowCanvasProps {
  burstKey: number;
  isBigBurst?: boolean;
  paused?: boolean;
}

interface Flake {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  alpha: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const SPARK_COLORS = ['#FDE047', '#F59E0B', '#FEF3C7', '#EF4444', '#34D399'];

export const SnowCanvas: React.FC<SnowCanvasProps> = ({
  burstKey,
  isBigBurst = false,
  paused = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<Spark[]>([]);
  const sparkHeadRef = useRef(0);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // Trigger celebratory gold sparks without tearing down animation loop
  useEffect(() => {
    if (burstKey === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const count = isBigBurst ? 36 : 16;
    const pool = sparksRef.current;

    for (let i = 0; i < count; i++) {
      const idx = sparkHeadRef.current % pool.length;
      sparkHeadRef.current++;
      const angle = -Math.PI * 0.85 + Math.random() * Math.PI * 0.7;
      const speed = (isBigBurst ? 260 : 180) + Math.random() * 240;
      pool[idx].x = w * (0.3 + Math.random() * 0.4);
      pool[idx].y = h * 0.45;
      pool[idx].vx = Math.cos(angle) * speed;
      pool[idx].vy = Math.sin(angle) * speed - 60;
      pool[idx].life = 0.9 + Math.random() * 0.6;
      pool[idx].maxLife = pool[idx].life;
      pool[idx].size = 2.5 + Math.random() * 3.5;
      pool[idx].color = SPARK_COLORS[i % SPARK_COLORS.length];
    }
  }, [burstKey, isBigBurst]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const flakes: Flake[] = Array.from({ length: 26 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 1.2 + Math.random() * 2,
      vy: 18 + Math.random() * 24,
      vx: -7 + Math.random() * 14,
      alpha: 0.16 + Math.random() * 0.28,
    }));

    // Pre-allocate pooled spark ring buffer
    sparksRef.current = Array.from({ length: 80 }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      size: 3,
      color: '#FDE047',
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let rafId = 0;
    let lastTime = performance.now();
    let accum = 0;

    const frame = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;

      if (!pausedRef.current) {
        accum += Math.min(rawDt, 0.05);
        if (accum >= 1 / 32) {
          const dt = Math.min(accum, 0.05);
          accum = 0;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (!reducedMotion) {
            for (let i = 0; i < flakes.length; i++) {
              const f = flakes[i];
              f.y += f.vy * dt;
              f.x += f.vx * dt + Math.sin(now * 0.0008 + i) * 6 * dt;
              if (f.y > canvas.height + 6) {
                f.y = -6;
                f.x = Math.random() * canvas.width;
              }
              if (f.x < -6) f.x = canvas.width + 6;
              if (f.x > canvas.width + 6) f.x = -6;

              ctx.globalAlpha = f.alpha;
              ctx.fillStyle = '#FAF6EE';
              ctx.beginPath();
              ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
              ctx.fill();
            }

            const pool = sparksRef.current;
            for (let i = 0; i < pool.length; i++) {
              const s = pool[i];
              if (s.life <= 0) continue;
              s.life -= dt;
              s.vy += 420 * dt;
              s.x += s.vx * dt;
              s.y += s.vy * dt;
              ctx.globalAlpha = Math.max(0, s.life / s.maxLife);
              ctx.fillStyle = s.color;
              ctx.beginPath();
              ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.globalAlpha = 1;
        }
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};

"use client";

import { useEffect, useRef, useCallback } from "react";

interface ParticleTextProps {
  text: string;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  color: { r: number; g: number; b: number };
  targetColor: { r: number; g: number; b: number };
  size: number;
  speed: number;
  arrived: boolean;
}

const PRIMARY_COLOR = { r: 20, g: 184, b: 166 }; // Teal #14B8A6

export function ParticleText({ text, className = "" }: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  const generateParticles = useCallback((canvas: HTMLCanvasElement) => {
    const offscreen = document.createElement("canvas");
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return;

    offscreen.width = canvas.width;
    offscreen.height = canvas.height;

    const fontSize = Math.min(canvas.width / (text.length * 0.6), 60);
    offCtx.font = `bold ${fontSize}px system-ui, sans-serif`;
    offCtx.fillStyle = "white";
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";
    offCtx.fillText(text, canvas.width / 2, canvas.height / 2);

    const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
    const particles: Particle[] = [];
    const step = 4;

    for (let y = 0; y < offscreen.height; y += step) {
      for (let x = 0; x < offscreen.width; x += step) {
        const i = (y * offscreen.width + x) * 4;
        if (imageData.data[i + 3] > 128) {
          const edge = Math.floor(Math.random() * 4);
          let startX: number, startY: number;

          switch (edge) {
            case 0: startX = Math.random() * canvas.width; startY = -20; break;
            case 1: startX = canvas.width + 20; startY = Math.random() * canvas.height; break;
            case 2: startX = Math.random() * canvas.width; startY = canvas.height + 20; break;
            default: startX = -20; startY = Math.random() * canvas.height;
          }

          particles.push({
            x: startX,
            y: startY,
            targetX: x,
            targetY: y,
            vx: 0,
            vy: 0,
            color: { r: 255, g: 255, b: 255 },
            targetColor: PRIMARY_COLOR,
            size: 2 + Math.random() * 1.5,
            speed: 0.02 + Math.random() * 0.03,
            arrived: false,
          });
        }
      }
    }

    particlesRef.current = particles;
  }, [text]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      generateParticles(canvas);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      ctx.fillStyle = "rgba(248, 250, 252, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
          p.vx += dx * p.speed;
          p.vy += dy * p.speed;
          p.vx *= 0.92;
          p.vy *= 0.92;
          p.x += p.vx;
          p.y += p.vy;

          // Color transition
          p.color.r += (p.targetColor.r - p.color.r) * 0.02;
          p.color.g += (p.targetColor.g - p.color.g) * 0.02;
          p.color.b += (p.targetColor.b - p.color.b) * 0.02;
        } else {
          p.arrived = true;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${Math.round(p.color.r)}, ${Math.round(p.color.g)}, ${Math.round(p.color.b)})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [generateParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-16 sm:h-20 ${className}`}
      style={{ display: "block" }}
    />
  );
}

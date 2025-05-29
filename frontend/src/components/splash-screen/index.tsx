'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type SplashScreenProps = {
  useNavigate?: boolean;
  routePath?: string;
  text?: string;
};

export default function SplashScreen({
  useNavigate = true,
  routePath = 'main',
  text = 'A human-in-the-loop, no-code AI platform for pathology',
}: SplashScreenProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * (canvas?.width ?? 0);
        this.y = Math.random() * (canvas?.height ?? 0);
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = `hsla(${Math.random() * 60 + 200}, 70%, 60%, ${
          Math.random() * 0.5 + 0.3
        })`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > (canvas?.width ?? 0)) this.x = 0;
        if (this.x < 0) this.x = canvas?.width ?? 0;
        if (this.y > (canvas?.height ?? 0)) this.y = 0;
        if (this.y < 0) this.y = canvas?.height ?? 0;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    const particlesArray: Particle[] = [];
    const numberOfParticles = 100;

    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }

    // Animation function
    function animate() {
      if (!canvas) return;
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx?.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height,
      );
      gradient.addColorStop(0, 'rgba(10, 10, 20, 1)');
      gradient.addColorStop(1, 'rgba(5, 5, 15, 1)');
      if (!ctx) return;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }

      // Draw connections
      if (!ctx) return;
      ctx.strokeStyle = 'rgba(140, 160, 240, 0.1)';
      ctx.lineWidth = 0.5;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            if (!ctx) return;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, []);

  // Navigation timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        if (useNavigate) {
          router.push(`/${routePath}`);
        }
      }, 800);
    }, 3500);

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + 1.5;
      });
    }, 40);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [router]);

  return (
    <div
      className={`duration-800 fixed inset-0 z-50 transition-opacity ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        <div className="relative">
          {/* Animated circles */}
          <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/10 blur-3xl"></div>
          <div
            className="absolute inset-[-20px] animate-pulse rounded-full bg-indigo-500/5 blur-2xl"
            style={{ animationDelay: '0.5s' }}
          ></div>
          <div
            className="absolute inset-[-40px] animate-pulse rounded-full bg-purple-500/5 blur-xl"
            style={{ animationDelay: '1s' }}
          ></div>

          {/* Logo */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 h-52 w-52 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl"></div>
            <div className="relative flex h-52 w-52 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-blue-900/80 to-indigo-900/80 p-8 backdrop-blur-sm">
              <Image
                src="/icons/pathos-logo-symbol.svg"
                alt="PathOs Logo"
                width={128}
                height={128}
              />
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="mt-10 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-6xl font-bold text-transparent">
          PathOs
        </h1>
        <p className="mt-4 text-xl text-blue-100/80">
          Pathologist Optimal Segmentation
        </p>

        {/* Progress bar */}
        <div className="relative mt-16 w-80">
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-blue-900/50">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Floating particles */}
          <div
            className="animate-float absolute -top-4 left-1/4 h-2 w-2 rounded-full bg-blue-400/80"
            style={{ animationDuration: '3s' }}
          ></div>
          <div
            className="animate-float absolute -bottom-4 left-1/2 h-3 w-3 rounded-full bg-purple-400/80"
            style={{ animationDuration: '4s', animationDelay: '0.5s' }}
          ></div>
          <div
            className="animate-float absolute -top-6 left-3/4 h-2 w-2 rounded-full bg-indigo-400/80"
            style={{ animationDuration: '3.5s', animationDelay: '1s' }}
          ></div>
        </div>

        <p className="mt-8 text-lg text-blue-200/50">{text}</p>
      </div>
    </div>
  );
}

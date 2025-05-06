'use client';

import React, { useEffect, useRef } from 'react';

export default function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 570;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const waves = [
      { amplitude: 60, period: 200, speed: 0.0004, offset: 0 },
      { amplitude: 20, period: 180, speed: 0.00036, offset: 1 },
      { amplitude: 70, period: 220, speed: 0.00044, offset: 2 },
      { amplitude: 25, period: 250, speed: 0.00034, offset: 3 },
      { amplitude: 50, period: 150, speed: 0.00038, offset: 4 },
      { amplitude: 15, period: 190, speed: 0.00042, offset: 5 },
      { amplitude: 55, period: 230, speed: 0.00032, offset: 6 },
      { amplitude: 18, period: 170, speed: 0.0004, offset: 7 },
      { amplitude: 65, period: 210, speed: 0.00036, offset: 8 },
      { amplitude: 22, period: 240, speed: 0.0003, offset: 9 },
    ];

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(77, 77, 77, 0.19)';
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x++) {
          const time = Date.now() * wave.speed + wave.offset;
          const y =
            Math.sin(x / wave.period + time) * wave.amplitude +
            canvas.height -
            230 +
            (index - waves.length / 2) * 15;

          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative h-[500px] w-full overflow-hidden bg-white">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

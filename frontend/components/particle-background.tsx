"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  opacity: number
  pulse: boolean
  pulseSpeed: number
  maxOpacity: number
  minOpacity: number
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full screen
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    handleResize()
    window.addEventListener("resize", handleResize)

    // Create particles
    const particles: Particle[] = []
    const colors = ["#3b82f6", "#a855f7", "#2A3A64", "#93c5fd", "#c4b5fd"]

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5,
        pulse: true,
        pulseSpeed: Math.random() * 0.01,
        maxOpacity: Math.random() * 0.5 + 0.3,
        minOpacity: Math.random() * 0.2,
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw particles
      particles.forEach((particle) => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.fill()

        // Update particle position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Pulse opacity
        if (particle.pulse) {
          particle.opacity += particle.pulseSpeed
          if (particle.opacity >= particle.maxOpacity) {
            particle.pulse = false
          }
        } else {
          particle.opacity -= particle.pulseSpeed
          if (particle.opacity <= particle.minOpacity) {
            particle.pulse = true
          }
        }
      })

      // Draw connections
      particles.forEach((particle, i) => {
        particles.forEach((otherParticle, j) => {
          if (i < j) {
            const dx = particle.x - otherParticle.x
            const dy = particle.y - otherParticle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 150) {
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(otherParticle.x, otherParticle.y)
              ctx.strokeStyle = particle.color
              ctx.globalAlpha = (1 - distance / 150) * 0.15
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          }
        })
      })

      ctx.globalAlpha = 1
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 opacity-60" />
}

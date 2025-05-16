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
  growing: boolean
}

export default function AnimatedBackground() {
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
    const colors = ["#D5E4FE", "#E1CDFF", "#B8D4FD", "#9361C6", "#3C59A2"]

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.1,
        growing: Math.random() > 0.5,
      })
    }

    // Create cell-like structures
    const cells: Particle[] = []
    for (let i = 0; i < 15; i++) {
      cells.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 40 + 20,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.05,
        growing: Math.random() > 0.5,
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw cells (background)
      cells.forEach((cell) => {
        ctx.beginPath()
        ctx.arc(cell.x, cell.y, cell.size, 0, Math.PI * 2)
        ctx.fillStyle = cell.color
        ctx.globalAlpha = cell.opacity
        ctx.fill()

        // Update cell position
        cell.x += cell.speedX
        cell.y += cell.speedY

        // Bounce off walls
        if (cell.x < 0 || cell.x > canvas.width) cell.speedX *= -1
        if (cell.y < 0 || cell.y > canvas.height) cell.speedY *= -1

        // Pulsate size
        if (cell.growing) {
          cell.size += 0.1
          if (cell.size > 60) cell.growing = false
        } else {
          cell.size -= 0.1
          if (cell.size < 20) cell.growing = true
        }
      })

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

        // Pulsate size
        if (particle.growing) {
          particle.size += 0.02
          if (particle.size > 4) particle.growing = false
        } else {
          particle.size -= 0.02
          if (particle.size < 1) particle.growing = true
        }
      })

      ctx.globalAlpha = 1
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 opacity-40" />
}

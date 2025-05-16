"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export default function DataFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Data flow parameters
    const flowLines: {
      startX: number
      startY: number
      endX: number
      endY: number
      progress: number
      speed: number
      width: number
      color: string
      particles: { x: number; y: number; size: number; opacity: number }[]
    }[] = []

    // Create flow lines
    const createFlowLine = () => {
      const startY = 20 + Math.random() * (canvas.height - 40)  // 상하 여백 조금 주기
      const startX = -100
      const endX = canvas.width + 100
      const endY = startY + (Math.random() - 0.5) * 20  // 살짝 기울기 주기
      const width = 1 + Math.random() * 2
      const speed = 0.005 + Math.random() * 0.01
      const color = Math.random() > 0.5
          ? "#3b82f6"
          : Math.random() > 0.5
              ? "#a855f7"
              : Math.random() > 0.5
                  ? "#93c5fd"
                  : "#c4b5fd"

      flowLines.push({
        startX,
        startY,
        endX,
        endY,
        progress: 0,
        speed,
        width,
        color,
        particles: [],
      })
    }

    // Create initial flow lines
    for (let i = 0; i < 7; i++) {
      createFlowLine()
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw flow lines
      for (let i = 0; i < flowLines.length; i++) {
        const line = flowLines[i]

        // Update progress
        line.progress += line.speed
        if (line.progress >= 1) {
          // Reset line
          line.startY = 50 + Math.random() * 200
          line.endY = 50 + Math.random() * 200
          line.progress = 0
          line.particles = []
          line.speed = 0.005 + Math.random() * 0.01
          line.width = 1 + Math.random() * 3
          line.color =
              Math.random() > 0.5
                  ? "#3b82f6"
                  : Math.random() > 0.5
                      ? "#a855f7"
                      : Math.random() > 0.5
                          ? "#93c5fd"
                          : "#c4b5fd"
        }

        // Calculate current position
        const currentX = line.startX + (line.endX - line.startX) * line.progress
        const currentY = line.startY + (line.endY - line.startY) * line.progress

        // Draw line
        ctx.beginPath()
        ctx.moveTo(line.startX, line.startY)
        ctx.lineTo(currentX, currentY)
        ctx.strokeStyle = line.color
        ctx.lineWidth = line.width
        ctx.globalAlpha = 0.5
        ctx.stroke()

        // Add particles along the line
        if (Math.random() > 0.7) {
          const particleX = line.startX + (currentX - line.startX) * Math.random()
          const particleY = line.startY + (currentY - line.startY) * Math.random()
          line.particles.push({
            x: particleX,
            y: particleY,
            size: 1 + Math.random() * 2,
            opacity: 0.5 + Math.random() * 0.5,
          })
        }

        // Draw particles
        line.particles.forEach((particle, index) => {
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = line.color
          ctx.globalAlpha = particle.opacity
          ctx.fill()

          // Fade out particles
          particle.opacity -= 0.01
          if (particle.opacity <= 0) {
            line.particles.splice(index, 1)
          }
        })
      }

      // Create new flow lines occasionally
      if (Math.random() > 0.999 && flowLines.length < 25) {
        createFlowLine()
      }

      ctx.globalAlpha = 1
      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
      <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8}}
          className="relative w-full flex items-center justify-center"
      >
        <canvas ref={canvasRef} className="w-full h-full"/>
      </motion.div>

  )
}

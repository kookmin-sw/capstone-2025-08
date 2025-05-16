"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export default function CellAnalysis() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 500
    canvas.height = 500

    // Cell parameters
    const cells: {
      x: number
      y: number
      radius: number
      color: string
      opacity: number
      highlighted: boolean
      highlightProgress: number
      dx: number
      dy: number
      nucleusRadius: number
      nucleusColor: string
      organelles: { x: number; y: number; radius: number; color: string }[]
    }[] = []

    // Create cells
    for (let i = 0; i < 15; i++) {
      const x = 100 + Math.random() * 300
      const y = 100 + Math.random() * 300
      const radius = 20 + Math.random() * 30
      const nucleusRadius = radius * 0.4
      const color = `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(
          Math.random() * 100 + 155,
      )}, 0.3)`
      const nucleusColor = `rgba(${Math.floor(Math.random() * 50 + 50)}, ${Math.floor(
          Math.random() * 50 + 100,
      )}, ${Math.floor(Math.random() * 50 + 150)}, 0.5)`

      // Create organelles
      const organelles = []
      const organelleCount = 3 + Math.floor(Math.random() * 5)
      for (let j = 0; j < organelleCount; j++) {
        // Position within cell but not in nucleus
        let orgX, orgY, distFromCenter
        do {
          orgX = (Math.random() * 2 - 1) * (radius * 0.8)
          orgY = (Math.random() * 2 - 1) * (radius * 0.8)
          distFromCenter = Math.sqrt(orgX * orgX + orgY * orgY)
        } while (distFromCenter < nucleusRadius)

        organelles.push({
          x: orgX,
          y: orgY,
          radius: 2 + Math.random() * 4,
          color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(
              Math.random() * 100 + 100,
          )}, 0.6)`,
        })
      }

      cells.push({
        x,
        y,
        radius,
        color,
        opacity: 0.7,
        highlighted: false,
        highlightProgress: 0,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        nucleusRadius,
        nucleusColor,
        organelles,
      })
    }

    // Highlight random cells
    const highlightCells = () => {
      // Reset highlights
      cells.forEach((cell) => {
        cell.highlighted = false
      })

      // Highlight 1-3 random cells
      const count = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * cells.length)
        cells[index].highlighted = true
      }

      // Schedule next highlight
      setTimeout(highlightCells, 2000 + Math.random() * 2000)
    }

    highlightCells()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw circular background
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2)
      const bgGradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 2,
      )
      bgGradient.addColorStop(0, "rgba(10, 15, 24, 0.9)")
      bgGradient.addColorStop(1, "rgba(10, 15, 24, 0.95)")
      ctx.fillStyle = bgGradient
      ctx.fill()

      // Draw grid
      ctx.strokeStyle = "rgba(59, 130, 246, 0.1)" // blue-500 with low opacity
      ctx.lineWidth = 0.5

      // Draw circles
      for (let r = 50; r < canvas.width / 2; r += 50) {
        ctx.beginPath()
        ctx.arc(canvas.width / 2, canvas.height / 2, r, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw crosshair
      ctx.beginPath()
      ctx.moveTo(0, canvas.height / 2)
      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.moveTo(canvas.width / 2, 0)
      ctx.lineTo(canvas.width / 2, canvas.height)
      ctx.stroke()

      // Update and draw cells
      cells.forEach((cell) => {
        // Update position
        cell.x += cell.dx
        cell.y += cell.dy

        // Bounce off edges
        if (cell.x < cell.radius || cell.x > canvas.width - cell.radius) cell.dx *= -1
        if (cell.y < cell.radius || cell.y > canvas.height - cell.radius) cell.dy *= -1

        // Update highlight progress
        if (cell.highlighted && cell.highlightProgress < 1) {
          cell.highlightProgress += 0.05
        } else if (!cell.highlighted && cell.highlightProgress > 0) {
          cell.highlightProgress -= 0.05
        }

        // Draw cell
        ctx.beginPath()
        ctx.arc(cell.x, cell.y, cell.radius, 0, Math.PI * 2)
        ctx.fillStyle = cell.color
        ctx.globalAlpha = cell.opacity
        ctx.fill()

        // Draw organelles
        cell.organelles.forEach((organelle) => {
          ctx.beginPath()
          ctx.arc(cell.x + organelle.x, cell.y + organelle.y, organelle.radius, 0, Math.PI * 2)
          ctx.fillStyle = organelle.color
          ctx.fill()
        })

        // Draw nucleus
        ctx.beginPath()
        ctx.arc(cell.x, cell.y, cell.nucleusRadius, 0, Math.PI * 2)
        ctx.fillStyle = cell.nucleusColor
        ctx.fill()

        // Draw highlight if needed
        if (cell.highlightProgress > 0) {
          // Draw scanning effect
          ctx.beginPath()
          ctx.arc(cell.x, cell.y, cell.radius + 5, 0, Math.PI * 2)
          ctx.strokeStyle = "#3b82f6" // blue-500
          ctx.lineWidth = 2 * cell.highlightProgress
          ctx.globalAlpha = 0.7 * cell.highlightProgress
          ctx.stroke()

          // Draw data points
          const dataPoints = 8
          for (let i = 0; i < dataPoints; i++) {
            const angle = (i / dataPoints) * Math.PI * 2
            const distance = cell.radius + 20
            const x = cell.x + Math.cos(angle) * distance
            const y = cell.y + Math.sin(angle) * distance

            // Draw line to data point
            ctx.beginPath()
            ctx.moveTo(cell.x + Math.cos(angle) * cell.radius, cell.y + Math.sin(angle) * cell.radius)
            ctx.lineTo(x, y)
            ctx.strokeStyle = "#3b82f6" // blue-500
            ctx.lineWidth = 1
            ctx.globalAlpha = 0.5 * cell.highlightProgress
            ctx.stroke()

            // Draw data point
            ctx.beginPath()
            ctx.arc(x, y, 2, 0, Math.PI * 2)
            ctx.fillStyle = "#3b82f6" // blue-500
            ctx.globalAlpha = cell.highlightProgress
            ctx.fill()
          }

          // Draw label
          ctx.font = "10px Arial"
          ctx.fillStyle = "#3b82f6" // blue-500
          ctx.globalAlpha = cell.highlightProgress
          ctx.fillText(`Cell #${Math.floor(cell.x * cell.y) % 1000}`, cell.x - 20, cell.y - cell.radius - 10)
          ctx.fillText(
              `R: ${cell.radius.toFixed(1)} | N: ${cell.nucleusRadius.toFixed(1)}`,
              cell.x - 20,
              cell.y - cell.radius - 25,
          )
        }
      })

      ctx.globalAlpha = 1

      // Draw vignette effect
      const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 3,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width / 1.5,
      )
      gradient.addColorStop(0, "transparent")
      gradient.addColorStop(1, "rgba(10, 15, 24, 0.8)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
      <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative w-full h-full flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 to-transparent opacity-50"></div>
        <canvas ref={canvasRef} className="w-full h-full max-w-[500px] max-h-[500px]" />
      </motion.div>
  )
}

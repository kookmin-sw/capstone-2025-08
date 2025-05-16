"use client"

import { useEffect, useRef } from "react"

export default function MicroscopeView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 400
    canvas.height = 400

    // Cell parameters
    const cells: {
      x: number
      y: number
      size: number
      color: string
      opacity: number
      dx: number
      dy: number
      highlighted: boolean
    }[] = []

    const colors = ["#D5E4FE", "#E1CDFF", "#B8D4FD", "#9361C6", "#3C59A2"]

    // Create cells
    for (let i = 0; i < 50; i++) {
      cells.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 5 + Math.random() * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.3 + Math.random() * 0.4,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        highlighted: false,
      })
    }

    // Highlight random cells periodically
    const highlightCells = () => {
      // Reset all highlights
      cells.forEach((cell) => {
        cell.highlighted = false
      })

      // Highlight 3-5 random cells
      const count = 3 + Math.floor(Math.random() * 3)
      for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * cells.length)
        cells[index].highlighted = true
      }

      // Schedule next highlight
      setTimeout(highlightCells, 2000 + Math.random() * 2000)
    }

    highlightCells()

    // Draw circular mask
    const drawMask = () => {
      ctx.save()
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2)
      ctx.clip()
    }

    // Draw microscope grid
    const drawGrid = () => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
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
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Apply circular mask
      drawMask()

      // Fill background
      ctx.fillStyle = "rgba(8, 7, 16, 0.9)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      drawGrid()

      // Draw cells
      cells.forEach((cell) => {
        // Update position
        cell.x += cell.dx
        cell.y += cell.dy

        // Bounce off edges
        if (cell.x < cell.size || cell.x > canvas.width - cell.size) cell.dx *= -1
        if (cell.y < cell.size || cell.y > canvas.height - cell.size) cell.dy *= -1

        // Draw cell
        ctx.beginPath()
        ctx.arc(cell.x, cell.y, cell.size, 0, Math.PI * 2)

        if (cell.highlighted) {
          // Draw highlighted cell with glow
          const gradient = ctx.createRadialGradient(cell.x, cell.y, 0, cell.x, cell.y, cell.size * 2)
          gradient.addColorStop(0, "#9361C6")
          gradient.addColorStop(0.6, "rgba(147, 97, 198, 0.4)")
          gradient.addColorStop(1, "transparent")
          ctx.fillStyle = gradient
          ctx.fill()

          // Draw cell outline
          ctx.strokeStyle = "#E1CDFF"
          ctx.lineWidth = 2
          ctx.stroke()

          // Draw cell center
          ctx.beginPath()
          ctx.arc(cell.x, cell.y, cell.size * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = "#E1CDFF"
          ctx.fill()
        } else {
          // Draw normal cell
          ctx.fillStyle = cell.color
          ctx.globalAlpha = cell.opacity
          ctx.fill()
          ctx.globalAlpha = 1
        }
      })

      // Restore context
      ctx.restore()

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
      gradient.addColorStop(1, "rgba(8, 7, 16, 0.8)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
      <div
          className="relative w-full aspect-square max-w-[400px] mx-auto overflow-hidden rounded-full border-4 border-pathos-navy/30">
        <canvas ref={canvasRef} className="w-full h-full"/>
      </div>

  )
}

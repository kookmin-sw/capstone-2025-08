"use client"

import { useEffect, useRef } from "react"

export default function DnaHelix() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 300
    canvas.height = 600

    // DNA parameters
    const dnaWidth = 200
    const nucleotideSpacing = 20
    const nucleotideRadius = 4
    const backboneWidth = 2
    const rotationSpeed = 0.01
    const colors = ["#D5E4FE", "#E1CDFF", "#9361C6", "#3C59A2"]

    let rotation = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Center the DNA
      ctx.translate(canvas.width / 2, 0)

      // Draw DNA
      for (let y = -100; y < canvas.height + 100; y += nucleotideSpacing) {
        // Calculate x positions for the two backbones
        const xOffset = Math.sin(y * 0.02 + rotation) * (dnaWidth / 2)
        const x1 = -dnaWidth / 4 + xOffset
        const x2 = dnaWidth / 4 + xOffset

        // Draw connecting line (base pair)
        ctx.beginPath()
        ctx.moveTo(x1, y)
        ctx.lineTo(x2, y)
        ctx.strokeStyle = `rgba(225, 205, 255, ${0.3 + Math.sin(y * 0.02 + rotation) * 0.2})`
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw nucleotides
        const colorIndex1 = Math.floor((y / nucleotideSpacing) % colors.length)
        const colorIndex2 = (colorIndex1 + 2) % colors.length

        ctx.beginPath()
        ctx.arc(x1, y, nucleotideRadius, 0, Math.PI * 2)
        ctx.fillStyle = colors[colorIndex1]
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x2, y, nucleotideRadius, 0, Math.PI * 2)
        ctx.fillStyle = colors[colorIndex2]
        ctx.fill()

        // Draw backbone segments
        if (y < canvas.height) {
          // Left backbone
          ctx.beginPath()
          ctx.moveTo(x1, y)
          const nextY = y + nucleotideSpacing
          const nextX1 = -dnaWidth / 4 + Math.sin(nextY * 0.02 + rotation) * (dnaWidth / 2)
          ctx.lineTo(nextX1, nextY)
          ctx.strokeStyle = "rgba(184, 212, 253, 0.6)"
          ctx.lineWidth = backboneWidth
          ctx.stroke()

          // Right backbone
          ctx.beginPath()
          ctx.moveTo(x2, y)
          const nextX2 = dnaWidth / 4 + Math.sin(nextY * 0.02 + rotation) * (dnaWidth / 2)
          ctx.lineTo(nextX2, nextY)
          ctx.stroke()
        }
      }

      // Reset transformation
      ctx.setTransform(1, 0, 0, 1, 0, 0)

      // Update rotation
      rotation += rotationSpeed

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return <canvas ref={canvasRef} className="h-full w-auto opacity-40" />
}

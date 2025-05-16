"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export default function TechSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 500
    canvas.height = 500

    // Sphere parameters
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 180
    const nodeCount = 200
    const nodes: {
      theta: number
      phi: number
      x: number
      y: number
      z: number
      originalX: number
      originalY: number
      originalZ: number
      size: number
      color: string
      opacity: number
      highlight: boolean
      highlightProgress: number
    }[] = []

    // Colors
    const colors = ["#3b82f6", "#a855f7", "#93c5fd", "#c4b5fd"]

    // Create nodes on a sphere
    for (let i = 0; i < nodeCount; i++) {
      // Spherical coordinates
      const theta = Math.random() * Math.PI * 2 // longitude
      const phi = Math.acos(2 * Math.random() - 1) // latitude

      // Convert to Cartesian coordinates
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      nodes.push({
        theta,
        phi,
        x,
        y,
        z,
        originalX: x,
        originalY: y,
        originalZ: z,
        size: 1 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.3 + Math.random() * 0.5,
        highlight: false,
        highlightProgress: 0,
      })
    }

    // Rotation angles
    let rotationX = 0
    let rotationY = 0
    let rotationZ = 0

    // Highlight random nodes
    const highlightNodes = () => {
      // Reset highlights
      nodes.forEach((node) => {
        node.highlight = false
        node.highlightProgress = 0
      })

      // Highlight random nodes
      const count = 5 + Math.floor(Math.random() * 10)
      for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * nodes.length)
        nodes[index].highlight = true
      }

      // Schedule next highlight
      setTimeout(highlightNodes, 2000 + Math.random() * 3000)
    }

    highlightNodes()

    // Animation loop
    let startTime = performance.now()

    const animate = () => {
      const elapsed = performance.now() - startTime
      const seconds = elapsed / 1000

      // 일정한 속도 유지
      const rotationX = seconds * 0.1
      const rotationY = seconds * 0.05
      const rotationZ = seconds * 0.03

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Apply rotation to original positions
      nodes.forEach((node) => {
        const ox = node.originalX
        const oy = node.originalY
        const oz = node.originalZ

        const y1 = oy * Math.cos(rotationX) - oz * Math.sin(rotationX)
        const z1 = oy * Math.sin(rotationX) + oz * Math.cos(rotationX)

        const x2 = ox * Math.cos(rotationY) + z1 * Math.sin(rotationY)
        const z2 = -ox * Math.sin(rotationY) + z1 * Math.cos(rotationY)

        const x3 = x2 * Math.cos(rotationZ) - y1 * Math.sin(rotationZ)
        const y3 = x2 * Math.sin(rotationZ) + y1 * Math.cos(rotationZ)

        node.x = x3
        node.y = y3
        node.z = z2

        if (node.highlight && node.highlightProgress < 1) {
          node.highlightProgress += 0.05
        } else if (!node.highlight && node.highlightProgress > 0) {
          node.highlightProgress -= 0.05
        }
      })

      const sortedNodes = [...nodes].sort((a, b) => a.z - b.z)

      // Draw connections
      ctx.lineWidth = 0.5
      for (let i = 0; i < sortedNodes.length; i++) {
        const nodeA = sortedNodes[i]
        for (let j = i + 1; j < sortedNodes.length; j++) {
          const nodeB = sortedNodes[j]
          const dx = nodeA.x - nodeB.x
          const dy = nodeA.y - nodeB.y
          const dz = nodeA.z - nodeB.z
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (distance < 70) {
            ctx.beginPath()
            ctx.moveTo(centerX + nodeA.x, centerY + nodeA.y)
            ctx.lineTo(centerX + nodeB.x, centerY + nodeB.y)

            const isHighlighted = nodeA.highlightProgress > 0 || nodeB.highlightProgress > 0
            const highlightIntensity = Math.max(nodeA.highlightProgress, nodeB.highlightProgress)

            if (isHighlighted) {
              const gradient = ctx.createLinearGradient(
                  centerX + nodeA.x, centerY + nodeA.y,
                  centerX + nodeB.x, centerY + nodeB.y
              )
              gradient.addColorStop(0, nodeA.highlightProgress > 0 ? nodeA.color : "rgba(42, 58, 100, 0.2)")
              gradient.addColorStop(1, nodeB.highlightProgress > 0 ? nodeB.color : "rgba(42, 58, 100, 0.2)")
              ctx.strokeStyle = gradient
              ctx.globalAlpha = (0.2 + highlightIntensity * 0.8) * (1 - distance / 70)
            } else {
              ctx.strokeStyle = "rgba(42, 58, 100, 0.2)"
              ctx.globalAlpha = 0.2 * (1 - distance / 70)
            }

            ctx.stroke()
          }
        }
      }

      // Draw nodes
      sortedNodes.forEach((node) => {
        ctx.beginPath()
        ctx.arc(centerX + node.x, centerY + node.y, node.size * (1 + node.highlightProgress), 0, Math.PI * 2)

        if (node.highlightProgress > 0) {
          const gradient = ctx.createRadialGradient(
              centerX + node.x, centerY + node.y, 0,
              centerX + node.x, centerY + node.y,
              node.size * 5 * node.highlightProgress
          )
          gradient.addColorStop(0, node.color)
          gradient.addColorStop(1, "transparent")
          ctx.fillStyle = gradient
          ctx.globalAlpha = 0.5 * node.highlightProgress
          ctx.fill()

          ctx.beginPath()
          ctx.arc(centerX + node.x, centerY + node.y, node.size * (1 + node.highlightProgress), 0, Math.PI * 2)
          ctx.fillStyle = node.color
          ctx.globalAlpha = node.opacity + 0.3 * node.highlightProgress
        } else {
          ctx.fillStyle = "rgba(42, 58, 100, 0.8)"
          ctx.globalAlpha = node.opacity * (0.5 + (node.z + radius) / (2 * radius))
        }

        ctx.fill()
      })

      ctx.globalAlpha = 1
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
        <canvas ref={canvasRef} className="w-full h-full max-w-[500px] max-h-[500px]" />
      </motion.div>
  )
}

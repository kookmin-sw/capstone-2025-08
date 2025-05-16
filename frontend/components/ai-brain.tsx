"use client"

import { useEffect, useRef } from "react"

export default function AiBrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 300
    canvas.height = 300

    // Node parameters
    const nodes: { x: number; y: number; connections: number[]; size: number; pulse: number; pulseDir: boolean }[] = []
    const nodeCount = 30
    const colors = ["#D5E4FE", "#E1CDFF", "#B8D4FD", "#9361C6", "#3C59A2"]

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      // Position nodes in a brain-like shape
      const angle = Math.random() * Math.PI * 2
      const radius = 80 + Math.random() * 40
      const x = canvas.width / 2 + Math.cos(angle) * radius * (0.8 + Math.sin(angle * 2) * 0.3)
      const y = canvas.height / 2 + Math.sin(angle) * radius * 0.7

      nodes.push({
        x,
        y,
        connections: [],
        size: 2 + Math.random() * 3,
        pulse: Math.random(),
        pulseDir: Math.random() > 0.5,
      })
    }

    // Create connections between nodes
    nodes.forEach((node, i) => {
      // Connect to 2-4 closest nodes
      const connectionCount = 2 + Math.floor(Math.random() * 3)

      // Calculate distances to all other nodes
      const distances = nodes
        .map((otherNode, j) => {
          if (i === j) return Number.POSITIVE_INFINITY
          const dx = node.x - otherNode.x
          const dy = node.y - otherNode.y
          return { index: j, distance: Math.sqrt(dx * dx + dy * dy) }
        })
        .sort((a, b) => a.distance - b.distance)

      // Connect to closest nodes
      for (let j = 0; j < Math.min(connectionCount, distances.length); j++) {
        node.connections.push(distances[j].index)
      }
    })

    // Animation variables
    let activeNodes: { index: number; progress: number; color: string }[] = []

    const startNewActivation = () => {
      if (activeNodes.length > 10) return

      const startNode = Math.floor(Math.random() * nodes.length)
      const color = colors[Math.floor(Math.random() * colors.length)]

      activeNodes.push({
        index: startNode,
        progress: 0,
        color,
      })
    }

    // Start initial activations
    for (let i = 0; i < 3; i++) {
      startNewActivation()
    }

    // Schedule new activations
    setInterval(startNewActivation, 1000)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      nodes.forEach((node, i) => {
        node.connections.forEach((j) => {
          const otherNode = nodes[j]
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(otherNode.x, otherNode.y)
          ctx.strokeStyle = "rgba(184, 212, 253, 0.2)"
          ctx.lineWidth = 0.5
          ctx.stroke()
        })
      })

      // Draw nodes
      nodes.forEach((node, i) => {
        // Update pulse
        if (node.pulseDir) {
          node.pulse += 0.01
          if (node.pulse > 1) node.pulseDir = false
        } else {
          node.pulse -= 0.01
          if (node.pulse < 0) node.pulseDir = true
        }

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size * (0.8 + node.pulse * 0.4), 0, Math.PI * 2)
        ctx.fillStyle = "rgba(213, 228, 254, 0.6)"
        ctx.fill()
      })

      // Process active nodes
      const stillActive = []
      for (const active of activeNodes) {
        const node = nodes[active.index]

        // Draw active node with glow
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size * 1.5, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 3)
        gradient.addColorStop(0, active.color)
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw active connections
        if (active.progress > 0.1 && active.progress < 0.9) {
          node.connections.forEach((j) => {
            const otherNode = nodes[j]
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(otherNode.x, otherNode.y)
            ctx.strokeStyle = active.color
            ctx.lineWidth = 2
            ctx.globalAlpha = 0.7 - Math.abs(active.progress - 0.5) * 1.4
            ctx.stroke()
            ctx.globalAlpha = 1
          })
        }

        // Update progress
        active.progress += 0.02

        // Activate connected nodes when reaching certain progress
        if (active.progress >= 0.9 && active.progress <= 0.92) {
          node.connections.forEach((j) => {
            // 50% chance to activate connected node
            if (Math.random() > 0.5) {
              stillActive.push({
                index: j,
                progress: 0,
                color: active.color,
              })
            }
          })
        }

        // Keep if still active
        if (active.progress < 1) {
          stillActive.push(active)
        }
      }

      activeNodes = stillActive

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full opacity-80" />
}

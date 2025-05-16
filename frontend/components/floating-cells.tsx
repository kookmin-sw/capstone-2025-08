"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

export default function FloatingCells() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const cells = container.querySelectorAll(".floating-cell")

    cells.forEach((cell) => {
      // Random initial position
      const x = Math.random() * 100
      const y = Math.random() * 100

      // Random animation duration between 20-40s
      const duration = 20 + Math.random() * 20

      // Apply styles
      cell.setAttribute(
        "style",
        `
        left: ${x}%;
        top: ${y}%;
        animation-duration: ${duration}s;
        animation-delay: ${Math.random() * 5}s;
      `,
      )
    })
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="floating-cell absolute w-16 h-16 md:w-24 md:h-24 opacity-20 animate-float">
          <div className="relative w-full h-full">
            <Image
              src={`/placeholder.svg?height=100&width=100&text=Cell${i + 1}`}
              alt="Cell"
              fill
              className="object-contain rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

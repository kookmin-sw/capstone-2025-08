"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  title: string
  subtitle?: any
  align?: "left" | "center" | "right"
  children?: ReactNode
  className?: string
}

export default function SectionHeading({
                                         title,
                                         subtitle,
                                         align = "center",
                                         children,
                                         className,
                                       }: SectionHeadingProps) {
  const alignClass = {
    left: "text-left",
    center: "text-center mx-auto",
    right: "text-right ml-auto",
  }

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className={cn(`max-w-3xl ${alignClass[align]} space-y-4 mb-12`, className)}
      >
        <h2 className="text-3xl md:text-4xl font-orbitron font-bold">
        <span className="relative">
          {title}
          <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></span>
        </span>
        </h2>
        {subtitle && <p className="text-lg text-[#8A9CC2]">{subtitle}</p>}
        {children}
      </motion.div>
  )
}

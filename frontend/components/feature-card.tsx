"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  delay?: number
  className?: string
}

export default function FeatureCard({ icon, title, description, delay = 0, className }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true, margin: "-100px" }}
      className={cn("group relative", className)}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
      <div className="relative p-6 bg-[#0A0F18] rounded-lg border border-[#2A3A64]/40 h-full overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-md bg-[#2A3A64]/30 text-blue-500 relative">
          {icon}
          <span className="absolute -inset-1 rounded-md border border-blue-500/30 animate-ping opacity-20"></span>
        </div>
        <h3 className="text-xl font-orbitron font-medium mb-2 group-hover:text-blue-500 transition-colors">{title}</h3>
        <p className="text-[#8A9CC2] relative z-10">{description}</p>
      </div>
    </motion.div>
  )
}

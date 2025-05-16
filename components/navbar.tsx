"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X, Activity } from "lucide-react"
import { motion } from "framer-motion"
import {PathosLogoHorizontal} from "@/components/pathos-logo-horizontal";

const navItems = [
  { name: "Intro", href: "/" },
  { name: "Features", href: "/features" },
  { name: "Docs", href: "/resources" },
  { name: "Team", href: "/team" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled ? "bg-[#0A0F18]/80 backdrop-blur-md border-b border-[#2A3A64]/40 py-2" : "bg-transparent py-4",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <PathosLogoHorizontal className="w-48 h-16 -mt-2"/>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors rounded-md group",
                  pathname === item.href ? "text-blue-500" : "text-[#8A9CC2] hover:text-white",
                )}
              >
                {pathname === item.href && (
                  <motion.span
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-md bg-blue-500/10"
                    transition={{ type: "spring", duration: 0.6 }}
                  ></motion.span>
                )}
                <span className="relative z-10">{item.name}</span>
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform -translate-x-1/2 transition-all duration-300 group-hover:w-4/5"></span>
              </Link>
            ))}
            <Button className="ml-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-glow transition-all duration-300 relative overflow-hidden group">
              <span className="relative z-10">Get Started</span>
              <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 py-3 bg-[#0A0F18]/95 backdrop-blur-md border-b border-[#2A3A64]/40">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block py-2 px-3 text-base font-medium rounded-md",
                  pathname === item.href
                    ? "bg-blue-500/10 text-blue-500"
                    : "text-[#8A9CC2] hover:bg-[#2A3A64]/20 hover:text-white",
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-glow transition-all duration-300">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

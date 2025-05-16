"use client"

import {Github} from "lucide-react"

export default function Footer() {
  return (
      <footer className="relative z-10 border-t border-[#2A3A64]/40 bg-[#0A0F18]/80 backdrop-blur-md mt-20">
        <div className="flex flex-row mx-auto items-center justify-between px-8 py-6">
          <div className="flex space-x-4 items-center">
            <a
                href="https://github.com/kookmin-sw/capstone-2025-08"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-[#2A3A64]/30 flex items-center justify-center hover:bg-blue-500/20 transition-colors duration-300"
            >
              <Github className="h-4 w-4 text-[#8A9CC2] hover:text-blue-500"/>
            </a>
            <p className="text-sm text-[#8A9CC2]">&copy; {new Date().getFullYear()} PathOs. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-[#8A9CC2] hover:text-blue-500 transition-colors duration-300">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-[#8A9CC2] hover:text-blue-500 transition-colors duration-300">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
  )
}

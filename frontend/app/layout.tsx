import type React from "react"
import type { Metadata } from "next"
import { Inter, Orbitron } from "next/font/google"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { cn } from "@/lib/utils"
import ParticleBackground from "@/components/particle-background"
import Footer from "@/components/footer"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "PathOs",
  description:
    "병리학자가 WSI에서 원하는 세포 및 조직을 빠르게 학습·추론할수 있도록 돕는 Human-in-the-loop 기반의 노코드 병리 AI 서비스",
    generator: 'v0.dev',
  icons: {
    icon: '/capstone-2025-08/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={cn("min-h-screen font-sans antialiased", inter.variable, orbitron.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="relative min-h-screen bg-gradient-to-b from-[#0A0F18] via-[#121A2A] to-[#0A0F18] overflow-hidden">
            <ParticleBackground />
            <div className="grid-pattern absolute inset-0 opacity-20"></div>
            <Navbar />
            <main className="relative z-10">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

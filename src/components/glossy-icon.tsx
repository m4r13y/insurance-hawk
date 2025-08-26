"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GlossyIconProps {
  children: ReactNode
  color: "red" | "blue" | "green" | "slate" | "purple" | "orange"
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export default function GlossyIcon({ children, color, size = "md", className = "" }: GlossyIconProps) {
  const colorClasses = {
    red: {
      bg: "bg-gradient-to-br from-red-400 to-red-600",
      glow: "shadow-red-500/25",
      outerGlow: "shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    },
    blue: {
      bg: "bg-gradient-to-br from-primary/80 to-primary",
      glow: "shadow-primary/25",
      outerGlow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
    },
    green: {
      bg: "bg-gradient-to-br from-green-400 to-green-600",
      glow: "shadow-green-500/25",
      outerGlow: "shadow-[0_0_20px_rgba(34,197,94,0.15)]",
    },
    slate: {
      bg: "bg-gradient-to-br from-muted to-muted-foreground/80",
      glow: "shadow-muted/25",
      outerGlow: "shadow-[0_0_20px_rgba(100,116,139,0.15)]",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-400 to-purple-600",
      glow: "shadow-purple-500/25",
      outerGlow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-400 to-orange-600",
      glow: "shadow-orange-500/25",
      outerGlow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]",
    },
  }

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  }

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10",
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-2xl shadow-lg transition-all duration-300 hover:scale-105",
        sizeClasses[size],
        colorClasses[color].bg,
        colorClasses[color].glow,
        colorClasses[color].outerGlow,
        className
      )}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/20 to-white/40 opacity-60" />
      
      {/* Icon */}
      <div className={cn("relative z-10 text-white", iconSizeClasses[size])}>
        {children}
      </div>
    </div>
  )
}

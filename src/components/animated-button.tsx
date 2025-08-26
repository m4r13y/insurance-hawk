"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glow"
  size?: "sm" | "md" | "lg"
  className?: string
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export default function AnimatedButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
}: AnimatedButtonProps) {
  const baseClasses = "relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary",
    outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground focus:ring-ring",
    ghost: "hover:bg-accent hover:text-accent-foreground focus:ring-ring",
    glow: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl glow-primary",
  }

  const sizeClasses = {
    sm: "h-8 px-3 text-sm gap-1.5",
    md: "h-10 px-4 py-2 gap-2",
    lg: "h-12 px-6 py-3 text-lg gap-3",
  }

  const disabledClasses = "opacity-50 cursor-not-allowed"

  return (
    <motion.button
      type={type}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && disabledClasses,
        className
      )}
    >
      {/* Glow effect for glow variant */}
      {variant === "glow" && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 blur-xl -z-10" />
      )}
      
      {children}
    </motion.button>
  )
}

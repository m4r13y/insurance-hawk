"use client"

import * as React from "react"
import { UpdateIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "dots" | "pulse"
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", variant = "default", ...props }, ref) => {
    if (variant === "dots") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex space-x-1",
            {
              "scale-75": size === "sm",
              "scale-100": size === "md", 
              "scale-125": size === "lg",
              "scale-150": size === "xl",
            },
            className
          )}
          {...props}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 bg-current rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
      )
    }

    if (variant === "pulse") {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-full bg-current animate-pulse",
            {
              "h-4 w-4": size === "sm",
              "h-6 w-6": size === "md",
              "h-8 w-8": size === "lg", 
              "h-12 w-12": size === "xl",
            },
            className
          )}
          {...props}
        />
      )
    }

    // Default spinner
    return (
      <div ref={ref} className={cn("animate-spin", className)} {...props}>
        <UpdateIcon
          className={cn({
            "h-4 w-4": size === "sm",
            "h-6 w-6": size === "md",
            "h-8 w-8": size === "lg",
            "h-12 w-12": size === "xl",
          })}
        />
      </div>
    )
  }
)
Spinner.displayName = "Spinner"

// Loading overlay component
interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  children: React.ReactNode
  spinner?: React.ReactNode
  blur?: boolean
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ className, isLoading, children, spinner, blur = true, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {children}
        {isLoading && (
          <div
            className={cn(
              "absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
              !blur && "backdrop-blur-none"
            )}
          >
            {spinner || <Spinner />}
          </div>
        )}
      </div>
    )
  }
)
LoadingOverlay.displayName = "LoadingOverlay"

// Loading skeleton for content placeholders
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
  avatar?: boolean
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, lines = 3, avatar = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("animate-pulse space-y-3", className)}
        {...props}
      >
        {avatar && (
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-3 bg-muted rounded w-16" />
            </div>
          </div>
        )}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-4 bg-muted rounded",
                i === lines - 1 && lines > 1 && "w-3/4"
              )}
            />
          ))}
        </div>
      </div>
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Spinner, LoadingOverlay, Skeleton }

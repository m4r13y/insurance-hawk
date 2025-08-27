import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-x-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 shadow-sm hover:shadow-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:bg-destructive/90 shadow-sm hover:shadow-md",
        outline: "border border-border bg-card text-card-foreground shadow-sm hover:bg-accent focus:bg-accent hover:text-accent-foreground focus:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:bg-secondary/80",
        success: "bg-success text-primary-foreground hover:bg-success/90 focus:bg-success/90 shadow-sm hover:shadow-md",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 focus:bg-warning/90 shadow-sm hover:shadow-md",
        info: "bg-info text-info-foreground hover:bg-info/90 focus:bg-info/90 shadow-sm hover:shadow-md",
        google: "bg-card text-muted-foreground border border-border hover:bg-accent shadow-sm hover:shadow-md",
        ghost: "text-foreground hover:bg-accent focus:bg-accent hover:text-accent-foreground focus:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "px-3 py-2 text-xs",
        default: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
        xl: "px-8 py-4 text-lg",
        icon: "w-10 h-10 p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

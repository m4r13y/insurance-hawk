import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-x-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 shadow-sm hover:shadow-md dark:focus:bg-blue-500",
        destructive: "bg-red-500 text-white hover:bg-red-600 focus:bg-red-600 shadow-sm hover:shadow-md dark:focus:bg-red-500",
        outline: "border border-border bg-card text-gray-800 shadow-sm hover:bg-gray-50 focus:bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700",
        secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-gray-200 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600 dark:focus:bg-neutral-600",
        success: "bg-teal-500 text-white hover:bg-teal-600 focus:bg-teal-600 shadow-sm hover:shadow-md dark:focus:bg-teal-500",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600 focus:bg-yellow-600 shadow-sm hover:shadow-md dark:focus:bg-yellow-500",
        info: "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600 shadow-sm hover:shadow-md dark:focus:bg-blue-500",
        google: "bg-card text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md",
        ghost: "text-gray-800 hover:bg-gray-50 focus:bg-gray-50 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800",
        link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
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

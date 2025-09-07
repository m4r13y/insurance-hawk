import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "py-3 px-4 block w-full border border-border rounded-lg text-sm focus:border-primary focus:outline-none disabled:opacity-50 disabled:pointer-events-none bg-background text-foreground placeholder:text-muted-foreground transition-colors duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

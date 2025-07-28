"use client"

import * as React from "react"
import { FileTextIcon, MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "ghost"
  }
  size?: "sm" | "md" | "lg"
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ 
    className, 
    icon, 
    title, 
    description, 
    action, 
    size = "md",
    ...props 
  }, ref) => {
    const defaultIcon = <FileTextIcon className="h-12 w-12 text-muted-foreground" />

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center",
          {
            "py-8 px-4": size === "sm",
            "py-12 px-6": size === "md",
            "py-16 px-8": size === "lg",
          },
          className
        )}
        {...props}
      >
        <div className="mb-4">
          {icon || defaultIcon}
        </div>
        
        <div className={cn("max-w-md space-y-2", {
          "max-w-sm": size === "sm",
          "max-w-lg": size === "lg",
        })}>
          <h3 className={cn("font-semibold text-foreground", {
            "text-lg": size === "sm",
            "text-xl": size === "md",
            "text-2xl": size === "lg",
          })}>
            {title}
          </h3>
          
          {description && (
            <p className={cn("text-muted-foreground", {
              "text-sm": size === "sm",
              "text-base": size === "md" || size === "lg",
            })}>
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="mt-6">
            <Button 
              onClick={action.onClick}
              variant={action.variant || "default"}
              size={size === "sm" ? "sm" : "default"}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

// Predefined empty state variants
const NoResultsFound = ({ searchTerm, onClear }: { 
  searchTerm?: string 
  onClear?: () => void 
}) => (
  <EmptyState
    icon={<MagnifyingGlassIcon className="h-12 w-12 text-muted-foreground" />}
    title="No results found"
    description={
      searchTerm 
        ? `We couldn't find anything matching "${searchTerm}". Try adjusting your search.`
        : "No items match your current filters. Try adjusting your criteria."
    }
    action={onClear ? {
      label: "Clear search",
      onClick: onClear,
      variant: "outline"
    } : undefined}
  />
)

const NoDataAvailable = ({ onCreate }: { onCreate?: () => void }) => (
  <EmptyState
    icon={<FileTextIcon className="h-12 w-12 text-muted-foreground" />}
    title="No data available"
    description="There are no items to display at the moment. Get started by creating your first item."
    action={onCreate ? {
      label: "Create new item",
      onClick: onCreate,
      variant: "default"
    } : undefined}
  />
)

const CreateFirstItem = ({ 
  itemName = "item", 
  onCreate 
}: { 
  itemName?: string
  onCreate: () => void 
}) => (
  <EmptyState
    icon={<PlusIcon className="h-12 w-12 text-muted-foreground" />}
    title={`Create your first ${itemName}`}
    description={`Get started by creating a new ${itemName}. You can always edit or delete it later.`}
    action={{
      label: `Create ${itemName}`,
      onClick: onCreate,
      variant: "default"
    }}
  />
)

export { 
  EmptyState, 
  NoResultsFound, 
  NoDataAvailable, 
  CreateFirstItem 
}

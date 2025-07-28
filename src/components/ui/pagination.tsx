"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, DotsHorizontalIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showPreviousNext?: boolean
  showFirstLast?: boolean
  siblingCount?: number
  className?: string
}

const Pagination = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"nav"> & PaginationProps
>(({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showPreviousNext = true,
  showFirstLast = true,
  siblingCount = 1,
  className,
  ...props 
}, ref) => {
  const range = React.useMemo(() => {
    const delta = siblingCount + 1
    const range = []
    const rangeWithDots = []

    const left = Math.max(2, currentPage - delta)
    const right = Math.min(totalPages - 1, currentPage + delta)

    for (let i = left; i <= right; i++) {
      range.push(i)
    }

    if (left > 2) {
      rangeWithDots.push(1, 'ellipsis')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (right < totalPages - 1) {
      rangeWithDots.push('ellipsis', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }, [currentPage, totalPages, siblingCount])

  if (totalPages <= 1) return null

  return (
    <nav
      ref={ref}
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    >
      <PaginationContent>
        {showPreviousNext && (
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            />
          </PaginationItem>
        )}

        {range.map((page, index) => (
          <PaginationItem key={index}>
            {page === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => onPageChange(page as number)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {showPreviousNext && (
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </nav>
  )
})
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
  disabled?: boolean
} & React.ComponentProps<typeof Button>

const PaginationLink = ({
  className,
  isActive,
  disabled,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <Button
    aria-current={isActive ? "page" : undefined}
    variant={isActive ? "outline" : "ghost"}
    size={size}
    className={cn(
      "h-9 w-9",
      isActive && "border-primary",
      disabled && "pointer-events-none opacity-50",
      className
    )}
    disabled={disabled}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeftIcon className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRightIcon className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <DotsHorizontalIcon className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}

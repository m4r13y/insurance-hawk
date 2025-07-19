'use client';

import * as React from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { X } from 'lucide-react';

const badgeVariants = cva(
  "inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-neutral-200",
        primary: "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500",
        secondary: "bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-neutral-300",
        success: "bg-teal-100 text-teal-800 dark:bg-teal-800/30 dark:text-teal-500",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500",
        danger: "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500",
        light: "bg-white text-gray-800 border border-gray-200 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300",
        dark: "bg-gray-800 text-white dark:bg-neutral-900",
        outline: "border border-gray-200 text-gray-600 dark:border-neutral-700 dark:text-neutral-400"
      },
      size: {
        sm: "py-1 px-2 text-xs",
        default: "py-1.5 px-3 text-xs",
        lg: "py-2 px-4 text-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function Badge({ 
  children, 
  variant, 
  size, 
  dismissible = false, 
  onDismiss, 
  className, 
  ...props 
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex items-center justify-center ml-2 h-4 w-4 rounded-full hover:bg-black/20 focus:outline-none focus:bg-black/20 dark:hover:bg-white/20 dark:focus:bg-white/20"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export function Chip({ children, selected = false, onClick, className = '', variant = 'default' }: ChipProps) {
  const variantClasses = {
    default: selected 
      ? 'bg-gray-800 text-white' 
      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600',
    primary: selected
      ? 'bg-blue-600 text-white'
      : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800/30 dark:text-blue-500 dark:hover:bg-blue-800/50',
    success: selected
      ? 'bg-teal-600 text-white'
      : 'bg-teal-100 text-teal-800 hover:bg-teal-200 dark:bg-teal-800/30 dark:text-teal-500 dark:hover:bg-teal-800/50',
    warning: selected
      ? 'bg-yellow-600 text-white'
      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-800/30 dark:text-yellow-500 dark:hover:bg-yellow-800/50',
    danger: selected
      ? 'bg-red-600 text-white'
      : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800/30 dark:text-red-500 dark:hover:bg-red-800/50'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center py-2 px-3 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

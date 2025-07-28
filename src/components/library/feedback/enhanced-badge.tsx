'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Cross1Icon, InfoCircledIcon, ExclamationTriangleIcon, CheckCircledIcon } from '@radix-ui/react-icons';

interface EnhancedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  count?: number;
}

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'draft';
  className?: string;
}

interface CountBadgeProps {
  count: number;
  max?: number;
  showZero?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm', 
  lg: 'px-3 py-1 text-base'
};

const variantIcons = {
  info: InfoCircledIcon,
  success: CheckCircledIcon,
  warning: ExclamationTriangleIcon,
  destructive: ExclamationTriangleIcon
};

export function EnhancedBadge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '',
  removable = false,
  onRemove,
  icon,
  count
}: EnhancedBadgeProps) {
  const IconComponent = icon ? null : variantIcons[variant as keyof typeof variantIcons];

  return (
    <Badge 
      variant={variant} 
      className={cn(
        sizeClasses[size],
        "inline-flex items-center gap-1",
        className
      )}
    >
      {icon || (IconComponent && <IconComponent className="h-3 w-3" />)}
      {children}
      {count !== undefined && count > 0 && (
        <span className="ml-1 rounded-full bg-background px-1.5 py-0.5 text-xs font-medium text-foreground">
          {count}
        </span>
      )}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full hover:bg-background/20 p-0.5"
          type="button"
        >
          <Cross1Icon className="h-3 w-3" />
          <span className="sr-only">Remove</span>
        </button>
      )}
    </Badge>
  );
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusConfig = {
    active: { variant: 'default' as const, label: 'Active', bgClass: 'bg-green-100 text-green-800 border-green-200' },
    inactive: { variant: 'secondary' as const, label: 'Inactive', bgClass: '' },
    pending: { variant: 'outline' as const, label: 'Pending', bgClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    approved: { variant: 'default' as const, label: 'Approved', bgClass: 'bg-green-100 text-green-800 border-green-200' },
    rejected: { variant: 'destructive' as const, label: 'Rejected', bgClass: '' },
    draft: { variant: 'outline' as const, label: 'Draft', bgClass: '' }
  };

  const config = statusConfig[status];

  return (
    <EnhancedBadge 
      variant={config.variant} 
      className={cn(config.bgClass, className)}
    >
      {config.label}
    </EnhancedBadge>
  );
}

export function CountBadge({ 
  count, 
  max = 99, 
  showZero = false, 
  className = '' 
}: CountBadgeProps) {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge 
      variant="destructive" 
      className={cn(
        "h-5 min-w-[20px] rounded-full px-1 text-xs font-medium",
        className
      )}
    >
      {displayCount}
    </Badge>
  );
}

export function CategoryBadge({ 
  category, 
  color,
  className = '' 
}: { 
  category: string; 
  color?: string;
  className?: string;
}) {
  return (
    <Badge 
      variant="secondary" 
      className={cn("capitalize", className)}
      style={color ? { backgroundColor: color, color: 'white' } : undefined}
    >
      {category}
    </Badge>
  );
}

export function PriorityBadge({ 
  priority, 
  className = '' 
}: { 
  priority: 'low' | 'medium' | 'high' | 'urgent';
  className?: string;
}) {
  const priorityConfig = {
    low: { variant: 'secondary' as const, label: 'Low' },
    medium: { variant: 'default' as const, label: 'Medium' },
    high: { variant: 'outline' as const, label: 'High', bgClass: 'bg-orange-100 text-orange-800 border-orange-200' },
    urgent: { variant: 'destructive' as const, label: 'Urgent' }
  };

  const config = priorityConfig[priority];

  return (
    <EnhancedBadge 
      variant={config.variant} 
      className={cn(
        config.variant === 'outline' && priority === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' : '',
        className
      )}
    >
      {config.label}
    </EnhancedBadge>
  );
}

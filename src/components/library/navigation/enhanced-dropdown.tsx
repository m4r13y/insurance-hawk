'use client';

import * as React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, CheckIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

interface EnhancedDropdownProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  href?: string;
}

interface DropdownCheckboxItemProps {
  children: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

interface DropdownRadioGroupProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

interface DropdownRadioItemProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
}

export function EnhancedDropdown({ 
  children, 
  trigger, 
  className = '', 
  align = 'start',
  side = 'bottom'
}: EnhancedDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className={className}
        align={align}
        side={side}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DropdownButton({ 
  children, 
  variant = 'outline',
  size = 'default',
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  [key: string]: any;
}) {
  return (
    <Button variant={variant} size={size} className={cn("gap-2", className)} {...props}>
      {children}
      <ChevronDownIcon className="h-4 w-4" />
    </Button>
  );
}

export function DropdownItem({ 
  children, 
  onClick, 
  disabled = false, 
  className = '',
  href
}: DropdownItemProps) {
  if (href) {
    return (
      <DropdownMenuItem asChild className={className} disabled={disabled}>
        <a href={href} onClick={onClick}>
          {children}
        </a>
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem onClick={onClick} disabled={disabled} className={className}>
      {children}
    </DropdownMenuItem>
  );
}

export function DropdownSeparator({ className = '' }: { className?: string }) {
  return <DropdownMenuSeparator className={className} />;
}

export function DropdownLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <DropdownMenuLabel className={className}>
      {children}
    </DropdownMenuLabel>
  );
}

export function DropdownCheckboxItem({
  children,
  checked = false,
  onCheckedChange,
  disabled = false,
  className = ''
}: DropdownCheckboxItemProps) {
  return (
    <DropdownMenuCheckboxItem
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={className}
    >
      {children}
    </DropdownMenuCheckboxItem>
  );
}

export function DropdownRadioGroup({
  children,
  value,
  onValueChange,
  className = ''
}: DropdownRadioGroupProps) {
  return (
    <DropdownMenuRadioGroup
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      {children}
    </DropdownMenuRadioGroup>
  );
}

export function DropdownRadioItem({
  children,
  value,
  disabled = false,
  className = ''
}: DropdownRadioItemProps) {
  return (
    <DropdownMenuRadioItem
      value={value}
      disabled={disabled}
      className={className}
    >
      {children}
    </DropdownMenuRadioItem>
  );
}

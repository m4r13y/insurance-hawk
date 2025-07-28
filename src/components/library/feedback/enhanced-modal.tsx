'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Cross1Icon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

interface EnhancedModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title?: string;
  description?: string;
  showCloseButton?: boolean;
}

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4'
};

export function EnhancedModal({ 
  children, 
  isOpen, 
  onClose, 
  className = '', 
  size = 'md',
  title,
  description,
  showCloseButton = true
}: EnhancedModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(sizeClasses[size], className)}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function ModalHeader({ children, className = '' }: ModalHeaderProps) {
  return (
    <DialogHeader className={className}>
      {children}
    </DialogHeader>
  );
}

export function ModalTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <DialogTitle className={className}>
      {children}
    </DialogTitle>
  );
}

export function ModalDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <DialogDescription className={className}>
      {children}
    </DialogDescription>
  );
}

export function ModalCloseButton({ onClose, className = '' }: { onClose: () => void; className?: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClose}
      className={cn("h-auto p-1", className)}
    >
      <Cross1Icon className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </Button>
  );
}

export function ModalBody({ children, className = '' }: ModalBodyProps) {
  return (
    <div className={cn("py-4", className)}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <DialogFooter className={className}>
      {children}
    </DialogFooter>
  );
}

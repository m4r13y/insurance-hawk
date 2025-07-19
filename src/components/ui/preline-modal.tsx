'use client';

import * as React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
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

export function Modal({ children, isOpen, onClose, className = '', size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="hs-overlay fixed top-0 start-0 z-[80] w-full h-full bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`bg-white border shadow-sm rounded-xl dark:bg-neutral-800 dark:border-neutral-700 w-full ${sizeClasses[size]} ${className}`}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ children, className = '' }: ModalHeaderProps) {
  return (
    <div className={`flex justify-between items-center py-3 px-4 border-b dark:border-neutral-700 ${className}`}>
      {children}
    </div>
  );
}

export function ModalTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`font-bold text-gray-800 dark:text-white ${className}`}>
      {children}
    </h3>
  );
}

export function ModalCloseButton({ onClose, className = '' }: { onClose: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className={`flex justify-center items-center size-7 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-700 ${className}`}
    >
      <X className="w-4 h-4" />
    </button>
  );
}

export function ModalBody({ children, className = '' }: ModalBodyProps) {
  return (
    <div className={`p-4 overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={`flex justify-end items-center gap-x-2 py-3 px-4 border-t dark:border-neutral-700 ${className}`}>
      {children}
    </div>
  );
}

'use client';

import * as React from 'react';

interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function Dropdown({ children, className = '' }: DropdownProps) {
  return (
    <div className={`relative inline-block [--trigger:hover] ${className}`}>
      {children}
    </div>
  );
}

export function DropdownTrigger({ children, className = '' }: DropdownTriggerProps) {
  return (
    <button
      type="button"
      className={`hs-dropdown-toggle inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700 ${className}`}
      data-hs-dropdown-auto-close="false"
    >
      {children}
    </button>
  );
}

export function DropdownMenu({ children, className = '' }: DropdownMenuProps) {
  return (
    <div className={`hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-60 bg-white shadow-md rounded-lg p-2 mt-2 dark:bg-neutral-800 dark:border dark:border-neutral-700 dark:divide-neutral-700 after:h-4 after:absolute after:-bottom-4 after:start-0 after:w-full before:h-4 before:absolute before:-top-4 before:start-0 before:w-full ${className}`}>
      {children}
    </div>
  );
}

export function DropdownItem({ children, className = '', onClick, href }: DropdownItemProps) {
  const baseClasses = `flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700 ${className}`;
  
  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {children}
      </a>
    );
  }
  
  return (
    <button type="button" className={baseClasses} onClick={onClick}>
      {children}
    </button>
  );
}

export function DropdownSeparator({ className = '' }: { className?: string }) {
  return <div className={`border-t border-gray-200 my-2 dark:border-neutral-700 ${className}`} />;
}

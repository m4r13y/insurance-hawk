'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function FormGroup({ children, className = '' }: FormGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
}

export function Label({ children, required, className, ...props }: LabelProps) {
  return (
    <label 
      className={cn(
        "block text-sm font-medium text-gray-700 dark:text-neutral-300", 
        className
      )} 
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 transition-colors duration-200 resize-none",
        className
      )}
      {...props}
    />
  );
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={checkboxId}
        className={cn(
          "shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800",
          className
        )}
        {...props}
      />
      {label && (
        <label htmlFor={checkboxId} className="text-sm text-gray-500 ms-3 dark:text-neutral-400">
          {label}
        </label>
      )}
    </div>
  );
}

export function Radio({ label, className, id, name, ...props }: RadioProps) {
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex items-center">
      <input
        type="radio"
        id={radioId}
        name={name}
        className={cn(
          "shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800",
          className
        )}
        {...props}
      />
      {label && (
        <label htmlFor={radioId} className="text-sm text-gray-500 ms-3 dark:text-neutral-400">
          {label}
        </label>
      )}
    </div>
  );
}

export function InputGroup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
}

export function InputAddon({ children, position = 'left', className = '' }: { children: React.ReactNode; position?: 'left' | 'right'; className?: string }) {
  const positionClasses = position === 'left' 
    ? 'absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3' 
    : 'absolute inset-y-0 end-0 flex items-center pointer-events-none z-20 pe-3';
    
  return (
    <div className={`${positionClasses} ${className}`}>
      {children}
    </div>
  );
}

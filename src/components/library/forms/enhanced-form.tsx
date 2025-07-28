'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea';
import { Checkbox as ShadcnCheckbox } from '@/components/ui/checkbox';

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

interface CustomLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

interface CheckboxProps {
  label?: string;
  className?: string;
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function FormGroup({ children, className = '' }: FormGroupProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  );
}

export function FormLabel({ children, required, className, ...props }: CustomLabelProps) {
  return (
    <Label 
      className={cn("text-sm font-medium", className)} 
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
  );
}

export function FormTextarea({ className, ...props }: TextareaProps) {
  return (
    <ShadcnTextarea
      className={cn("resize-none", className)}
      {...props}
    />
  );
}

export function FormCheckbox({ label, className, id, checked, onChange, ...props }: CheckboxProps) {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex items-center space-x-2">
      <ShadcnCheckbox
        id={checkboxId}
        className={className}
        checked={checked}
        onCheckedChange={onChange}
      />
      {label && (
        <Label htmlFor={checkboxId} className="text-sm font-normal cursor-pointer">
          {label}
        </Label>
      )}
    </div>
  );
}

export function FormRadio({ label, className, id, name, ...props }: RadioProps) {
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        id={radioId}
        name={name}
        className={cn(
          "h-4 w-4 border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      {label && (
        <Label htmlFor={radioId} className="text-sm font-normal cursor-pointer">
          {label}
        </Label>
      )}
    </div>
  );
}

export function InputGroup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {children}
    </div>
  );
}

export function InputAddon({ 
  children, 
  position = 'left', 
  className = '' 
}: { 
  children: React.ReactNode; 
  position?: 'left' | 'right'; 
  className?: string;
}) {
  const positionClasses = position === 'left' 
    ? 'absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none' 
    : 'absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none';
    
  return (
    <div className={cn(positionClasses, className)}>
      {children}
    </div>
  );
}

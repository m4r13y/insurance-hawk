"use client"

import React, { useState } from 'react';
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Lock, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutofillInputProps {
  field: any; // React Hook Form field
  label: string;
  type?: string;
  placeholder?: string;
  isLocked: boolean;
  autofilledValue: string;
  onRequestEdit: () => void;
  onConfirmEdit: () => void;
  onUpdateValue: (value: string) => Promise<void>;
  className?: string;
}

export function AutofillInput({
  field,
  label,
  type = "text",
  placeholder,
  isLocked,
  autofilledValue,
  onRequestEdit,
  onConfirmEdit,
  onUpdateValue,
  className
}: AutofillInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(autofilledValue || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Update editValue when autofilledValue changes
  React.useEffect(() => {
    setEditValue(autofilledValue || '');
  }, [autofilledValue]);

  // If field is locked and has a value, show the locked state
  if (isLocked && autofilledValue) {
    try {
      return (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                value={autofilledValue}
                readOnly
                className="bg-gray-50 text-gray-600 cursor-pointer pr-10"
                onClick={() => setShowConfirmDialog(true)}
              />
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </FormControl>
          <p className="text-xs text-muted-foreground mt-1">
            Click to update this information in your account
          </p>
          <FormMessage />

          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Update Account Information</AlertDialogTitle>
                <AlertDialogDescription>
                  This will update your {label.toLowerCase()} in your account profile. 
                  This change will apply to all future applications and forms.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                  setShowConfirmDialog(false);
                  onConfirmEdit();
                  setIsEditing(true);
                  setEditValue(autofilledValue);
                }}>
                  Update Information
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {isEditing && (
            <div className="mt-2 space-y-2">
              <Input
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onInput={(e) => {
                  // Handle browser autofill which bypasses onChange
                  const target = e.target as HTMLInputElement;
                  if (target.value !== editValue) {
                    setEditValue(target.value);
                  }
                }}
                placeholder={placeholder}
                className="border-blue-300 focus:border-blue-500"
                autoComplete={type === "tel" ? "tel" : 
                             label.toLowerCase().includes("address") || label.toLowerCase().includes("street") ? "street-address" :
                             label.toLowerCase().includes("city") ? "address-level2" :
                             label.toLowerCase().includes("state") ? "address-level1" :
                             label.toLowerCase().includes("zip") ? "postal-code" :
                             label.toLowerCase().includes("phone") ? "tel" :
                             label.toLowerCase().includes("email") ? "email" :
                             label.toLowerCase().includes("first") ? "given-name" :
                             label.toLowerCase().includes("last") ? "family-name" :
                             "on"}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    setIsUpdating(true);
                    try {
                      await onUpdateValue(editValue);
                      field.onChange(editValue); // Update the form field too
                      setIsEditing(false);
                    } catch (error) {
                      // Error is handled in the hook
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditValue(autofilledValue);
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </FormItem>
      );
    } catch (error) {
      console.error('Error rendering locked AutofillInput:', error);
      // Fall back to regular input
    }
  }

  // Regular input for unlocked fields or empty fields
  try {
    return (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            className={cn(
              autofilledValue && !isLocked ? "bg-blue-50 border-blue-200" : "",
              className
            )}
            onInput={(e) => {
              // Handle browser autofill which bypasses onChange
              const target = e.target as HTMLInputElement;
              if (target.value !== field.value) {
                field.onChange(target.value);
              }
            }}
            autoComplete={type === "tel" ? "tel" : 
                         label.toLowerCase().includes("address") || label.toLowerCase().includes("street") ? "street-address" :
                         label.toLowerCase().includes("city") ? "address-level2" :
                         label.toLowerCase().includes("state") ? "address-level1" :
                         label.toLowerCase().includes("zip") ? "postal-code" :
                         label.toLowerCase().includes("phone") ? "tel" :
                         label.toLowerCase().includes("email") ? "email" :
                         label.toLowerCase().includes("first") ? "given-name" :
                         label.toLowerCase().includes("last") ? "family-name" :
                         "on"}
          />
        </FormControl>
        {autofilledValue && !isLocked && (
          <p className="text-xs text-blue-600 mt-1">
            Auto-filled from your account
          </p>
        )}
        <FormMessage />
      </FormItem>
    );
  } catch (error) {
    console.error('Error rendering AutofillInput:', error);
    // Ultimate fallback to basic input
    return (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            onInput={(e) => {
              // Handle browser autofill which bypasses onChange
              const target = e.target as HTMLInputElement;
              if (target.value !== field.value) {
                field.onChange(target.value);
              }
            }}
            autoComplete={type === "tel" ? "tel" : 
                         label.toLowerCase().includes("address") || label.toLowerCase().includes("street") ? "street-address" :
                         label.toLowerCase().includes("city") ? "address-level2" :
                         label.toLowerCase().includes("state") ? "address-level1" :
                         label.toLowerCase().includes("zip") ? "postal-code" :
                         label.toLowerCase().includes("phone") ? "tel" :
                         label.toLowerCase().includes("email") ? "email" :
                         label.toLowerCase().includes("first") ? "given-name" :
                         label.toLowerCase().includes("last") ? "family-name" :
                         "on"}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }
}

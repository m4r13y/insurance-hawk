
"use client"

import React, { useState, useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutofillInputProps {
  form: UseFormReturn<any>;
  name: string;
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

function LockedInput({ label, autofilledValue, onConfirmEdit, onUpdateValue, form, name, type, placeholder, className }: Omit<AutofillInputProps, 'isLocked' | 'onRequestEdit'>) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(autofilledValue || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    useEffect(() => {
        setEditValue(autofilledValue || '');
    }, [autofilledValue]);

    if (!isEditing) {
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

                <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Account Information</DialogTitle>
                            <DialogDescription>
                                This will update your {label.toLowerCase()} in your account profile.
                                This change will apply to all future applications and forms.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
                            <Button onClick={() => {
                                setShowConfirmDialog(false);
                                onConfirmEdit();
                                setIsEditing(true);
                            }}>
                                Update Information
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </FormItem>
        );
    }
    
    // Fallback for when editing starts
    return (
        <FormItem className={className}>
            <FormLabel>{label}</FormLabel>
            <FormControl>
                <Input
                    {...form.register(name)}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    type={type}
                    placeholder={placeholder}
                    className="border-blue-300 focus:border-blue-500"
                />
            </FormControl>
            <div className="flex gap-2 mt-2">
                <Button
                    size="sm"
                    onClick={async () => {
                        setIsUpdating(true);
                        try {
                            await onUpdateValue(editValue);
                            form.setValue(name, editValue, { shouldValidate: true });
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
            <FormMessage />
        </FormItem>
    );
}

function RegularInput({ form, name, label, type, placeholder, autofilledValue, className }: Omit<AutofillInputProps, 'isLocked' | 'onRequestEdit' | 'onConfirmEdit' | 'onUpdateValue'>) {
    const field = form.register(name);

    return (
        <FormItem className={className}>
            <FormLabel>{label}</FormLabel>
            <FormControl>
                <Input
                    {...field}
                    type={type}
                    placeholder={placeholder}
                    defaultValue={autofilledValue}
                    className={cn(autofilledValue ? "bg-blue-50 border-blue-200" : "", className)}
                    autoComplete={
                        type === "tel" ? "tel" :
                        label.toLowerCase().includes("address") || label.toLowerCase().includes("street") ? "street-address" :
                        label.toLowerCase().includes("city") ? "address-level2" :
                        label.toLowerCase().includes("state") ? "address-level1" :
                        label.toLowerCase().includes("zip") ? "postal-code" :
                        label.toLowerCase().includes("phone") ? "tel" :
                        label.toLowerCase().includes("email") ? "email" :
                        label.toLowerCase().includes("first") ? "given-name" :
                        label.toLowerCase().includes("last") ? "family-name" :
                        "on"
                    }
                />
            </FormControl>
            {autofilledValue && (
                <p className="text-xs text-blue-600 mt-1">
                    Auto-filled from your account
                </p>
            )}
            <FormMessage />
        </FormItem>
    );
}

export function AutofillInput(props: AutofillInputProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render a simple input on the server to avoid hydration mismatch
    return <RegularInput {...props} />;
  }
  
  if (props.isLocked && props.autofilledValue) {
      return <LockedInput {...props} />;
  }

  return <RegularInput {...props} />;
}

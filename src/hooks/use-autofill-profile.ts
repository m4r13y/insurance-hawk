"use client"

import { useState, useEffect } from 'react';
import { useFirebaseAuth } from './use-firebase-auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useToast } from './use-toast';

interface ProfileData {
  firstName?: string;
  lastName?: string;
  dob?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  gender?: string;
  [key: string]: any;
}

interface AutofillHookReturn {
  profileData: ProfileData;
  isLoading: boolean;
  isFieldLocked: (fieldName: string) => boolean;
  getFieldValue: (fieldName: string) => string;
  requestFieldEdit: (fieldName: string) => void;
  updateProfileField: (fieldName: string, value: string) => Promise<void>;
  lockedFields: Set<string>;
  setFieldUnlocked: (fieldName: string) => void;
}

const AUTOFILL_FIELDS = [
  'firstName',
  'lastName', 
  'dob',
  'email',
  'phone',
  'address',
  'city',
  'state',
  'zip',
  'gender'
];

export function useAutofillProfile(): AutofillHookReturn {
  const [user] = useFirebaseAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lockedFields, setLockedFields] = useState<Set<string>>(new Set());
  
  // Load user profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const functions = getFunctions();
        const getUserData = httpsCallable(functions, 'getUserData');
        const result = await getUserData();
        const data = result.data as any;
        
        if (data.profile) {
          setProfileData(data.profile);
          
          // Lock fields that have existing data
          const fieldsToLock = new Set<string>();
          AUTOFILL_FIELDS.forEach(field => {
            if (data.profile[field] && data.profile[field].toString().trim()) {
              fieldsToLock.add(field);
            }
          });
          setLockedFields(fieldsToLock);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        // Don't show error toast to user - just fail silently for better UX
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  const isFieldLocked = (fieldName: string): boolean => {
    return lockedFields.has(fieldName) && !!getFieldValue(fieldName);
  };

  const getFieldValue = (fieldName: string): string => {
    if (!profileData || typeof profileData[fieldName] === 'undefined') {
      return '';
    }
    const value = profileData[fieldName]?.toString() || '';
    // For enum fields like gender, return empty string only if there's actually a value
    // This prevents setting invalid empty enum values
    if (fieldName === 'gender' && !value.trim()) {
      return '';
    }
    return value;
  };

  const setFieldUnlocked = (fieldName: string) => {
    setLockedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldName);
      return newSet;
    });
  };

  const requestFieldEdit = (fieldName: string) => {
    // This will be handled by the consuming component to show confirmation dialog
    // The component should call setFieldUnlocked after user confirms
  };

  const updateProfileField = async (fieldName: string, value: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const functions = getFunctions();
      const saveUserData = httpsCallable(functions, 'saveUserData');
      
      const updateData: any = {
        step: 'profile',
        personalInfo: {
          [fieldName]: value,
        },
      };

      await saveUserData(updateData);
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        [fieldName]: value
      }));

      // Lock the field again if it has a value
      if (value && value.trim()) {
        setLockedFields(prev => new Set([...prev, fieldName]));
      }

      toast({
        title: "Profile Updated",
        description: `Your ${fieldName} has been updated in your account.`,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update Failed", 
        description: "Failed to update your profile information.",
      });
      throw error;
    }
  };

  return {
    profileData,
    isLoading,
    isFieldLocked,
    getFieldValue,
    requestFieldEdit,
    updateProfileField,
    lockedFields,
    setFieldUnlocked,
  };
}

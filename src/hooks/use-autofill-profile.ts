"use client"

import { useState, useEffect } from 'react';
import { useFirebaseAuth } from './use-firebase-auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
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
        console.log('=== useAutofillProfile: Loading profile data ===');
        console.log('User ID:', user.uid);
        console.log('User email:', user.email);
        
        if (!functions) {
          throw new Error('Firebase Functions not initialized');
        }
        console.log('Functions object:', functions);
        
        const getUserData = httpsCallable(functions, 'getUserData');
        console.log('Calling getUserData...');
        const result = await getUserData();
        console.log('getUserData result:', result);
        const data = result.data as any;
        console.log('getUserData data:', data);
        
        if (data.profile) {
          console.log('Setting profile data:', data.profile);
          setProfileData(data.profile);
          
          // Lock fields that have existing data
          const fieldsToLock = new Set<string>();
          AUTOFILL_FIELDS.forEach(field => {
            if (data.profile[field] && data.profile[field].toString().trim()) {
              fieldsToLock.add(field);
            }
          });
          console.log('Fields to lock:', Array.from(fieldsToLock));
          setLockedFields(fieldsToLock);
        } else {
          console.log('No profile data found in result');
        }
        
        // Log additional data for debugging
        if (data.policiesCount !== undefined) {
          console.log('Policies count:', data.policiesCount);
        }
        if (data.documentsCount !== undefined) {
          console.log('Documents count:', data.documentsCount);
        }
        if (data.hasProfile !== undefined) {
          console.log('Has profile:', data.hasProfile);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
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
      // Default to Texas if no state is stored
      if (fieldName === 'state') {
        return 'TX';
      }
      return '';
    }
    const value = profileData[fieldName]?.toString() || '';
    // For enum fields like gender, return empty string only if there's actually a value
    // This prevents setting invalid empty enum values
    if (fieldName === 'gender' && !value.trim()) {
      return '';
    }
    // Default to Texas if state is empty
    if (fieldName === 'state' && !value.trim()) {
      return 'TX';
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
      if (!functions) {
        throw new Error('Firebase Functions not initialized');
      }
      const saveUserData = httpsCallable(functions, 'saveUserData');
      
      // Build the complete personal info object with the updated field
      const personalInfo = {
        firstName: getFieldValue('firstName'),
        lastName: getFieldValue('lastName'),
        dob: getFieldValue('dob'),
        gender: getFieldValue('gender') as 'male' | 'female',
        address: getFieldValue('address'),
        city: getFieldValue('city'),
        state: getFieldValue('state'),
        zip: getFieldValue('zip'),
        phone: getFieldValue('phone'),
        email: getFieldValue('email'),
        // Override with the new value
        [fieldName]: value,
      };

      const updateData = {
        personalInfo,
        applicationStep: 'personal' as const,
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

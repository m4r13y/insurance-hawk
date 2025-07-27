"use client"

import { useState, useCallback } from 'react';
import { useFirebaseAuth } from './use-firebase-auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useToast } from './use-toast';

interface DataOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface UserAnalytics {
  profileCompleteness: number;
  totalPolicies: number;
  totalDocuments: number;
  totalQuotes: number;
  dataHealth: {
    hasBasicInfo: boolean;
    hasContactInfo: boolean;
    hasAddress: boolean;
    missingFields: string[];
  };
}

interface UseDataManagementReturn {
  // Data Operations
  getUserData: () => Promise<DataOperationResult>;
  saveUserData: (data: any, step?: string) => Promise<DataOperationResult>;
  updateUserData: (dataType: string, updateData: any, itemId?: string) => Promise<DataOperationResult>;
  deleteUserData: (dataType: string, itemId?: string) => Promise<DataOperationResult>;
  getUserAnalytics: () => Promise<DataOperationResult>;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Utility functions
  clearError: () => void;
  validateUserData: (data: any) => { isValid: boolean; missingFields: string[] };
}

export function useDataManagement(): UseDataManagementReturn {
  
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleOperation = useCallback(async (
    operation: () => Promise<any>,
    successMessage?: string
  ): Promise<DataOperationResult> => {
    if (!user || !functions) {
      const errorMsg = 'User must be authenticated and functions initialized';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await operation();
      
      if (successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }
      
      return { success: true, data: result.data || result };
    } catch (err: any) {
      const errorMessage = err.message || 'Operation failed';
      setError(errorMessage);
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user, functions, toast]);

  const getUserData = useCallback(async (): Promise<DataOperationResult> => {
    return handleOperation(async () => {
      if (!functions) throw new Error('Functions not initialized');
      const getUserDataFn = httpsCallable(functions, 'getUserData');
      return await getUserDataFn();
    });
  }, [handleOperation, functions]);

  const saveUserData = useCallback(async (
    data: any, 
    step: string = 'personalInfo'
  ): Promise<DataOperationResult> => {
    return handleOperation(async () => {
      if (!functions) throw new Error('Functions not initialized');
      const saveUserDataFn = httpsCallable(functions, 'saveUserData');
      return await saveUserDataFn({ step, personalInfo: data });
    }, 'Data saved successfully');
  }, [handleOperation, functions]);

  const updateUserData = useCallback(async (
    dataType: string,
    updateData: any,
    itemId?: string
  ): Promise<DataOperationResult> => {
    return handleOperation(async () => {
      if (!functions) throw new Error('Functions not initialized');
      const updateUserDataFn = httpsCallable(functions, 'updateUserData');
      return await updateUserDataFn({ dataType, updateData, itemId });
    }, `${dataType} updated successfully`);
  }, [handleOperation, functions]);

  const deleteUserData = useCallback(async (
    dataType: string,
    itemId?: string
  ): Promise<DataOperationResult> => {
    return handleOperation(async () => {
      if (!functions) throw new Error('Functions not initialized');
      const deleteUserDataFn = httpsCallable(functions, 'deleteUserData');
      return await deleteUserDataFn({ dataType, itemId });
    }, `${dataType} deleted successfully`);
  }, [handleOperation, functions]);

  const getUserAnalytics = useCallback(async (): Promise<DataOperationResult> => {
    return handleOperation(async () => {
      if (!functions) throw new Error('Functions not initialized');
      const getUserAnalyticsFn = httpsCallable(functions, 'getUserAnalytics');
      return await getUserAnalyticsFn();
    });
  }, [handleOperation, functions]);

  const validateUserData = useCallback((data: any): { isValid: boolean; missingFields: string[] } => {
    const requiredFields = [
      'firstName',
      'lastName',
      'dob',
      'email',
      'phone',
      'address',
      'city',
      'state',
      'zip'
    ];

    const missingFields = requiredFields.filter(field => {
      const value = data[field];
      return !value || (typeof value === 'string' && !value.trim());
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }, []);

  return {
    // Data Operations
    getUserData,
    saveUserData,
    updateUserData,
    deleteUserData,
    getUserAnalytics,
    
    // State
    loading,
    error,
    
    // Utility functions
    clearError,
    validateUserData,
  };
}

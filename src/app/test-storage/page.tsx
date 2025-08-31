"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { saveToStorage, loadFromStorageAsync, getFirestoreStorageInfo } from '@/components/medicare-shop/shared/storage';
import { saveToStorage as saveToFirestore, loadFromStorage as loadFromFirestore } from '@/lib/services/storage-bridge';
import { saveSelectedCategories, loadSelectedCategories, saveCurrentFlowStep, loadCurrentFlowStep } from '@/components/medicare-shop/shared/storage';

export default function StorageTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>({});

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const updateStorageInfo = async () => {
    const info = await getFirestoreStorageInfo();
    setStorageInfo(info);
  };

  useEffect(() => {
    updateStorageInfo();
  }, []);

  const testLocalStorage = async () => {
    setIsLoading(true);
    addResult('🔍 Testing localStorage functionality...');
    
    try {
      const testData = {
        id: 'test_' + Date.now(),
        planName: 'Test Final Expense Plan',
        carrierName: 'Test Insurance Co',
        monthlyPremium: 89.99,
        benefitAmount: 25000,
        timestamp: Date.now()
      };

      // Test saving
      saveToStorage('medicare_test_quotes', [testData]);
      addResult('✅ Successfully saved test data to localStorage');

      // Test loading
      const loadedData = await loadFromStorageAsync('medicare_test_quotes', []);
      if (loadedData.length > 0 && loadedData[0].id === testData.id) {
        addResult('✅ Successfully loaded test data from localStorage');
      } else {
        addResult('❌ Failed to load correct test data from localStorage');
      }

      await updateStorageInfo();
    } catch (error) {
      addResult(`❌ localStorage test failed: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testFirestoreConnectivity = async () => {
    setIsLoading(true);
    addResult('🔥 Testing Firestore connectivity...');
    
    try {
      const testData = {
        id: 'firestore_test_' + Date.now(),
        type: 'connectivity_test',
        timestamp: Date.now(),
        data: 'Test Firestore connection'
      };

      // Test Firestore save
      await saveToFirestore('test_firestore_connectivity', testData);
      addResult('✅ Successfully saved to Firestore');

      // Test Firestore load
      const loadedData = await loadFromFirestore('test_firestore_connectivity', null);
      if (loadedData && typeof loadedData === 'object' && 'id' in loadedData && (loadedData as any).id === testData.id) {
        addResult('✅ Successfully loaded from Firestore');
      } else {
        addResult('❌ Failed to load correct data from Firestore');
      }

    } catch (error) {
      addResult(`❌ Firestore test failed: ${error}`);
      if (error instanceof Error && error.message.includes('permission')) {
        addResult('💡 This might be a Firebase permissions issue');
      }
    }
    
    setIsLoading(false);
  };

  const testQuoteWorkflow = async () => {
    setIsLoading(true);
    addResult('💰 Testing full quote storage workflow...');
    
    try {
      const mockFinalExpenseQuotes = [
        {
          id: 'fe_1',
          planName: 'Guaranteed Acceptance Life',
          carrierName: 'Globe Life',
          monthlyPremium: 45.99,
          benefitAmount: 10000,
          applicantAge: 65
        },
        {
          id: 'fe_2',
          planName: 'Whole Life Insurance',
          carrierName: 'Colonial Penn',
          monthlyPremium: 62.50,
          benefitAmount: 15000,
          applicantAge: 65
        }
      ];

      // Save Final Expense quotes to Firestore
      await saveToStorage('medicare_final_expense_quotes', mockFinalExpenseQuotes);
      addResult('✅ Saved Final Expense quotes to Firestore');

      // Save categories to localStorage
      const testCategories = ['final-expense', 'medigap'];
      saveSelectedCategories(testCategories);
      addResult('✅ Saved categories to localStorage');

      // Save flow step to localStorage  
      saveCurrentFlowStep('results');
      addResult('✅ Saved flow step to localStorage');

      // Simulate navigation/refresh
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Load quotes from Firestore
      const loadedQuotes = await loadFromStorageAsync('medicare_final_expense_quotes', []);
      if (loadedQuotes.length === mockFinalExpenseQuotes.length) {
        addResult(`✅ Successfully retrieved ${loadedQuotes.length} Final Expense quotes from Firestore`);
      } else {
        addResult(`❌ Quote count mismatch: expected ${mockFinalExpenseQuotes.length}, got ${loadedQuotes.length}`);
      }

      // Load UI state from localStorage
      const loadedCategories = loadSelectedCategories();
      const loadedFlowStep = loadCurrentFlowStep();
      
      if (JSON.stringify(loadedCategories) === JSON.stringify(testCategories)) {
        addResult('✅ Successfully retrieved categories from localStorage');
      } else {
        addResult(`❌ Categories mismatch: expected ${JSON.stringify(testCategories)}, got ${JSON.stringify(loadedCategories)}`);
      }

      if (loadedFlowStep === 'results') {
        addResult('✅ Successfully retrieved flow step from localStorage');
      } else {
        addResult(`❌ Flow step mismatch: expected 'results', got '${loadedFlowStep}'`);
      }

      await updateStorageInfo();

    } catch (error) {
      addResult(`❌ Quote workflow test failed: ${error}`);
    }
    
    setIsLoading(false);
  };

  const clearTestData = async () => {
    // Clear Firestore data
    await saveToStorage('medicare_final_expense_quotes', []);
    
    // Clear localStorage UI state
    saveSelectedCategories([]);
    saveCurrentFlowStep('category-selection');
    
    addResult('🧹 Cleared test data from Firestore and localStorage');
    await updateStorageInfo();
  };

  const viewCurrentStorage = async () => {
    addResult('📊 Current storage contents:');
    
    try {
      // Check Firestore storage
      const firestoreInfo = await getFirestoreStorageInfo();
      addResult(`🔥 Firestore: ${firestoreInfo.totalQuotes} quotes, ${firestoreInfo.readable}`);
      
      Object.entries(firestoreInfo.categories || {}).forEach(([category, count]) => {
        if (count > 0) {
          addResult(`   📦 ${category}: ${count} quotes`);
        }
      });
      
      // Check localStorage UI state
      const categories = loadSelectedCategories();
      const flowStep = loadCurrentFlowStep();
      addResult(`� localStorage UI: categories=${JSON.stringify(categories)}, step=${flowStep}`);
      
      if (firestoreInfo.totalQuotes === 0 && categories.length === 0) {
        addResult('   (No data found in either storage)');
      }
    } catch (error) {
      addResult(`❌ Error checking storage: ${error}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Storage System Test Console</CardTitle>
          <CardDescription>
            Test the localStorage and Firestore storage functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              onClick={testLocalStorage} 
              disabled={isLoading}
              variant="outline"
            >
              Test localStorage
            </Button>
            <Button 
              onClick={testFirestoreConnectivity} 
              disabled={isLoading}
              variant="outline"
            >
              Test Firestore
            </Button>
            <Button 
              onClick={testQuoteWorkflow} 
              disabled={isLoading}
              variant="outline"
            >
              Test Quote Flow
            </Button>
            <Button 
              onClick={viewCurrentStorage} 
              disabled={isLoading}
              variant="secondary"
            >
              View Storage
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={clearTestData} 
              variant="destructive"
              size="sm"
            >
              Clear Test Data
            </Button>
            <div className="text-sm text-muted-foreground text-right">
              Storage: {storageInfo.readable || '0KB'}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Test Results:</h3>
            <div className="bg-muted/50 p-3 rounded-md h-64 overflow-y-auto text-xs font-mono">
              {testResults.length === 0 ? (
                <div className="text-muted-foreground">No tests run yet. Click a test button above.</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client"

import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export default function TestUserDataPage() {
  const [user] = useFirebaseAuth();
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveResult, setSaveResult] = useState<any>(null);

  const testGetUserData = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Testing getUserData function...');
      console.log('User ID:', user.uid);
      console.log('User email:', user.email);
      console.log('Functions object:', functions);
      
      if (!functions) {
        throw new Error('Firebase Functions not initialized');
      }
      
      // Check if user has a valid token
      const token = await user.getIdToken();
      console.log('User token exists:', !!token);
      
      const getUserData = httpsCallable(functions, 'getUserData');
      console.log('Calling getUserData...');
      const result = await getUserData();
      console.log('getUserData result:', result);
      console.log('getUserData result.data:', result.data);
      
      setUserData(result.data);
    } catch (err) {
      console.error('Error calling getUserData:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testSaveUserData = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setSaveResult(null);
    try {
      console.log('Testing saveUserData function...');
      
      if (!functions) {
        throw new Error('Firebase Functions not initialized');
      }
      
      const saveUserData = httpsCallable(functions, 'saveUserData');
      const testData = {
        personalInfo: {
          firstName: 'Test',
          lastName: 'User',
          email: user.email || 'test@example.com',
          state: 'TX',
          phone: '555-1234',
          city: 'Dallas',
          zip: '75001'
        }
      };
      
      console.log('Saving test data:', testData);
      const result = await saveUserData(testData);
      console.log('saveUserData result:', result);
      setSaveResult(result.data);
      
      // Now try to fetch the data again
      await testGetUserData();
    } catch (err) {
      console.error('Error calling saveUserData:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      testGetUserData();
    }
  }, [user]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test User Data Retrieval</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">User Authentication Status:</h2>
          <p>{user ? `Authenticated as: ${user.email}` : 'Not authenticated'}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Firebase Functions Status:</h2>
          <p>{functions ? 'Initialized' : 'Not initialized'}</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={testGetUserData}
            disabled={!user || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 mr-4"
          >
            {loading ? 'Loading...' : 'Test getUserData'}
          </button>

          <button 
            onClick={testSaveUserData}
            disabled={!user || loading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            Save Test Data & Fetch
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {saveResult && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <h2 className="text-lg font-semibold">Save Result:</h2>
            <pre className="whitespace-pre-wrap">{JSON.stringify(saveResult, null, 2)}</pre>
          </div>
        )}

        {userData && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <h2 className="text-lg font-semibold">User Data Result:</h2>
            <pre className="whitespace-pre-wrap">{JSON.stringify(userData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { getDentalQuotes } from '@/lib/actions/dental-quotes';
import { getCancerInsuranceQuotes } from '@/lib/actions/cancer-insurance-quotes';
import { getHospitalIndemnityQuotes } from '@/lib/actions/hospital-indemnity-quotes';
import { getFinalExpenseLifeQuotes } from '@/lib/actions/final-expense-quotes';

export default function TestQuotesPage() {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testData = {
    age: 45,
    zipCode: '75201', // Dallas downtown
    gender: 'male',
    tobaccoUse: false,
  };

  const alternateTestData = {
    age: 35,
    zipCode: '77001', // Houston
    gender: 'female',
    tobaccoUse: false,
  };

  const handleTest = async (quoteType: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [quoteType]: true }));
    try {
      const response = await testFn();
      setResponses(prev => ({ ...prev, [quoteType]: response }));
      console.log(`${quoteType} Response:`, response);
    } catch (error) {
      console.error(`${quoteType} Error:`, error);
      setResponses(prev => ({ 
        ...prev, 
        [quoteType]: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [quoteType]: false }));
    }
  };

  const testDental = () => handleTest('Dental', async () => {
    return await getDentalQuotes({
      age: testData.age,
      zipCode: testData.zipCode,
      gender: testData.gender,
      tobaccoUse: testData.tobaccoUse,
      coveredMembers: 1
    });
  });

  const testDentalAlternate = () => handleTest('Dental (Alt)', async () => {
    return await getDentalQuotes({
      age: alternateTestData.age,
      zipCode: alternateTestData.zipCode,
      gender: alternateTestData.gender,
      tobaccoUse: alternateTestData.tobaccoUse,
      coveredMembers: 2 // Family coverage
    });
  });

  const testCancer = () => handleTest('Cancer', async () => {
    return await getCancerInsuranceQuotes({
      state: 'TX',
      age: testData.age,
      familyType: 'Applicant Only',
      tobaccoStatus: testData.tobaccoUse ? 'Tobacco' : 'Non-Tobacco',
      premiumMode: 'Monthly Bank Draft',
      carcinomaInSitu: '25%',
      benefitAmount: 25000
    });
  });

  const testHospitalIndemnity = () => handleTest('Hospital Indemnity', async () => {
    return await getHospitalIndemnityQuotes({
      zipCode: testData.zipCode,
      age: testData.age,
      gender: testData.gender === 'male' ? 'M' : 'F',
      tobaccoUse: testData.tobaccoUse
    });
  });

  const testFinalExpenseByFaceValue = () => handleTest('Final Expense By Face Value', async () => {
    console.log('Testing Final Expense by face value:', {
      zipCode: '75201', // Dallas - major city
      age: 65, // Most common age
      gender: 'F',
      tobaccoUse: false,
      desiredFaceValue: 10000 // $10K face value
    });
    return await getFinalExpenseLifeQuotes({
      zipCode: '75201', // Dallas - major city
      age: 65, // Most common age
      gender: 'F',
      tobaccoUse: false,
      desiredFaceValue: 10000 // $10K face value
    });
  });

  const testFinalExpenseByRate = () => handleTest('Final Expense By Rate', async () => {
    console.log('Testing Final Expense by rate:', {
      zipCode: '77001', // Houston center
      age: 55,
      gender: 'M',
      tobaccoUse: false,
      desiredRate: 50 // $50/month rate
    });
    return await getFinalExpenseLifeQuotes({
      zipCode: '77001', // Houston center
      age: 55,
      gender: 'M',
      tobaccoUse: false,
      desiredRate: 50 // $50/month rate
    });
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatResponse = (response: any) => {
    return JSON.stringify(response, null, 2);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Quote API Test Page</h1>
      
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Primary Test Data</h2>
          <pre className="text-sm">{JSON.stringify(testData, null, 2)}</pre>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Alternate Test Data</h2>
          <pre className="text-sm">{JSON.stringify(alternateTestData, null, 2)}</pre>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dental Quotes */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Dental Quotes</h2>
            <div className="space-x-2">
              <button
                onClick={testDental}
                disabled={loading['Dental']}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading['Dental'] ? 'Testing...' : 'Test Dental'}
              </button>
              <button
                onClick={testDentalAlternate}
                disabled={loading['Dental (Alt)']}
                className="px-3 py-2 bg-blue-400 text-white rounded hover:bg-blue-500 disabled:opacity-50 text-sm"
              >
                {loading['Dental (Alt)'] ? 'Testing...' : 'Alt Test'}
              </button>
            </div>
          </div>
          {responses['Dental'] && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Primary Test Response:</span>
                <button
                  onClick={() => copyToClipboard(formatResponse(responses['Dental']))}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                {formatResponse(responses['Dental'])}
              </pre>
            </div>
          )}
          {responses['Dental (Alt)'] && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Alternate Test Response:</span>
                <button
                  onClick={() => copyToClipboard(formatResponse(responses['Dental (Alt)']))}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                {formatResponse(responses['Dental (Alt)'])}
              </pre>
            </div>
          )}
        </div>

        {/* Cancer Insurance */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Cancer Insurance</h2>
            <button
              onClick={testCancer}
              disabled={loading['Cancer']}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading['Cancer'] ? 'Testing...' : 'Test Cancer'}
            </button>
          </div>
          {responses['Cancer'] && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Raw Response:</span>
                <button
                  onClick={() => copyToClipboard(formatResponse(responses['Cancer']))}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                {formatResponse(responses['Cancer'])}
              </pre>
            </div>
          )}
        </div>

        {/* Hospital Indemnity */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Hospital Indemnity</h2>
            <button
              onClick={testHospitalIndemnity}
              disabled={loading['Hospital Indemnity']}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {loading['Hospital Indemnity'] ? 'Testing...' : 'Test Hospital'}
            </button>
          </div>
          {responses['Hospital Indemnity'] && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Raw Response:</span>
                <button
                  onClick={() => copyToClipboard(formatResponse(responses['Hospital Indemnity']))}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                {formatResponse(responses['Hospital Indemnity'])}
              </pre>
            </div>
          )}
        </div>

        {/* Final Expense */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Final Expense Life</h2>
            <div className="space-x-2">
              <button
                onClick={testFinalExpenseByFaceValue}
                disabled={loading['Final Expense By Face Value']}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {loading['Final Expense By Face Value'] ? 'Testing...' : 'Test By Face Value'}
              </button>
              <button
                onClick={testFinalExpenseByRate}
                disabled={loading['Final Expense By Rate']}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading['Final Expense By Rate'] ? 'Testing...' : 'Test By Rate'}
              </button>
            </div>
          </div>
          {responses['Final Expense By Face Value'] && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">By Face Value Response:</span>
                <button
                  onClick={() => copyToClipboard(formatResponse(responses['Final Expense By Face Value']))}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                {formatResponse(responses['Final Expense By Face Value'])}
              </pre>
            </div>
          )}
          {responses['Final Expense By Rate'] && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">By Rate Response:</span>
                <button
                  onClick={() => copyToClipboard(formatResponse(responses['Final Expense By Rate']))}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                {formatResponse(responses['Final Expense By Rate'])}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Global Response View */}
      {Object.keys(responses).length > 0 && (
        <div className="mt-8 p-6 border rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">All Responses</h2>
            <button
              onClick={() => copyToClipboard(formatResponse(responses))}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Copy All
            </button>
          </div>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
            {formatResponse(responses)}
          </pre>
        </div>
      )}
    </div>
  );
}

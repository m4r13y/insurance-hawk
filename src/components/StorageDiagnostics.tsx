"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  cleanupVisitorData, 
  useVisitorId, 
  loadTemporaryData, 
  saveTemporaryData 
} from '@/lib/services/temporary-storage';

interface StorageDiagnosticsProps {
  onDataRestored?: () => void;
}

export default function StorageDiagnostics({ onDataRestored }: StorageDiagnosticsProps) {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const visitorId = useVisitorId();

  const analyzeProblem = async () => {
    setIsAnalyzing(true);
    const analysis: any = {
      visitorId,
      timestamp: new Date().toISOString(),
      localStorage: {},
      firestore: {},
      issues: [],
      recommendations: []
    };

    // Check localStorage
    try {
      const keys = [
        'medicare_final_expense_quotes',
        'medicare_hospital_indemnity_quotes', 
        'medicare_quote_form_data',
        'medicare_selected_categories'
      ];

      for (const key of keys) {
        const data = localStorage.getItem(key);
        analysis.localStorage[key] = {
          exists: !!data,
          size: data ? data.length : 0,
          count: data ? (JSON.parse(data).length || 0) : 0
        };
      }
    } catch (error) {
      analysis.localStorage.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Check Firestore (default database, visitors collection)
    try {
      const finalExpenseData = await loadTemporaryData('medicare_final_expense_quotes', []);
      const hospitalData = await loadTemporaryData('medicare_hospital_indemnity_quotes', []);
      const formData = await loadTemporaryData('medicare_quote_form_data', null);
      const dentalData = await loadTemporaryData('medicare_dental_quotes', []);
      const advantageData = await loadTemporaryData('medicare_advantage_quotes', []);

      analysis.firestore = {
        'medicare_final_expense_quotes': {
          exists: finalExpenseData.length > 0,
          count: finalExpenseData.length
        },
        'medicare_hospital_indemnity_quotes': {
          exists: hospitalData.length > 0,
          count: hospitalData.length
        },
        'medicare_dental_quotes': {
          exists: dentalData.length > 0,
          count: dentalData.length
        },
        'medicare_advantage_quotes': {
          exists: advantageData.length > 0,
          count: advantageData.length
        },
        'medicare_quote_form_data': {
          exists: !!formData
        }
      };
    } catch (error) {
      analysis.firestore.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Analyze issues
    if (analysis.localStorage['medicare_final_expense_quotes']?.count === 0 && 
        analysis.firestore['medicare_final_expense_quotes']?.count > 0) {
      analysis.issues.push('Final Expense quotes exist in Firestore but not in localStorage');
      analysis.recommendations.push('Restore Final Expense quotes from Firestore backup');
    }

    if (Object.values(analysis.localStorage).some((item: any) => item.size > 50000)) {
      analysis.issues.push('Large localStorage usage detected - may cause quota issues');
      analysis.recommendations.push('Enable Firestore for better storage management');
    }

    setDiagnostics(analysis);
    setIsAnalyzing(false);
  };

  const restoreFromFirestore = async () => {
    try {
      const quotesToRestore = [
        'medicare_final_expense_quotes',
        'medicare_hospital_indemnity_quotes',
        'medicare_dental_quotes',
        'medicare_advantage_quotes',
        'medicare_drug_plan_quotes',
        'medicare_cancer_insurance_quotes'
      ];

      for (const key of quotesToRestore) {
        const data = await loadTemporaryData(key, []);
        if (data.length > 0) {
          localStorage.setItem(key, JSON.stringify(data));
          console.log(`✅ Restored ${key} from Firestore (${data.length} items)`);
        }
      }

      // Restore form data
      const formData = await loadTemporaryData('medicare_quote_form_data', null);
      if (formData) {
        localStorage.setItem('medicare_quote_form_data', JSON.stringify(formData));
        console.log('✅ Restored form data from Firestore');
      }

      if (onDataRestored) {
        onDataRestored();
      }

      // Re-analyze after restore
      await analyzeProblem();
    } catch (error) {
      console.error('Failed to restore from Firestore:', error);
    }
  };

  const clearAllData = async () => {
    await cleanupVisitorData();
    localStorage.clear();
    window.location.reload();
  };

  const forceBackupToFirestore = async () => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('medicare_'));
      
      for (const key of keys) {
        const data = localStorage.getItem(key);
        if (data) {
          await saveTemporaryData(key, JSON.parse(data));
          console.log(`✅ Backed up ${key} to Firestore`);
        }
      }
      
      await analyzeProblem();
    } catch (error) {
      console.error('Failed to backup to Firestore:', error);
    }
  };

  useEffect(() => {
    analyzeProblem();
  }, []);

  if (!diagnostics) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Storage Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Analyzing storage...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Storage Diagnostics 
          <Badge variant="outline">{diagnostics.visitorId}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Issues */}
        {diagnostics.issues.length > 0 && (
          <div>
            <h4 className="font-semibold text-red-600 mb-2">Issues Found:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {diagnostics.issues.map((issue: string, index: number) => (
                <li key={index} className="text-red-600">{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {diagnostics.recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-orange-600 mb-2">Recommendations:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {diagnostics.recommendations.map((rec: string, index: number) => (
                <li key={index} className="text-orange-600">{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Storage Status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">localStorage</h4>
            {Object.entries(diagnostics.localStorage).map(([key, value]: [string, any]) => (
              <div key={key} className="flex justify-between">
                <span className="truncate">{key.replace('medicare_', '')}</span>
                <Badge variant={value.count > 0 ? "default" : "secondary"}>
                  {value.count || 0}
                </Badge>
              </div>
            ))}
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Firestore</h4>
            {Object.entries(diagnostics.firestore).map(([key, value]: [string, any]) => (
              <div key={key} className="flex justify-between">
                <span className="truncate">{key.replace('medicare_', '')}</span>
                <Badge variant={value.count > 0 ? "default" : "secondary"}>
                  {value.count || 0}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={restoreFromFirestore} 
            variant="default" 
            size="sm"
            disabled={isAnalyzing}
          >
            Restore from Firestore
          </Button>
          
          <Button 
            onClick={forceBackupToFirestore} 
            variant="outline" 
            size="sm"
            disabled={isAnalyzing}
          >
            Backup to Firestore
          </Button>
          
          <Button 
            onClick={analyzeProblem} 
            variant="outline" 
            size="sm"
            disabled={isAnalyzing}
          >
            Re-analyze
          </Button>
          
          <Button 
            onClick={clearAllData} 
            variant="destructive" 
            size="sm"
          >
            Clear All Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

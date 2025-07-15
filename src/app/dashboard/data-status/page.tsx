"use client"

import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  FileText, 
  Shield, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import Link from 'next/link';

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

export default function DataStatusPage() {
  const [user] = useFirebaseAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    if (!user || !functions) return;

    try {
      setLoading(true);
      const getUserAnalytics = httpsCallable(functions, 'getUserAnalytics');
      const result = await getUserAnalytics();
      setAnalytics(result.data as UserAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load user data analytics.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = async (dataType: string, itemId?: string) => {
    if (!user || !functions) return;

    const confirmMessage = dataType === 'allData' 
      ? 'Are you sure you want to delete ALL your data? This action cannot be undone.'
      : `Are you sure you want to delete this ${dataType}?`;

    if (!confirm(confirmMessage)) return;

    try {
      setOperationLoading(`delete-${dataType}`);
      const deleteUserData = httpsCallable(functions, 'deleteUserData');
      await deleteUserData({ dataType, itemId });
      
      toast({
        title: 'Success',
        description: `${dataType} deleted successfully.`
      });
      
      // Reload analytics
      await loadAnalytics();
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to delete ${dataType}.`
      });
    } finally {
      setOperationLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your data status...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
        <p className="text-muted-foreground mb-6">Unable to load your data status.</p>
        <Button onClick={loadAnalytics}>Try Again</Button>
      </div>
    );
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage all your account data
          </p>
        </div>
        <Button variant="outline" onClick={loadAnalytics}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Profile Completion Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Completion
          </CardTitle>
          <CardDescription>
            Your profile is {analytics.profileCompleteness}% complete
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Status</span>
              <span className={getCompletionColor(analytics.profileCompleteness)}>
                {analytics.profileCompleteness}%
              </span>
            </div>
            <Progress value={analytics.profileCompleteness} className="h-2" />
          </div>

          {/* Data Health Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-2">
              {analytics.dataHealth.hasBasicInfo ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Basic Information</span>
            </div>
            <div className="flex items-center gap-2">
              {analytics.dataHealth.hasContactInfo ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Contact Information</span>
            </div>
            <div className="flex items-center gap-2">
              {analytics.dataHealth.hasAddress ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Address Information</span>
            </div>
          </div>

          {/* Missing Fields Alert */}
          {analytics.dataHealth.missingFields.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Missing fields: {analytics.dataHealth.missingFields.join(', ')}
                <Link href="/dashboard/documents" className="ml-2 underline">
                  Complete your profile
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-2">
            <Button asChild size="sm">
              <Link href="/dashboard/documents">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDeleteData('profile')}
              disabled={operationLoading === 'delete-profile'}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Policies Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalPolicies}</div>
            <p className="text-xs text-muted-foreground">
              Active insurance policies
            </p>
            <div className="flex gap-2 mt-4">
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/documents">
                  <Edit className="h-4 w-4 mr-2" />
                  Manage
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/dashboard/apply">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Policy
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Uploaded documents
            </p>
            <div className="flex gap-2 mt-4">
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/documents">
                  <Edit className="h-4 w-4 mr-2" />
                  View All
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/dashboard/documents">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quotes Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quotes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalQuotes}</div>
            <p className="text-xs text-muted-foreground">
              Saved insurance quotes
            </p>
            <div className="flex gap-2 mt-4">
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/quotes">
                  <Edit className="h-4 w-4 mr-2" />
                  View All
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/dashboard/health-quotes">
                  <Plus className="h-4 w-4 mr-2" />
                  Get Quote
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common data management tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button asChild className="h-auto p-4" variant="outline">
              <Link href="/dashboard/health-info">
                <div className="text-left">
                  <div className="font-semibold">Update Health Information</div>
                  <div className="text-sm text-muted-foreground">
                    Manage doctors and medications
                  </div>
                </div>
              </Link>
            </Button>

            <Button asChild className="h-auto p-4" variant="outline">
              <Link href="/dashboard/apply">
                <div className="text-left">
                  <div className="font-semibold">Apply for Coverage</div>
                  <div className="text-sm text-muted-foreground">
                    Start a new insurance application
                  </div>
                </div>
              </Link>
            </Button>

            <Button asChild className="h-auto p-4" variant="outline">
              <Link href="/dashboard/health-quotes">
                <div className="text-left">
                  <div className="font-semibold">Get Insurance Quotes</div>
                  <div className="text-sm text-muted-foreground">
                    Compare plans and pricing
                  </div>
                </div>
              </Link>
            </Button>

            <Button asChild className="h-auto p-4" variant="outline">
              <Link href="/dashboard/recommendations">
                <div className="text-left">
                  <div className="font-semibold">View Recommendations</div>
                  <div className="text-sm text-muted-foreground">
                    Get personalized plan suggestions
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management Actions */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Data Management</CardTitle>
          <CardDescription>
            Advanced data operations - use with caution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              These actions will permanently modify or delete your data. 
              Please use them carefully.
            </AlertDescription>
          </Alert>

          <div className="flex flex-wrap gap-2">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleDeleteData('allData')}
              disabled={!!operationLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

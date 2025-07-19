"use client";

import React from 'react';
import { PrelineTable } from '@/components/ui/preline-table';
import { ProviderResultsTable } from '../../provider-lookup/provider-results-table';
import { QuoteResultsTable } from '../../quotes/quote-results-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Download, Star, Calendar, MapPin } from 'lucide-react';

export default function TableExamplesPage() {
  // Mock data for basic table
  const basicTableData = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      role: 'Administrator',
      status: 'active',
      lastLogin: '2024-01-15',
      planCount: 3
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      role: 'User',
      status: 'pending',
      lastLogin: '2024-01-14',
      planCount: 1
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob.johnson@email.com',
      role: 'Moderator',
      status: 'inactive',
      lastLogin: '2024-01-10',
      planCount: 2
    }
  ];

  const basicColumns = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-neutral-400">{row.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value: string) => (
        <Badge variant={value === 'Administrator' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'planCount',
      label: 'Plans',
      sortable: true,
      render: (value: number) => (
        <div className="text-center">
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => value // Handled by table's status rendering
    }
  ];

  const basicActions = [
    {
      label: 'View Profile',
      icon: <ExternalLink className="w-4 h-4" />,
      onClick: (row: any) => console.log('View profile:', row.id),
      variant: 'outline' as const
    },
    {
      label: 'Download Data',
      icon: <Download className="w-4 h-4" />,
      onClick: (row: any) => console.log('Download data:', row.id),
      variant: 'ghost' as const
    }
  ];

  // Mock provider data
  const mockProviderData = {
    "1234567890": {
      providerDetails: {
        rndrng_npi: "1234567890",
        rndrng_prvdr_last_org_name: "Smith Medical Center",
        rndrng_prvdr_first_name: "John",
        rndrng_prvdr_mi: "A",
        rndrng_prvdr_crdntls: "MD",
        rndrng_prvdr_ent_cd: "I" as const,
        rndrng_prvdr_st1: "123 Medical Plaza",
        rndrng_prvdr_city: "Baltimore",
        rndrng_prvdr_state_abrvtn: "MD",
        rndrng_prvdr_zip5: "21201",
        rndrng_prvdr_type: "Internal Medicine"
      },
      services: [
        {
          hcpcs_cd: "99213",
          hcpcs_desc: "Office Visit - Established Patient",
          hcpcs_drug_ind: "N" as const,
          place_of_srvc: "O" as const,
          tot_benes: 1250,
          tot_srvcs: 2100,
          avg_sbmtd_chrg: 185.50,
          avg_mdcr_alowd_amt: 142.30,
          avg_mdcr_pymt_amt: 113.84
        }
      ]
    }
  };

  // Mock quote data
  const mockQuotes = [
    {
      id: "quote-1",
      premium: 145.50,
      monthly_premium: 145.50,
      carrier: { name: "AARP/UnitedHealthcare", logo_url: null },
      plan_name: "Medicare Supplement Plan G",
      plan_type: "G",
      am_best_rating: "A+",
      discounts: []
    },
    {
      id: "quote-2", 
      premium: 132.75,
      monthly_premium: 132.75,
      carrier: { name: "Mutual of Omaha", logo_url: null },
      plan_name: "Medicare Supplement Plan F",
      plan_type: "F",
      am_best_rating: "A",
      discounts: []
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Preline Table Components
        </h1>
        <p className="text-gray-600 dark:text-neutral-400">
          Examples of our Preline-styled table components for different data types
        </p>
      </div>

      {/* Basic Table Example */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Data Table</CardTitle>
          <CardDescription>
            A general-purpose table component with sorting, actions, and status indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrelineTable
            title="User Management"
            description="Manage users, roles, and access permissions with comprehensive data views."
            columns={basicColumns}
            data={basicTableData}
            actions={basicActions}
            headerActions={
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Users
                </Button>
                <Button size="sm">
                  Add User
                </Button>
              </div>
            }
            insights={{
              enabled: true,
              content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">3</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Total Users</div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">1</div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">Active</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-500/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">1</div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
                  </div>
                </div>
              )
            }}
            pagination={{
              currentPage: 1,
              totalPages: 1,
              totalItems: basicTableData.length,
              itemsPerPage: basicTableData.length,
              onPageChange: (page) => console.log('Page changed:', page)
            }}
          />
        </CardContent>
      </Card>

      {/* Provider Search Table Example */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Search Results</CardTitle>
          <CardDescription>
            Table showing Medicare provider search results with detailed provider information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderResultsTable
            results={mockProviderData}
            totalCount={1}
            onViewDetails={(npi: string) => console.log('View provider details:', npi)}
            onSelectProvider={(npi: string) => console.log('Select provider:', npi)}
          />
        </CardContent>
      </Card>

      {/* Quote Results Table Example */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance Quote Results</CardTitle>
          <CardDescription>
            Table displaying insurance quotes with pricing, coverage details, and carrier information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuoteResultsTable
            quotes={mockQuotes}
            quoteType="medigap"
            onViewDetails={(quoteId: string) => console.log('View quote details:', quoteId)}
            onSelectQuote={(quoteId: string) => console.log('Select quote:', quoteId)}
            onDownloadQuote={(quoteId: string) => console.log('Download quote:', quoteId)}
          />
        </CardContent>
      </Card>

      {/* Implementation Note */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-500/10">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">Implementation Notes</CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Guidelines for using these table components in your application
          </CardDescription>
        </CardHeader>
        <CardContent className="text-blue-800 dark:text-blue-200">
          <ul className="space-y-2 list-disc list-inside">
            <li><strong>PrelineTable:</strong> General-purpose table component with sorting, pagination, and status indicators</li>
            <li><strong>ProviderResultsTable:</strong> Specialized for Medicare provider search results with provider-specific data formatting</li>
            <li><strong>QuoteResultsTable:</strong> Designed for insurance quote comparisons with premium, coverage, and carrier details</li>
            <li><strong>Responsive Design:</strong> All tables adapt to different screen sizes with horizontal scrolling on mobile</li>
            <li><strong>Dark Mode:</strong> Full dark mode support with appropriate color schemes</li>
            <li><strong>Accessibility:</strong> Screen reader friendly with proper ARIA labels and keyboard navigation</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

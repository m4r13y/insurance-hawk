"use client";

import React from 'react';
import { PrelineTable } from '@/components/ui/preline-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, User, ExternalLink, Star, MapPin, Phone, Globe } from 'lucide-react';
import type { ProviderService } from '@/types';

type GroupedProviders = {
  [key: string]: {
    providerDetails: Pick<ProviderService, 
      'rndrng_npi' | 
      'rndrng_prvdr_last_org_name' | 
      'rndrng_prvdr_first_name' | 
      'rndrng_prvdr_mi' | 
      'rndrng_prvdr_crdntls' | 
      'rndrng_prvdr_ent_cd' | 
      'rndrng_prvdr_st1' | 
      'rndrng_prvdr_st2' | 
      'rndrng_prvdr_city' | 
      'rndrng_prvdr_state_abrvtn' | 
      'rndrng_prvdr_zip5' | 
      'rndrng_prvdr_type'
    >;
    services: Pick<ProviderService, 
      'hcpcs_cd' | 
      'hcpcs_desc' | 
      'hcpcs_drug_ind' | 
      'place_of_srvc' | 
      'tot_benes' | 
      'tot_srvcs' | 
      'avg_sbmtd_chrg' | 
      'avg_mdcr_alowd_amt' | 
      'avg_mdcr_pymt_amt'
    >[];
  };
};

interface ProviderResultsTableProps {
  results: GroupedProviders;
  totalCount: number;
  onViewDetails: (npi: string) => void;
  onSelectProvider: (npi: string) => void;
}

export function ProviderResultsTable({ 
  results, 
  totalCount, 
  onViewDetails, 
  onSelectProvider 
}: ProviderResultsTableProps) {
  // Transform the grouped providers into table data
  const tableData = Object.values(results).map(({ providerDetails, services }) => {
    const totalBeneficiaries = services.reduce((sum, service) => sum + (service.tot_benes || 0), 0);
    const totalServices = services.reduce((sum, service) => sum + (service.tot_srvcs || 0), 0);
    const avgSubmitted = services.reduce((sum, service) => sum + (service.avg_sbmtd_chrg || 0), 0) / services.length;
    
    return {
      npi: providerDetails.rndrng_npi,
      provider: {
        name: `${providerDetails.rndrng_prvdr_first_name || ''} ${providerDetails.rndrng_prvdr_mi || ''} ${providerDetails.rndrng_prvdr_last_org_name}`.trim(),
        credentials: providerDetails.rndrng_prvdr_crdntls,
        type: providerDetails.rndrng_prvdr_ent_cd,
        specialty: providerDetails.rndrng_prvdr_type
      },
      location: {
        address: providerDetails.rndrng_prvdr_st1,
        city: providerDetails.rndrng_prvdr_city,
        state: providerDetails.rndrng_prvdr_state_abrvtn,
        zip: providerDetails.rndrng_prvdr_zip5
      },
      services: services.length,
      beneficiaries: totalBeneficiaries,
      totalServices: totalServices,
      avgCharge: avgSubmitted,
      status: totalServices > 1000 ? 'active' : totalServices > 100 ? 'verified' : 'pending'
    };
  });

  const columns = [
    {
      key: 'provider',
      label: 'Provider',
      sortable: true,
      render: (value: any) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {value.type === 'I' ? (
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center">
                <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {value.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-neutral-400 truncate">
              {value.credentials}
            </p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {value.specialty}
            </Badge>
          </div>
        </div>
      )
    },
    {
      key: 'npi',
      label: 'NPI',
      sortable: true,
      render: (value: string) => (
        <div className="font-mono text-sm text-gray-900 dark:text-white">
          {value}
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (value: any) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-900 dark:text-white">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span>{value.city}, {value.state}</span>
          </div>
          <p className="text-gray-500 dark:text-neutral-400 mt-1 text-xs">
            {value.address}
          </p>
          <p className="text-gray-500 dark:text-neutral-400 text-xs">
            {value.zip}
          </p>
        </div>
      )
    },
    {
      key: 'services',
      label: 'Services',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm">
          <span className="font-medium text-gray-900 dark:text-white">
            {value.toLocaleString()}
          </span>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            service types
          </p>
        </div>
      )
    },
    {
      key: 'beneficiaries',
      label: 'Beneficiaries',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm">
          <span className="font-medium text-gray-900 dark:text-white">
            {value.toLocaleString()}
          </span>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            patients served
          </p>
        </div>
      )
    },
    {
      key: 'avgCharge',
      label: 'Avg. Charge',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          ${value.toFixed(2)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Activity Level',
      render: (value: string) => value // This will be handled by the table's status rendering
    }
  ];

  const actions = [
    {
      label: 'View Details',
      icon: <ExternalLink className="w-4 h-4" />,
      onClick: (row: any) => onViewDetails(row.npi),
      variant: 'outline' as const
    },
    {
      label: 'Select Provider',
      icon: <Star className="w-4 h-4" />,
      onClick: (row: any) => onSelectProvider(row.npi),
      variant: 'default' as const
    }
  ];

  const headerActions = (
    <div className="flex items-center gap-3">
      <div className="text-sm text-gray-500 dark:text-neutral-400">
        {totalCount} providers found
      </div>
      <Button variant="outline" size="sm">
        <Globe className="w-4 h-4 mr-2" />
        Export Results
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PrelineTable
        title="Provider Search Results"
        description={`Found ${totalCount} Medicare providers matching your search criteria. Review their services, patient volume, and average charges.`}
        columns={columns}
        data={tableData}
        actions={actions}
        headerActions={headerActions}
        insights={{
          enabled: true,
          content: (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {Object.values(results).filter(p => p.providerDetails.rndrng_prvdr_ent_cd === 'O').length}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Organizations</p>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                      {Object.values(results).filter(p => p.providerDetails.rndrng_prvdr_ent_cd === 'I').length}
                    </p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Individual Providers</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-500/10 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {Object.values(results).reduce((sum, p) => sum + p.services.length, 0)}
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Total Services</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }}
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalItems: totalCount,
          itemsPerPage: totalCount,
          onPageChange: (page) => console.log('Page changed:', page)
        }}
      />
    </div>
  );
}

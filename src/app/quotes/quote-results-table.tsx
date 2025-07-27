"use client";

import React from 'react';
import { PrelineTable } from '@/components/ui/preline-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, DollarSign, Calendar, Star, ExternalLink, Download, Heart } from 'lucide-react';
import type { Quote, DentalQuote, CancerQuote } from '@/types';

interface QuoteResultsTableProps {
  quotes: (Quote | DentalQuote | CancerQuote)[];
  quoteType: 'medigap' | 'dental' | 'cancer' | 'hospital';
  onViewDetails: (quoteId: string) => void;
  onSelectQuote: (quoteId: string) => void;
  onDownloadQuote?: (quoteId: string) => void;
}

export function QuoteResultsTable({ 
  quotes, 
  quoteType,
  onViewDetails, 
  onSelectQuote,
  onDownloadQuote 
}: QuoteResultsTableProps) {
  // Transform quotes into table data based on type
  const tableData = quotes.map((quote) => {
    let baseData = {
      id: (quote as any).id || 'N/A',
      carrier: typeof quote.carrier === 'string' ? quote.carrier : quote.carrier.name,
      planName: (quote as any).plan_name || 'N/A',
      premium: (quote as any).monthly_premium || 0,
      deductible: 0, // Not all quote types have deductibles
      status: ((quote as any).monthly_premium || 0) < 100 ? 'verified' : ((quote as any).monthly_premium || 0) < 200 ? 'active' : 'pending'
    };

    // Add type-specific data
    if (quoteType === 'medigap') {
      const medigapQuote = quote as Quote;
      return {
        ...baseData,
        planType: medigapQuote.plan_type,
        coverage: medigapQuote.plan_type,
        additionalInfo: `Plan ${medigapQuote.plan_type}`,
        rating: (medigapQuote as any).am_best_rating || ''
      };
    } else if (quoteType === 'dental') {
      const dentalQuote = quote as DentalQuote;
      return {
        ...baseData,
        planType: 'Dental',
        coverage: dentalQuote.benefit_amount ? `${dentalQuote.benefit_amount} ${dentalQuote.benefit_quantifier}` : 'Standard',
        additionalInfo: dentalQuote.benefit_notes || 'Comprehensive dental coverage',
        rating: dentalQuote.am_best_rating ? 5 : 4
      };
    } else if (quoteType === 'cancer') {
      const cancerQuote = quote as CancerQuote;
      return {
        ...baseData,
        planType: 'Cancer Insurance',
        coverage: cancerQuote.benefit_amount ? `$${cancerQuote.benefit_amount}` : 'Comprehensive',
        additionalInfo: 'Cancer coverage protection',
        rating: 5
      };
    }

    return baseData;
  });

  const getQuoteTypeIcon = () => {
    switch (quoteType) {
      case 'medigap': return Shield;
      case 'dental': return Star;
      case 'cancer': return Heart;
      default: return Shield;
    }
  };

  const getQuoteTypeColor = () => {
    switch (quoteType) {
      case 'medigap': return 'blue';
      case 'dental': return 'emerald';
      case 'cancer': return 'pink';
      default: return 'blue';
    }
  };

  const Icon = getQuoteTypeIcon();
  const color = getQuoteTypeColor();

  const columns = [
    {
      key: 'carrier',
      label: 'Insurance Carrier',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 w-10 h-10 bg-${color}-100 dark:bg-${color}-500/10 rounded-full flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {value}
            </p>
            <p className="text-sm text-gray-500 dark:text-neutral-400 truncate">
              {row.planName}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'planType',
      label: 'Plan Type',
      sortable: true,
      render: (value: string) => (
        <Badge variant="secondary" className="font-medium">
          {value}
        </Badge>
      )
    },
    {
      key: 'premium',
      label: 'Monthly Premium',
      sortable: true,
      render: (value: number) => (
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${value.toFixed(2)}
          </div>
          <p className="text-xs text-gray-500 dark:text-neutral-400">per month</p>
        </div>
      )
    },
    {
      key: 'deductible',
      label: 'Deductible',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm">
          <span className="font-medium text-gray-900 dark:text-white">
            {value > 0 ? `$${value.toLocaleString()}` : 'None'}
          </span>
        </div>
      )
    },
    {
      key: 'coverage',
      label: 'Coverage',
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {value}
        </div>
      )
    },
    {
      key: 'rating',
      label: 'AM Best Rating',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">{value || 'N/A'}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => value // This will be handled by the table's status rendering
    }
  ];

  const actions = [
    {
      label: 'View Details',
      icon: <ExternalLink className="w-4 h-4" />,
      onClick: (row: any) => onViewDetails(row.id),
      variant: 'outline' as const
    },
    ...(onDownloadQuote ? [{
      label: 'Download',
      icon: <Download className="w-4 h-4" />,
      onClick: (row: any) => onDownloadQuote(row.id),
      variant: 'ghost' as const
    }] : []),
    {
      label: 'Select Quote',
      icon: <Star className="w-4 h-4" />,
      onClick: (row: any) => onSelectQuote(row.id),
      variant: 'default' as const
    }
  ];

  const headerActions = (
    <div className="flex items-center gap-3">
      <div className="text-sm text-gray-500 dark:text-neutral-400">
        {quotes.length} quotes available
      </div>
      <Button variant="outline" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Export All
      </Button>
    </div>
  );

  const getQuoteTypeTitle = () => {
    switch (quoteType) {
      case 'medigap': return 'Medigap Insurance Quotes';
      case 'dental': return 'Dental Insurance Quotes';
      case 'cancer': return 'Cancer Insurance Quotes';
      case 'hospital': return 'Hospital Indemnity Quotes';
      default: return 'Insurance Quotes';
    }
  };

  const getQuoteTypeDescription = () => {
    switch (quoteType) {
      case 'medigap': return 'Compare Medigap plans to supplement your Medicare coverage with comprehensive benefits and competitive rates.';
      case 'dental': return 'Find dental insurance plans that fit your budget and provide the coverage you need for oral health.';
      case 'cancer': return 'Protect yourself with cancer insurance that provides financial support during treatment and recovery.';
      case 'hospital': return 'Hospital indemnity insurance helps cover out-of-pocket costs during hospital stays.';
      default: return 'Review and compare insurance quotes to find the best coverage for your needs.';
    }
  };

  // Calculate insights
  const avgPremium = quotes.reduce((sum, q) => sum + ((q as any).monthly_premium || 0), 0) / quotes.length;
  const lowestPremium = Math.min(...quotes.map(q => (q as any).monthly_premium || 0));
  const highestPremium = Math.max(...quotes.map(q => (q as any).monthly_premium || 0));

  return (
    <div className="space-y-6">
      <PrelineTable
        title={getQuoteTypeTitle()}
        description={getQuoteTypeDescription()}
        columns={columns}
        data={tableData}
        actions={actions}
        headerActions={headerActions}
        insights={{
          enabled: true,
          content: (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`bg-${color}-50 dark:bg-${color}-500/10 p-4 rounded-lg`}>
                <div className="flex items-center gap-3">
                  <DollarSign className={`w-8 h-8 text-${color}-600 dark:text-${color}-400`} />
                  <div>
                    <p className={`text-2xl font-bold text-${color}-900 dark:text-${color}-100`}>
                      ${avgPremium.toFixed(0)}
                    </p>
                    <p className={`text-sm text-${color}-600 dark:text-${color}-400`}>Average Premium</p>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                      ${lowestPremium.toFixed(0)}
                    </p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Lowest Premium</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-500/10 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {quotes.length}
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Total Options</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }}
        pagination={{
          currentPage: 1,
          totalPages: Math.ceil(quotes.length / 10),
          totalItems: quotes.length,
          itemsPerPage: Math.min(10, quotes.length),
          onPageChange: (page) => console.log('Page changed:', page)
        }}
      />
    </div>
  );
}

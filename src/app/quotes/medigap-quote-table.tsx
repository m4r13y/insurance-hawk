"use client";

import React from 'react';
import { Shield } from 'lucide-react';
import { PrelineTable } from '@/components/ui/preline-table';
import { Button } from '@/components/ui/button';

interface MedigapQuoteTableProps {
  quotes: Array<{
    id: string;
    carrier: { name: string; full_name?: string; logo_url?: string | null };
    plan_name: string;
    premium: number;
    monthly_premium: number;
  }>;
  onViewDetails: (id: string) => void;
  onSelectQuote: (id: string) => void;
}

export function MedigapQuoteTable({ quotes, onViewDetails, onSelectQuote }: MedigapQuoteTableProps) {
  const color = 'blue';
  const Icon = Shield;

  const getBeforeComma = (str?: string) => {
    if (!str) return '';
    const idx = str.indexOf(',');
    return idx === -1 ? str : str.slice(0, idx);
  };

  const tableData = quotes.map((q) => {
    // Support both 'full_name' and 'name_full' for compatibility
    const fullNameRaw = typeof q.carrier.full_name === 'string' ? q.carrier.full_name : (typeof (q.carrier as any).name_full === 'string' ? (q.carrier as any).name_full : undefined);
    const carrierName = getBeforeComma(q.carrier.name);
    const carrierFull = fullNameRaw && fullNameRaw !== q.carrier.name ? getBeforeComma(fullNameRaw) : '';
    return {
      id: q.id,
      carrier: carrierName,
      carrierFull: carrierFull,
      planName: q.plan_name,
      premium: q.premium,
    };
  });

  const columns = [
    {
      key: 'carrier',
      label: 'Insurance Carrier',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center gap-2 min-w-0">
          <div className={`flex-shrink-0 w-8 h-8 bg-${color}-100 dark:bg-${color}-500/10 rounded-full flex items-center justify-center`}>
            <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate leading-tight">
              {value}
            </p>
            {row.carrierFull && (
              <p className="text-[10px] text-gray-500 dark:text-neutral-400 truncate leading-tight">
                {row.carrierFull}
              </p>
            )}
          </div>
        </div>
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
    }
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: (row: any) => onViewDetails(row.id),
      variant: 'outline' as const
    },
    {
      label: 'Select Quote',
      onClick: (row: any) => onSelectQuote(row.id),
      variant: 'default' as const
    }
  ];

  return (
    <div className="space-y-6">
      <PrelineTable
        title="Medigap Insurance Quotes"
        description="Compare Medigap plans to supplement your Medicare coverage with comprehensive benefits and competitive rates."
        columns={columns}
        data={tableData}
        actions={actions}
        headerActions={undefined}
        insights={undefined}
        pagination={undefined}
      />
    </div>
  );
}

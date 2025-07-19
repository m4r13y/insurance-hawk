"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Eye, ExternalLink, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

interface PrelineTableProps {
  title: string;
  description?: string;
  columns: Column[];
  data: any[];
  actions?: TableAction[];
  headerActions?: React.ReactNode;
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  insights?: {
    enabled: boolean;
    content?: React.ReactNode;
  };
  selectable?: boolean;
  selectedRows?: string[];
  onRowSelect?: (selectedIds: string[]) => void;
  onRowClick?: (row: any) => void;
  className?: string;
}

export function PrelineTable({
  title,
  description,
  columns,
  data,
  actions,
  headerActions,
  loading = false,
  pagination,
  insights,
  selectable = false,
  selectedRows = [],
  onRowSelect,
  onRowClick,
  className
}: PrelineTableProps) {
  const [insightsOpen, setInsightsOpen] = React.useState(false);
  const [allSelected, setAllSelected] = React.useState(false);

  const handleSelectAll = () => {
    if (!onRowSelect) return;
    
    if (allSelected) {
      onRowSelect([]);
      setAllSelected(false);
    } else {
      const allIds = data.map(row => row.id || row.key);
      onRowSelect(allIds);
      setAllSelected(true);
    }
  };

  const handleRowSelect = (rowId: string) => {
    if (!onRowSelect) return;
    
    const newSelection = selectedRows.includes(rowId)
      ? selectedRows.filter(id => id !== rowId)
      : [...selectedRows, rowId];
    
    onRowSelect(newSelection);
    setAllSelected(newSelection.length === data.length);
  };

  const renderCellContent = (column: Column, row: any) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    // Default renderers based on column key patterns
    if (column.key.includes('rating') && typeof value === 'number') {
      return (
        <div className="flex gap-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "size-3",
                i < Math.floor(value) 
                  ? "text-blue-600 fill-current dark:text-blue-500" 
                  : "text-gray-300 dark:text-neutral-700"
              )}
            />
          ))}
        </div>
      );
    }
    
    if (column.key.includes('status')) {
      const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        'active': { bg: 'bg-teal-100 dark:bg-teal-500/10', text: 'text-teal-800 dark:text-teal-500', label: 'Active' },
        'inactive': { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-800 dark:text-red-500', label: 'Inactive' },
        'pending': { bg: 'bg-yellow-100 dark:bg-yellow-500/10', text: 'text-yellow-800 dark:text-yellow-500', label: 'Pending' },
        'verified': { bg: 'bg-teal-100 dark:bg-teal-500/10', text: 'text-teal-800 dark:text-teal-500', label: 'Verified' },
        'paid': { bg: 'bg-teal-100 dark:bg-teal-500/10', text: 'text-teal-800 dark:text-teal-500', label: 'Paid' },
        'declined': { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-800 dark:text-red-500', label: 'Declined' }
      };
      
      const config = statusConfig[value?.toLowerCase()] || { bg: 'bg-gray-100 dark:bg-neutral-700', text: 'text-gray-800 dark:text-neutral-200', label: value };
      
      return (
        <span className={cn(
          "py-1 px-1.5 inline-flex items-center gap-x-1 text-xs font-medium rounded-full",
          config.bg,
          config.text
        )}>
          <svg className="size-2.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
          </svg>
          {config.label}
        </span>
      );
    }
    
    if (column.key.includes('price') || column.key.includes('premium') || column.key.includes('amount')) {
      return (
        <span className="text-sm text-gray-600 dark:text-neutral-400">
          ${typeof value === 'number' ? value.toFixed(2) : value}
        </span>
      );
    }
    
    if (column.key.includes('website') || column.key.includes('url')) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 inline-flex items-center gap-1"
        >
          <ExternalLink className="size-3" />
          Visit
        </a>
      );
    }
    
    return <span className="text-sm text-gray-600 dark:text-neutral-400">{value}</span>;
  };

  if (loading) {
    return (
      <div className={cn("max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto", className)}>
        <div className="flex flex-col">
          <div className="-m-1.5 overflow-x-auto">
            <div className="p-1.5 min-w-full inline-block align-middle">
              <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden dark:bg-neutral-900 dark:border-neutral-700">
                <div className="px-6 py-4">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto", className)}>
      <div className="flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden dark:bg-neutral-900 dark:border-neutral-700">
              {/* Header */}
              <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-neutral-700">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">
                    {title}
                  </h2>
                  {description && (
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                      {description}
                    </p>
                  )}
                </div>
                {headerActions && (
                  <div className="inline-flex gap-x-2">
                    {headerActions}
                  </div>
                )}
              </div>

              {/* Insights */}
              {insights?.enabled && (
                <div className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-900 dark:border-neutral-700">
                  <button 
                    type="button" 
                    className="hs-collapse-toggle py-4 px-6 w-full flex items-center gap-2 font-semibold text-gray-800 dark:text-neutral-200"
                    onClick={() => setInsightsOpen(!insightsOpen)}
                  >
                    <ChevronRight className={cn("size-4 transition-transform", insightsOpen && "rotate-90")} />
                    Insights
                  </button>
                  {insightsOpen && (
                    <div className="pb-4 px-6">
                      {insights.content || (
                        <div className="flex items-center space-x-2">
                          <span className="size-5 flex justify-center items-center rounded-full bg-blue-600 text-white dark:bg-blue-500">
                            <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </span>
                          <span className="text-sm text-gray-800 dark:text-neutral-400">
                            Found {data.length} results for your search.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Table */}
              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                <thead className="bg-gray-50 dark:bg-neutral-900">
                  <tr>
                    {selectable && (
                      <th scope="col" className="ps-6 py-3 text-start">
                        <label className="flex">
                          <input 
                            type="checkbox" 
                            className="shrink-0 border-gray-300 rounded-sm text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-600 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                            checked={allSelected}
                            onChange={handleSelectAll}
                          />
                          <span className="sr-only">Select all</span>
                        </label>
                      </th>
                    )}
                    {columns.map((column) => (
                      <th key={column.key} scope="col" className={cn("px-6 py-3 text-start", column.className)}>
                        <div className="flex items-center gap-x-2">
                          <span className="text-xs font-semibold uppercase text-gray-800 dark:text-neutral-200">
                            {column.label}
                          </span>
                          {column.sortable && (
                            <button className="text-gray-500 hover:text-gray-700 dark:text-neutral-500 dark:hover:text-neutral-300">
                              <svg className="size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m7 15 5 5 5-5"/>
                                <path d="m7 9 5-5 5 5"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    {actions && actions.length > 0 && (
                      <th scope="col" className="px-6 py-3 text-end"></th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                  {data.map((row, index) => (
                    <tr 
                      key={row.id || index} 
                      className={cn(
                        "bg-white hover:bg-gray-50 dark:bg-neutral-900 dark:hover:bg-neutral-800",
                        onRowClick && "cursor-pointer"
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <td className="size-px whitespace-nowrap">
                          <div className="ps-6 py-2">
                            <label className="flex">
                              <input 
                                type="checkbox" 
                                className="shrink-0 border-gray-300 rounded-sm text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-600 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
                                checked={selectedRows.includes(row.id || row.key)}
                                onChange={() => handleRowSelect(row.id || row.key)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="sr-only">Select row</span>
                            </label>
                          </div>
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key} className="size-px whitespace-nowrap">
                          <div className="px-6 py-2">
                            {renderCellContent(column, row)}
                          </div>
                        </td>
                      ))}
                      {actions && actions.length > 0 && (
                        <td className="size-px whitespace-nowrap">
                          <div className="px-6 py-1.5 flex gap-x-2 justify-end">
                            {actions.map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                variant={action.variant || "outline"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(row);
                                }}
                                className={cn("text-xs", action.className)}
                              >
                                {action.icon}
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer with Pagination */}
              {pagination && (
                <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200 dark:border-neutral-700">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                      <span className="font-semibold text-gray-800 dark:text-neutral-200">{pagination.totalItems}</span> results
                    </p>
                  </div>

                  <div>
                    <div className="inline-flex gap-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1}
                        className="text-sm"
                      >
                        <ChevronLeft className="size-4" />
                        Prev
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.totalPages}
                        className="text-sm"
                      >
                        Next
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {data.length === 0 && !loading && (
                <div className="px-6 py-12 text-center">
                  <div className="max-w-sm mx-auto">
                    <svg className="mx-auto size-16 text-gray-400 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-neutral-200">No results found</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

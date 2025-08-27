"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeftIcon, ChevronRightIcon, EyeOpenIcon, ExternalLinkIcon, StarIcon, ChevronDownIcon } from '@radix-ui/react-icons';
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

interface AdvancedTableProps {
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

export function AdvancedTable({
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
}: AdvancedTableProps) {
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
            <StarIcon
              key={i}
              className={cn(
                "size-3",
                i < Math.floor(value) 
                  ? "text-primary fill-current dark:text-primary" 
                  : "text-muted-foreground dark:text-neutral-700"
              )}
            />
          ))}
        </div>
      );
    }
    
    if (column.key.includes('status')) {
      const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        'active': { bg: 'bg-success/10 text-success', text: '', label: 'Active' },
        'inactive': { bg: 'bg-destructive/10 text-destructive', text: '', label: 'Inactive' },
        'pending': { bg: 'bg-warning/10 text-warning', text: '', label: 'Pending' },
        'verified': { bg: 'bg-success/10 text-success', text: '', label: 'Verified' },
        'paid': { bg: 'bg-success/10 text-success', text: '', label: 'Paid' },
        'declined': { bg: 'bg-destructive/10 text-destructive', text: '', label: 'Declined' }
      };
      
      const config = statusConfig[value?.toLowerCase()] || { bg: 'bg-secondary text-foreground dark:bg-neutral-700 dark:text-neutral-200', text: '', label: value };
      
      return (
        <Badge variant="outline" className={config.bg}>
          {config.label}
        </Badge>
      );
    }
    
    if (column.key.includes('price') || column.key.includes('premium') || column.key.includes('amount')) {
      return (
        <span className="font-medium text-foreground">
          ${typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      );
    }
    
    if (column.key.includes('website') || column.key.includes('url')) {
      return (
        <Button variant="ghost" size="sm" asChild>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1"
          >
            <ExternalLinkIcon className="size-3" />
            Visit
          </a>
        </Button>
      );
    }
    
    return <span className="text-sm">{value}</span>;
  };

  if (loading) {
    return (
      <div className={cn("w-full space-y-4", className)}>
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="bg-card border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                {title}
              </h2>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex gap-2">
                {headerActions}
              </div>
            )}
          </div>
        </div>

        {/* Insights */}
        {insights?.enabled && (
          <div className="border-b">
            <button 
              type="button" 
              className="w-full px-6 py-4 flex items-center gap-2 text-left hover:bg-muted/50 transition-colors"
              onClick={() => setInsightsOpen(!insightsOpen)}
            >
              <ChevronDownIcon className={cn("size-4 transition-transform", insightsOpen && "rotate-180")} />
              <span className="font-medium">Insights</span>
            </button>
            {insightsOpen && (
              <div className="px-6 pb-4">
                {insights.content || (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="size-2 bg-primary rounded-full"></div>
                    Found {data.length} results for your search.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {selectable && (
                  <th className="w-12 px-6 py-3 text-left">
                    <input 
                      type="checkbox" 
                      className="rounded border-input"
                      checked={allSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th key={column.key} className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", column.className)}>
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <Button variant="ghost" size="sm" className="h-auto p-0">
                          <ChevronDownIcon className="size-3" />
                        </Button>
                      )}
                    </div>
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="px-6 py-3 text-right">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y">
              {data.map((row, index) => (
                <tr 
                  key={row.id || index} 
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-input"
                        checked={selectedRows.includes(row.id || row.key)}
                        onChange={() => handleRowSelect(row.id || row.key)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4">
                      {renderCellContent(column, row)}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            variant={action.variant || "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            className={action.className}
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
        </div>

        {/* Footer with Pagination */}
        {pagination && (
          <div className="px-6 py-4 border-t bg-muted/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{data.length}</span> of{' '}
                <span className="font-medium">{pagination.totalItems}</span> results
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                >
                  <ChevronLeftIcon className="size-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                >
                  Next
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {data.length === 0 && !loading && (
          <div className="px-6 py-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="mx-auto size-16 text-muted-foreground/50 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

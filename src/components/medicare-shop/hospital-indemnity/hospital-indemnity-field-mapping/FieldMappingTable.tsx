import React, { useState } from 'react';
import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronRightIcon, CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import { HOSPITAL_INDEMNITY_FIELD_CATEGORIES } from './field-analysis';

interface FieldMappingTableProps {
  quote: OptimizedHospitalIndemnityQuote;
}

export function FieldMappingTable({ quote }: FieldMappingTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Core Quote Information']));
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getFieldValue = (field: any) => {
    if (field.nested && field.originalField.includes('.')) {
      const paths = field.originalField.split('.');
      let value: any = quote;
      
      // Handle special cases for company_base nested structure
      if (paths[0] === 'company_base') {
        value = (quote as any).companyBase || (quote as any).company_base;
        if (!value) return 'N/A';
        
        for (let i = 1; i < paths.length; i++) {
          if (paths[i] === 'parent_company_base') {
            value = value.parentCompanyBase || value.parent_company_base;
          } else {
            value = value[paths[i]];
          }
          if (value === undefined || value === null) return 'N/A';
        }
        return value;
      }
      
      // Handle other nested paths
      for (const path of paths) {
        value = value?.[path];
        if (value === undefined || value === null) return 'N/A';
      }
      return value;
    }
    
    // Handle array types
    if (field.arrayType) {
      const value = (quote as any)[field.mappedField.replace('[]', '')] || (quote as any)[field.originalField];
      return Array.isArray(value) ? `Array(${value.length})` : 'N/A';
    }
    
    // Handle direct field mapping
    const value = (quote as any)[field.mappedField] || (quote as any)[field.originalField];
    return value !== undefined && value !== null ? value : 'N/A';
  };

  const formatValue = (value: any, dataType: string): string => {
    if (value === null || value === undefined || value === 'N/A') return 'N/A';
    
    if (dataType === 'boolean') return value ? 'Yes' : 'No';
    if (dataType === 'number') return value.toLocaleString();
    if (dataType === 'array') return value;
    if (typeof value === 'object') return JSON.stringify(value);
    
    return String(value);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Hospital Indemnity Field Mapping Analysis</span>
          <Badge variant="outline">{HOSPITAL_INDEMNITY_FIELD_CATEGORIES.length} Categories</Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Detailed field-by-field mapping from raw API response to optimized quote structure.
          Analysis based on 1767-line quote structure with 42 mapped fields across 10 categories.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {HOSPITAL_INDEMNITY_FIELD_CATEGORIES.map((category) => {
          const isExpanded = expandedCategories.has(category.category);
          
          return (
            <div key={category.category} className="border rounded-lg">
              <Button
                variant="ghost"
                onClick={() => toggleCategory(category.category)}
                className="w-full justify-start p-4 h-auto"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                    <div className="text-left">
                      <div className="font-medium">{category.category}</div>
                      <div className="text-sm text-gray-600">{category.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getComplexityColor(category.complexity)}>
                      {category.complexity}
                    </Badge>
                    <Badge variant="outline">
                      {category.fields.length} fields
                    </Badge>
                  </div>
                </div>
              </Button>
              
              {isExpanded && (
                <div className="border-t bg-gray-50">
                  {category.notes && (
                    <div className="p-4 bg-blue-50 border-b">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> {category.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {category.fields.map((field, index) => {
                        const fieldValue = getFieldValue(field);
                        const formattedValue = formatValue(fieldValue, field.dataType);
                        
                        return (
                          <div key={index} className="border rounded p-3 bg-white">
                            <div className="grid grid-cols-12 gap-3 items-start">
                              {/* Field Names */}
                              <div className="col-span-3">
                                <div className="text-xs font-medium text-gray-500 mb-1">Original Field</div>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {field.originalField}
                                </code>
                                
                                <div className="text-xs font-medium text-gray-500 mb-1 mt-2">Mapped Field</div>
                                <code className="text-xs bg-blue-100 px-2 py-1 rounded">
                                  {field.mappedField}
                                </code>
                              </div>
                              
                              {/* Data Type and Flags */}
                              <div className="col-span-2">
                                <div className="text-xs font-medium text-gray-500 mb-1">Type</div>
                                <Badge variant="outline" className="text-xs">
                                  {field.dataType}
                                </Badge>
                                
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {field.required && (
                                    <Badge variant="secondary" className="text-xs">Required</Badge>
                                  )}
                                  {field.nested && (
                                    <Badge variant="outline" className="text-xs">Nested</Badge>
                                  )}
                                  {field.arrayType && (
                                    <Badge variant="outline" className="text-xs">Array</Badge>
                                  )}
                                </div>
                              </div>
                              
                              {/* Description */}
                              <div className="col-span-4">
                                <div className="text-xs font-medium text-gray-500 mb-1">Description</div>
                                <p className="text-sm">{field.description}</p>
                              </div>
                              
                              {/* Current Value */}
                              <div className="col-span-3">
                                <div className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-2">
                                  Current Value
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 w-5 p-0"
                                    onClick={() => copyToClipboard(String(fieldValue), field.originalField)}
                                  >
                                    {copiedField === field.originalField ? (
                                      <CheckIcon className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <CopyIcon className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                                <div className="text-sm font-mono bg-gray-100 p-2 rounded max-h-20 overflow-y-auto">
                                  {formattedValue}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Summary Statistics */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Field Mapping Summary</h4>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Total Categories</div>
              <div className="text-gray-600">{HOSPITAL_INDEMNITY_FIELD_CATEGORIES.length}</div>
            </div>
            <div>
              <div className="font-medium">Total Fields</div>
              <div className="text-gray-600">
                {HOSPITAL_INDEMNITY_FIELD_CATEGORIES.reduce((sum, cat) => sum + cat.fields.length, 0)}
              </div>
            </div>
            <div>
              <div className="font-medium">Required Fields</div>
              <div className="text-gray-600">
                {HOSPITAL_INDEMNITY_FIELD_CATEGORIES.reduce((sum, cat) => 
                  sum + cat.fields.filter(f => f.required).length, 0
                )}
              </div>
            </div>
            <div>
              <div className="font-medium">Nested Fields</div>
              <div className="text-gray-600">
                {HOSPITAL_INDEMNITY_FIELD_CATEGORIES.reduce((sum, cat) => 
                  sum + cat.fields.filter(f => f.nested).length, 0
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
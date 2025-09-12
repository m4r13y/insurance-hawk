import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FieldMappingTableProps } from './types';
import { generateFieldMappings } from './utils';

export default function FieldMappingTable({ quote, quotes }: FieldMappingTableProps) {
  const fieldMappings = generateFieldMappings(quote, quotes);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Mapping Analysis</CardTitle>
        <p className="text-sm text-gray-600">
          Detailed breakdown of all fields in the dental insurance quote structure
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-auto">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-medium w-32">Field Name</th>
                <th className="text-left p-3 font-medium">Raw Value</th>
                <th className="text-left p-3 font-medium w-24">Data Type</th>
                <th className="text-left p-3 font-medium">Formatted Value</th>
                <th className="text-left p-3 font-medium w-48">Notes</th>
              </tr>
            </thead>
            <tbody>
              {fieldMappings.map((mapping, index) => (
                <tr key={mapping.field} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 font-mono text-sm font-medium text-blue-600 align-top">
                    {mapping.field}
                  </td>
                  <td className="p-3 font-mono text-sm align-top">
                    {mapping.field === 'benefitNotes' || mapping.field === 'limitationNotes' ? (
                      <div className="min-w-0">
                        <div 
                          className="text-xs bg-gray-50 p-3 rounded border prose prose-xs max-w-none"
                          dangerouslySetInnerHTML={{ __html: String(mapping.rawValue) }}
                        />
                      </div>
                    ) : (
                      <div className="max-w-xs overflow-hidden">
                        <div className="truncate" title={String(mapping.rawValue)}>
                          {String(mapping.rawValue)}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="p-3 align-top">
                    <Badge variant="outline" className="text-xs">
                      {mapping.type}
                    </Badge>
                  </td>
                  <td className="p-3 font-medium align-top">
                    {mapping.field === 'benefitNotes' || mapping.field === 'limitationNotes' ? (
                      <div className="min-w-0">
                        <div 
                          className="text-xs bg-blue-50 p-3 rounded border prose prose-xs max-w-none"
                          dangerouslySetInnerHTML={{ __html: mapping.formattedValue }}
                        />
                      </div>
                    ) : (
                      mapping.formattedValue
                    )}
                  </td>
                  <td className="p-3 text-sm text-gray-600 align-top">
                    {mapping.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

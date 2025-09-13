import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDownIcon, ChevronRightIcon, CopyIcon } from '@radix-ui/react-icons';
import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';

interface RawDataInspectorProps {
  quote: OptimizedHospitalIndemnityQuote;
}

export function RawDataInspector({ quote }: RawDataInspectorProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    basePlans: false,
    riders: false,
    fullData: false
  });

  const [copiedField, setCopiedField] = useState<string>('');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const formatJsonData = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  const renderCopyButton = (data: any, fieldName: string) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0"
      onClick={() => copyToClipboard(formatJsonData(data), fieldName)}
    >
      <CopyIcon className="h-3 w-3" />
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raw Data Inspector</CardTitle>
        <p className="text-sm text-gray-600">
          Inspect the raw structure and content of the hospital indemnity quote data
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quote Overview */}
        <Collapsible open={expandedSections.overview} onOpenChange={() => toggleSection('overview')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <h4 className="font-medium">Quote Overview</h4>
              {expandedSections.overview ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Basic Information</span>
                    {renderCopyButton({
                      id: quote.id,
                      planName: quote.planName,
                      age: quote.age,
                      gender: quote.gender,
                      state: quote.state,
                      tobacco: quote.tobacco
                    }, 'basic')}
                  </div>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{formatJsonData({
  id: quote.id,
  planName: quote.planName,
  age: quote.age,
  gender: quote.gender,
  state: quote.state,
  tobacco: quote.tobacco
})}
                  </pre>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pricing Information</span>
                    {renderCopyButton({
                      monthlyPremium: quote.monthlyPremium,
                      policyFee: quote.policyFee,
                      hhDiscount: quote.hhDiscount
                    }, 'pricing')}
                  </div>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{formatJsonData({
  monthlyPremium: quote.monthlyPremium,
  policyFee: quote.policyFee,
  hhDiscount: quote.hhDiscount
})}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Company Information</span>
                  {renderCopyButton({
                    companyName: quote.companyName,
                    companyFullName: quote.companyFullName,
                    ambest: quote.ambest
                  }, 'company')}
                </div>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{formatJsonData({
  companyName: quote.companyName,
  companyFullName: quote.companyFullName,
  ambest: quote.ambest
})}
                </pre>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Base Plans Data */}
        <Collapsible open={expandedSections.basePlans} onOpenChange={() => toggleSection('basePlans')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <h4 className="font-medium">Base Plans Data ({quote.basePlans.length})</h4>
              {expandedSections.basePlans ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 space-y-4">
              {quote.basePlans.slice(0, 3).map((plan, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{plan.name}</span>
                    {renderCopyButton(plan, `basePlan-${index}`)}
                  </div>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-60">
                    {formatJsonData(plan)}
                  </pre>
                </div>
              ))}
              
              {quote.basePlans.length > 3 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allBasePlans = quote.basePlans;
                      copyToClipboard(formatJsonData(allBasePlans), 'allBasePlans');
                    }}
                  >
                    Copy All Base Plans ({quote.basePlans.length})
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Riders Data */}
        <Collapsible open={expandedSections.riders} onOpenChange={() => toggleSection('riders')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <h4 className="font-medium">Riders Data ({quote.riders.length})</h4>
              {expandedSections.riders ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 space-y-4">
              {quote.riders.slice(0, 3).map((rider, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{rider.name}</span>
                    {renderCopyButton(rider, `rider-${index}`)}
                  </div>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-60">
                    {formatJsonData(rider)}
                  </pre>
                </div>
              ))}
              
              {quote.riders.length > 3 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allRiders = quote.riders;
                      copyToClipboard(formatJsonData(allRiders), 'allRiders');
                    }}
                  >
                    Copy All Riders ({quote.riders.length})
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Full Quote Data */}
        <Collapsible open={expandedSections.fullData} onOpenChange={() => toggleSection('fullData')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <h4 className="font-medium">Complete Quote Data</h4>
              {expandedSections.fullData ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Full Quote Object</span>
                {renderCopyButton(quote, 'fullQuote')}
              </div>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-96">
                {formatJsonData(quote)}
              </pre>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Copy Status */}
        {copiedField && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">
              ✓ Copied {copiedField} data to clipboard
            </p>
          </div>
        )}

        {/* Data Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Data Structure Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Object Keys:</span>
              <span className="ml-2 font-medium">{Object.keys(quote).length}</span>
            </div>
            <div>
              <span className="text-gray-600">Base Plans:</span>
              <span className="ml-2 font-medium">{quote.basePlans.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Riders:</span>
              <span className="ml-2 font-medium">{quote.riders.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Data Size:</span>
              <span className="ml-2 font-medium">
                {(new Blob([JSON.stringify(quote)]).size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
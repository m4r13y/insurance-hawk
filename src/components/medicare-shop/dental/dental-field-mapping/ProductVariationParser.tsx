import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { OptimizedDentalQuote } from '@/lib/dental-quote-optimizer';
import { 
  groupQuotesByAnnualMaximum, 
  GroupedByAnnualMaximum, 
  ParsedBenefits, 
  ParsedLimitations 
} from './benefit-parser';

interface ProductVariationParserProps {
  productKey: string;
  quotes: OptimizedDentalQuote[];
}

export default function ProductVariationParser({ productKey, quotes }: ProductVariationParserProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [expandedVariations, setExpandedVariations] = useState<Set<string>>(new Set());

  const groupedData = groupQuotesByAnnualMaximum(quotes);

  const toggleGroup = (annualMax: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(annualMax)) {
      newExpanded.delete(annualMax);
    } else {
      newExpanded.add(annualMax);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleVariation = (id: string) => {
    const newExpanded = new Set(expandedVariations);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedVariations(newExpanded);
  };

  const renderBenefitValue = (value: string | { [year: string]: string } | undefined) => {
    if (!value) return 'Not specified';
    
    if (typeof value === 'string') {
      return value;
    }
    
    // Handle year-based coinsurance
    return (
      <div className="space-y-1">
        {Object.entries(value).map(([year, percentage]) => (
          <div key={year} className="text-xs">
            <span className="font-medium">{year}:</span> {percentage}
          </div>
        ))}
      </div>
    );
  };

  const renderBenefits = (benefits: ParsedBenefits) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Deductible */}
      {benefits.deductible && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">Deductible</h5>
          <div className="text-sm">
            <div className="font-semibold text-green-600">{benefits.deductible.amount}</div>
            {benefits.deductible.details && benefits.deductible.details.map((detail, idx) => (
              <div key={idx} className="text-xs text-gray-600 mt-1">{detail}</div>
            ))}
          </div>
        </div>
      )}

      {/* Preventive Services */}
      {benefits.preventiveServices && (
        <div className="bg-green-50 p-3 rounded-lg">
          <h5 className="font-medium text-green-900 mb-2">Preventive Services</h5>
          <div className="text-sm">
            <div className="font-semibold text-green-600">{benefits.preventiveServices.coverage}</div>
            {benefits.preventiveServices.details && benefits.preventiveServices.details.map((detail, idx) => (
              <div key={idx} className="text-xs text-gray-600 mt-1">{detail}</div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostic Services */}
      {benefits.diagnosticServices && (
        <div className="bg-purple-50 p-3 rounded-lg">
          <h5 className="font-medium text-purple-900 mb-2">Diagnostic Services</h5>
          <div className="text-sm">
            <div className="font-semibold text-purple-600">{benefits.diagnosticServices.coinsurance}</div>
            {benefits.diagnosticServices.waitingPeriod && (
              <div className="text-xs text-gray-600">Waiting Period: {benefits.diagnosticServices.waitingPeriod}</div>
            )}
            {benefits.diagnosticServices.details && benefits.diagnosticServices.details.map((detail, idx) => (
              <div key={idx} className="text-xs text-gray-600 mt-1">{detail}</div>
            ))}
          </div>
        </div>
      )}

      {/* Basic Services */}
      {benefits.basicServices && (
        <div className="bg-yellow-50 p-3 rounded-lg">
          <h5 className="font-medium text-yellow-900 mb-2">Basic Services</h5>
          <div className="text-sm">
            <div className="font-semibold text-yellow-700">
              {renderBenefitValue(benefits.basicServices.coinsurance)}
            </div>
            {benefits.basicServices.waitingPeriod && (
              <div className="text-xs text-gray-600">Waiting Period: {benefits.basicServices.waitingPeriod}</div>
            )}
            {benefits.basicServices.details && benefits.basicServices.details.map((detail, idx) => (
              <div key={idx} className="text-xs text-gray-600 mt-1">{detail}</div>
            ))}
          </div>
        </div>
      )}

      {/* Major Services */}
      {benefits.majorServices && (
        <div className="bg-red-50 p-3 rounded-lg">
          <h5 className="font-medium text-red-900 mb-2">Major Services</h5>
          <div className="text-sm">
            <div className="font-semibold text-red-700">
              {renderBenefitValue(benefits.majorServices.coinsurance)}
            </div>
            {benefits.majorServices.waitingPeriod && (
              <div className="text-xs text-gray-600">Waiting Period: {benefits.majorServices.waitingPeriod}</div>
            )}
            {benefits.majorServices.details && benefits.majorServices.details.map((detail, idx) => (
              <div key={idx} className="text-xs text-gray-600 mt-1">{detail}</div>
            ))}
          </div>
        </div>
      )}

      {/* Vision */}
      {benefits.vision && (
        <div className="bg-indigo-50 p-3 rounded-lg">
          <h5 className="font-medium text-indigo-900 mb-2">Vision</h5>
          <div className="text-sm space-y-1">
            {benefits.vision.coinsurance && (
              <div>
                <span className="text-xs text-gray-600">Coinsurance:</span>
                <div className="font-semibold text-indigo-700">
                  {renderBenefitValue(benefits.vision.coinsurance)}
                </div>
              </div>
            )}
            {benefits.vision.maximum && (
              <div className="text-xs">
                <span className="text-gray-600">Maximum:</span> 
                <span className="font-semibold text-green-600 ml-1">{benefits.vision.maximum}</span>
              </div>
            )}
            {benefits.vision.benefit && (
              <div className="text-xs text-gray-600">{benefits.vision.benefit}</div>
            )}
          </div>
        </div>
      )}

      {/* Hearing */}
      {benefits.hearing && (
        <div className="bg-pink-50 p-3 rounded-lg">
          <h5 className="font-medium text-pink-900 mb-2">Hearing</h5>
          <div className="text-sm space-y-1">
            {benefits.hearing.coinsurance && (
              <div>
                <span className="text-xs text-gray-600">Coinsurance:</span>
                <div className="font-semibold text-pink-700">
                  {renderBenefitValue(benefits.hearing.coinsurance)}
                </div>
              </div>
            )}
            {benefits.hearing.maximum && (
              <div className="text-xs">
                <span className="text-gray-600">Maximum:</span> 
                <span className="font-semibold text-green-600 ml-1">{benefits.hearing.maximum}</span>
              </div>
            )}
            {benefits.hearing.benefit && (
              <div className="text-xs text-gray-600">{benefits.hearing.benefit}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderLimitations = (limitations: ParsedLimitations) => (
    <div className="space-y-3">
      {/* General Limitations */}
      {limitations.general && limitations.general.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">General Limitations</h5>
          <ul className="text-sm space-y-1">
            {limitations.general.map((limitation, idx) => (
              <li key={idx} className="text-gray-700">• {limitation}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Implant Limitations */}
      {limitations.implants && (
        <div className="bg-orange-50 p-3 rounded-lg">
          <h5 className="font-medium text-orange-900 mb-2">Implant Limitations</h5>
          <div className="text-sm">
            {limitations.implants.maximum && (
              <div className="font-semibold text-orange-700 mb-1">
                Maximum: {limitations.implants.maximum}
              </div>
            )}
            {limitations.implants.details && limitations.implants.details.map((detail, idx) => (
              <div key={idx} className="text-gray-700">• {detail}</div>
            ))}
          </div>
        </div>
      )}

      {/* PPO Information */}
      {limitations.ppoInfo && limitations.ppoInfo.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">PPO Information</h5>
          <ul className="text-sm space-y-1">
            {limitations.ppoInfo.map((info, idx) => (
              <li key={idx} className="text-gray-700">• {info}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Variation Analysis: {productKey}</CardTitle>
        <p className="text-sm text-gray-600">
          Grouped by Annual Maximum with parsed benefit structures
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {groupedData.map((group) => (
            <div key={group.annualMaximum} className="border rounded-lg">
              <Collapsible 
                open={expandedGroups.has(group.annualMaximum)}
                onOpenChange={() => toggleGroup(group.annualMaximum)}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-4 h-auto"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {expandedGroups.has(group.annualMaximum) ? 
                          <ChevronDownIcon className="h-4 w-4" /> : 
                          <ChevronRightIcon className="h-4 w-4" />
                        }
                        <span className="font-semibold">
                          Annual Maximum: ${group.annualMaximum.toLocaleString()}
                        </span>
                      </div>
                      <Badge variant="secondary">
                        {group.variations.length} variation{group.variations.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Premium Range: ${Math.min(...group.variations.map(v => v.monthlyPremium)).toFixed(2)} - 
                      ${Math.max(...group.variations.map(v => v.monthlyPremium)).toFixed(2)}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="p-4 pt-0 space-y-4">
                    {group.variations.map((variation) => (
                      <div key={variation.id} className="border rounded-lg bg-gray-50">
                        <Collapsible 
                          open={expandedVariations.has(variation.id)}
                          onOpenChange={() => toggleVariation(variation.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-between p-3 h-auto"
                            >
                              <div className="flex items-center gap-2">
                                {expandedVariations.has(variation.id) ? 
                                  <ChevronDownIcon className="h-4 w-4" /> : 
                                  <ChevronRightIcon className="h-4 w-4" />
                                }
                                <span className="font-mono text-sm">{variation.id}</span>
                                <Badge variant="outline">
                                  ${variation.monthlyPremium.toFixed(2)}/mo
                                </Badge>
                              </div>
                            </Button>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <div className="p-3 pt-0">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Benefits */}
                                <div>
                                  <h4 className="font-medium text-green-800 mb-3">Benefits</h4>
                                  {renderBenefits(variation.parsedBenefits)}
                                </div>
                                
                                {/* Limitations */}
                                <div>
                                  <h4 className="font-medium text-red-800 mb-3">Limitations</h4>
                                  {renderLimitations(variation.parsedLimitations)}
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

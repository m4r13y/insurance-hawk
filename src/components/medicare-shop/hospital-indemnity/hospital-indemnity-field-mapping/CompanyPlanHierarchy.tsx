import React, { useState } from 'react';
import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompanyPlanHierarchyProps {
  quotes: OptimizedHospitalIndemnityQuote[];
}

export function CompanyPlanHierarchy({ quotes }: CompanyPlanHierarchyProps) {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [expandedQuotes, setExpandedQuotes] = useState<Set<string>>(new Set());

  const toggleCompany = (company: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(company)) {
      newExpanded.delete(company);
    } else {
      newExpanded.add(company);
    }
    setExpandedCompanies(newExpanded);
  };

  const togglePlan = (planKey: string) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(planKey)) {
      newExpanded.delete(planKey);
    } else {
      newExpanded.add(planKey);
    }
    setExpandedPlans(newExpanded);
  };

  const toggleQuote = (quoteId: string) => {
    const newExpanded = new Set(expandedQuotes);
    if (newExpanded.has(quoteId)) {
      newExpanded.delete(quoteId);
    } else {
      newExpanded.add(quoteId);
    }
    setExpandedQuotes(newExpanded);
  };

  // Group quotes by company
  const companiesMap = new Map<string, OptimizedHospitalIndemnityQuote[]>();
  
  quotes.forEach(quote => {
    const company = quote.companyFullName || quote.companyName || 'Unknown Carrier';
    if (!companiesMap.has(company)) {
      companiesMap.set(company, []);
    }
    companiesMap.get(company)!.push(quote);
  });

  // Convert to array and sort
  const companies = Array.from(companiesMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company & Plan Structure Overview</CardTitle>
        <p className="text-sm text-gray-600">
          Expandable hierarchy showing companies → base plans → plan names from the data. Click the arrows to expand each level.
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setExpandedCompanies(new Set(companies.map(([company]) => company)))}
            className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Expand All Companies
          </button>
          <button
            onClick={() => {
              const allPlanKeys: string[] = [];
              companies.forEach(([company, companyQuotes]) => {
                const plansMap = new Map<string, OptimizedHospitalIndemnityQuote[]>();
                companyQuotes.forEach(quote => {
                  const basePlan = quote.planName || 'Unknown Plan';
                  if (!plansMap.has(basePlan)) {
                    plansMap.set(basePlan, []);
                  }
                  plansMap.get(basePlan)!.push(quote);
                });
                Array.from(plansMap.keys()).forEach(planName => {
                  allPlanKeys.push(`${company}-${planName}`);
                });
              });
              setExpandedCompanies(new Set(companies.map(([company]) => company)));
              setExpandedPlans(new Set(allPlanKeys));
            }}
            className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Expand All Plans
          </button>
          <button
            onClick={() => {
              setExpandedCompanies(new Set());
              setExpandedPlans(new Set());
              setExpandedQuotes(new Set());
            }}
            className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Collapse All
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companies.map(([company, companyQuotes]) => {
            const isCompanyExpanded = expandedCompanies.has(company);
            
            return (
              <div key={company} className="border border-gray-200 rounded-lg">
                {/* Company Header */}
                <div 
                  className="flex items-center justify-between p-3 bg-blue-50 cursor-pointer hover:bg-blue-100 rounded-t-lg"
                  onClick={() => toggleCompany(company)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {isCompanyExpanded ? '▼' : '▶'}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">{company}</h3>
                  </div>
                  <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                    {companyQuotes.length} quotes
                  </span>
                </div>

                {/* Company Content */}
                {isCompanyExpanded && (
                  <div className="p-3 space-y-3">
                    {(() => {
                      // Group by base plan within each company
                      const plansMap = new Map<string, OptimizedHospitalIndemnityQuote[]>();
                      
                      companyQuotes.forEach(quote => {
                        const basePlan = quote.planName || 'Unknown Plan';
                        if (!plansMap.has(basePlan)) {
                          plansMap.set(basePlan, []);
                        }
                        plansMap.get(basePlan)!.push(quote);
                      });

                      const plans = Array.from(plansMap.entries()).sort(([a], [b]) => a.localeCompare(b));

                      return plans.map(([planName, planQuotes]) => {
                        const planKey = `${company}-${planName}`;
                        const isPlanExpanded = expandedPlans.has(planKey);

                        return (
                          <div key={planKey} className="border border-gray-300 rounded">
                            {/* Plan Header */}
                            <div 
                              className="flex items-center justify-between p-2 bg-gray-50 cursor-pointer hover:bg-gray-100 rounded-t"
                              onClick={() => togglePlan(planKey)}
                            >
                              <div className="flex items-center space-x-2">
                                <span>
                                  {isPlanExpanded ? '▼' : '▶'}
                                </span>
                                <h4 className="font-medium text-gray-800">{planName}</h4>
                              </div>
                              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                {planQuotes.length} variants
                              </span>
                            </div>

                            {/* Plan Content */}
                            {isPlanExpanded && (
                              <div className="p-2 space-y-2">
                                {planQuotes.map((quote) => {
                                  const isQuoteExpanded = expandedQuotes.has(quote.id);

                                  return (
                                    <div key={quote.id} className="border border-gray-200 rounded">
                                      {/* Quote Header */}
                                      <div 
                                        className="flex items-center justify-between p-2 bg-gray-100 cursor-pointer hover:bg-gray-200 rounded-t"
                                        onClick={() => toggleQuote(quote.id)}
                                      >
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm">
                                            {isQuoteExpanded ? '▼' : '▶'}
                                          </span>
                                          <span className="text-sm font-medium">
                                            {(() => {
                                              // Get base amount from first base plan's first benefit option
                                              const baseAmount = quote.basePlans?.[0]?.benefitOptions?.[0]?.amount || 'N/A';
                                              const riderCount = quote.riders?.length || 0;
                                              return `Base: ${baseAmount} | ${riderCount} rider${riderCount !== 1 ? 's' : ''}`;
                                            })()}
                                          </span>
                                          <span className="text-xs text-gray-600">
                                            ${quote.monthlyPremium?.toFixed(2) || 'N/A'}/mo
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {quote.state} | Age {quote.age} | {quote.gender}
                                        </div>
                                      </div>

                                      {/* Quote Details */}
                                      {isQuoteExpanded && (
                                        <div className="p-3 bg-white space-y-3">
                                          {/* Basic Info */}
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div><strong>ID:</strong> {quote.id}</div>
                                            <div><strong>Premium:</strong> ${quote.monthlyPremium?.toFixed(2) || 'N/A'}</div>
                                            <div><strong>State:</strong> {quote.state}</div>
                                            <div><strong>Age:</strong> {quote.age}</div>
                                            <div><strong>Gender:</strong> {quote.gender}</div>
                                            <div><strong>Tobacco:</strong> {quote.tobacco ? 'Yes' : 'No'}</div>
                                          </div>

                                          {/* Main Benefit (Base Plan) */}
                                          {quote.basePlans && quote.basePlans.length > 0 && (
                                            <div>
                                              <h5 className="text-sm font-semibold text-blue-700 mb-2">Main Benefit:</h5>
                                              <div className="space-y-2">
                                                {quote.basePlans.map((basePlan, idx) => (
                                                  <div key={idx} className="bg-blue-50 p-2 rounded text-xs">
                                                    <div className="font-medium">"{basePlan.name}"</div>
                                                    <div className="text-gray-600 mt-1">
                                                      Included: {basePlan.included ? 'Yes' : 'No'} | 
                                                      Options: {basePlan.benefitOptions?.length || 0}
                                                    </div>
                                                    {basePlan.benefitOptions && basePlan.benefitOptions.length > 0 && (
                                                      <div className="mt-1 space-y-1">
                                                        {basePlan.benefitOptions.map((option, optIdx) => (
                                                          <div key={optIdx} className="ml-2 text-gray-700">
                                                            • Amount: "{option.amount}", Rate: ${option.rate}
                                                            {option.quantifier && `, Quantifier: "${option.quantifier}"`}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                    {basePlan.notes && (
                                                      <div className="mt-1 text-gray-500">
                                                        Notes: {basePlan.notes}
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Additional Riders */}
                                          {quote.riders && quote.riders.length > 0 && (
                                            <div>
                                              <h5 className="text-sm font-semibold text-green-700 mb-2">Additional Riders:</h5>
                                              <div className="space-y-2">
                                                {quote.riders.map((rider, idx) => (
                                                  <div key={idx} className="bg-green-50 p-2 rounded text-xs">
                                                    <div className="font-medium">"{rider.name}"</div>
                                                    <div className="text-gray-600 mt-1">
                                                      Included: {rider.included ? 'Yes' : 'No'} | 
                                                      Options: {rider.benefitOptions?.length || 0}
                                                    </div>
                                                    {rider.benefitOptions && rider.benefitOptions.length > 0 && (
                                                      <div className="mt-1 space-y-1">
                                                        {rider.benefitOptions.map((option, optIdx) => (
                                                          <div key={optIdx} className="ml-2 text-gray-700">
                                                            • Amount: "{option.amount}", Rate: ${option.rate}
                                                            {option.quantifier && `, Quantifier: "${option.quantifier}"`}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                    {rider.notes && (
                                                      <div className="mt-1 text-gray-500">
                                                        Notes: {rider.notes}
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
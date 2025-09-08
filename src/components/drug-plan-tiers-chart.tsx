"use client";

import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { DrugPlanQuote } from '@/types/drug-plan';

interface DrugPlanTiersChartProps {
  plan: DrugPlanQuote;
  className?: string;
}

interface PharmaTableData {
  tier: string;
  tierType: string;
  pharmacyType: string;
  thirtyDay: string;
  sixtyDay: string;
  ninetyDay: string;
}

export default function DrugPlanTiersChart({ plan, className = "" }: DrugPlanTiersChartProps) {
  // Extract prescription drug benefits
  const prescriptionBenefit = plan.benefits?.find(b => 
    b.benefit_type.toLowerCase().includes('outpatient prescription drugs')
  );

  if (!prescriptionBenefit?.full_description) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Prescription Drug Tiers
        </h4>
        <div className="text-center py-4 text-gray-600">
          <div className="text-sm">No Drug Coverage</div>
        </div>
      </div>
    );
  }

  // Parse HTML table structure for pharmaceutical data - same as Medicare Advantage
  const tableData: PharmaTableData[] = [];
  
  // Extract each tier section with its complete HTML
  const tierPattern = /<p><b>Tier (\d+) \(([^)]+)\)<\/b><\/p><table>[\s\S]*?<\/table>/g;
  const tierMatches = [];
  let match;
  while ((match = tierPattern.exec(prescriptionBenefit.full_description)) !== null) {
    tierMatches.push(match);
  }
  
  tierMatches.forEach((tierMatch) => {
    const tierNumber = tierMatch[1];
    const tierType = tierMatch[2];
    const tableHtml = tierMatch[0];
    
    // Extract table rows from the HTML
    const rowPattern = /<tr><td>([^<]+?):<\/td><td>([^<]*?)<\/td><td>([^<]*?)<\/td><td>([^<]*?)<\/td><\/tr>/g;
    const rowMatches = [];
    let rowMatch;
    while ((rowMatch = rowPattern.exec(tableHtml)) !== null) {
      rowMatches.push(rowMatch);
    }
    
    // If no matches with the above pattern, try manual parsing
    if (rowMatches.length === 0) {
      const trSections = tableHtml.split('<tr>').slice(1);
      trSections.forEach(trSection => {
        const trContent = trSection.split('</tr>')[0];
        const tdMatches = trContent.match(/<td>([^<]*?)<\/td>/g);
        if (tdMatches && tdMatches.length >= 4) {
          const cells = tdMatches.map(td => td.replace(/<\/?td>/g, ''));
          if (cells[0].includes(':')) {
            tableData.push({
              tier: `Tier ${tierNumber}`,
              tierType: tierType,
              pharmacyType: cells[0].replace(':', ''),
              thirtyDay: cells[1] || 'N/A',
              sixtyDay: cells[2] || 'N/A',
              ninetyDay: cells[3] || 'N/A'
            });
          }
        }
      });
    } else {
      rowMatches.forEach(rowMatch => {
        tableData.push({
          tier: `Tier ${tierNumber}`,
          tierType: tierType,
          pharmacyType: rowMatch[1],
          thirtyDay: rowMatch[2] || 'N/A',
          sixtyDay: rowMatch[3] || 'N/A',
          ninetyDay: rowMatch[4] || 'N/A'
        });
      });
    }
  });
  
  if (tableData.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Prescription Drug Tiers
        </h4>
        <div className="text-center py-4 text-gray-600">
          <div className="text-sm">No Prescription Data Available</div>
        </div>
      </div>
    );
  }

  // Group data by tier for better display
  const tierGroups = tableData.reduce((acc, item) => {
    if (!acc[item.tier]) acc[item.tier] = [];
    acc[item.tier].push(item);
    return acc;
  }, {} as Record<string, PharmaTableData[]>);
  
  // Convert to array for easier navigation
  const tierEntries = Object.entries(tierGroups);
  
  // Check if all values across all tiers are "Not Covered"
  const allNotCovered = tierEntries.every(([_, tierData]) => 
    tierData.every(row => 
      (row.thirtyDay === 'Not Supported' || row.thirtyDay === 'Not Covered') &&
      (row.sixtyDay === 'Not Supported' || row.sixtyDay === 'Not Covered') &&
      (row.ninetyDay === 'Not Supported' || row.ninetyDay === 'Not Covered')
    )
  );
  
  // If all values are not covered, show simple message
  if (allNotCovered) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Prescription Drug Tiers
        </h4>
        <div className="text-center py-4 text-gray-600">
          <div className="text-sm font-medium">No Drug Coverage</div>
        </div>
      </div>
    );
  }

  // Create the carousel component (matching Medicare Advantage exactly)
  const PharmacyCarousel = () => {
    const [currentTierIndex, setCurrentTierIndex] = useState(0);
    
    const nextTier = () => {
      setCurrentTierIndex((prev) => (prev + 1) % tierEntries.length);
    };
    
    const prevTier = () => {
      setCurrentTierIndex((prev) => (prev - 1 + tierEntries.length) % tierEntries.length);
    };
    
    if (tierEntries.length === 0) return null;
    
    const [currentTier, currentData] = tierEntries[currentTierIndex];
    
    return (
      <div className="space-y-3">
        {/* Carousel Header with Navigation - Compact Row */}
        <div className="bg-blue-50 px-3 py-2 rounded-lg flex items-center justify-between gap-2 min-w-80 w-fit">
          <div className="font-semibold text-sm">
            {currentTier} ({currentData[0].tierType})
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevTier}
              disabled={tierEntries.length <= 1}
              className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous tier"
            >
              <FaChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={nextTier}
              disabled={tierEntries.length <= 1}
              className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next tier"
            >
              <FaChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        {/* Current Tier Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-2 py-1 text-left font-medium">Pharmacy Type</th>
                  <th className="border border-gray-300 px-2 py-1 text-center font-medium">30 Days</th>
                  <th className="border border-gray-300 px-2 py-1 text-center font-medium">60 Days</th>
                  <th className="border border-gray-300 px-2 py-1 text-center font-medium">90 Days</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-2 py-1 font-medium">{row.pharmacyType}</td>
                    <td className="border border-gray-300 px-2 py-1 text-center text-green-700 font-semibold">
                      {row.thirtyDay}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center text-green-700 font-semibold">
                      {row.sixtyDay}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center text-green-700 font-semibold">
                      {row.ninetyDay}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Tier navigation dots */}
        <div className="flex justify-center gap-1">
          {tierEntries.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTierIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentTierIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              title={`Tier ${index + 1}`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-2">
            {currentTierIndex + 1} of {tierEntries.length} tiers
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-900 mb-3">
        Prescription Drug Tiers
      </h4>
      <PharmacyCarousel />
    </div>
  );
}

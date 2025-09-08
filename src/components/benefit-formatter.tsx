import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { PharmaTableData } from '@/types/medicare-advantage';

// Helper function to format benefit descriptions with bold dollar values, percentages, ranges and line breaks
export const formatBenefitText = (text: string): React.ReactNode => {
  if (!text) return 'Not Available';
  
  // Add debugging for pharmaceutical data
  console.log('formatBenefitText called with:', text.substring(0, 200) + '...');
  
  // Check if this looks like pharmaceutical/prescription drug data BEFORE cleaning HTML
  const isPharmaData = text.includes('Tier ') && text.includes('<table>');
  console.log('isPharmaData:', isPharmaData, 'has Tier:', text.includes('Tier '), 'has table:', text.includes('<table>'));
  
  if (isPharmaData) {
    console.log('Detected pharmaceutical data, parsing...');
    
    // Test with a small sample first to verify parsing logic
    const testHtml = `<p><b>Tier 1 (Preferred Generic)</b></p><table><th><b>Pharmacy Type</b></th><th><b>30 Days Supply</b></th><th><b>60 Days Supply</b></th><th><b>90 Days Supply</b></th><tr><td>Standard Retail:</td><td>$2</td><td>Not Supported</td><td>$6</td></tr></table>`;
    console.log('Testing parsing with sample HTML...');
    
    // Test regex on sample
    const testPattern = /<p><b>Tier (\d+) \(([^)]+)\)<\/b><\/p><table>[\s\S]*?<\/table>/g;
    const testMatch = testPattern.exec(testHtml);
    if (testMatch) {
      console.log('✅ Test regex matched sample HTML');
      console.log('Tier:', testMatch[1], 'Type:', testMatch[2]);
      
      // Test row parsing
      const testRowPattern = /<tr><td>([^<]+?):<\/td><td>([^<]*?)<\/td><td>([^<]*?)<\/td><td>([^<]*?)<\/td><\/tr>/g;
      const testRowMatch = testRowPattern.exec(testMatch[0]);
      if (testRowMatch) {
        console.log('✅ Test row parsing successful:', testRowMatch[1], '|', testRowMatch[2], '|', testRowMatch[3], '|', testRowMatch[4]);
      } else {
        console.log('❌ Test row parsing failed');
      }
    } else {
      console.log('❌ Test regex failed on sample HTML');
    }
    
    // Parse HTML table structure for pharmaceutical data - use original text with HTML
    const tableData: PharmaTableData[] = [];
    
    // First, let's extract each tier section with its complete HTML
    const tierPattern = /<p><b>Tier (\d+) \(([^)]+)\)<\/b><\/p><table>[\s\S]*?<\/table>/g;
    const tierMatches = [];
    let match;
    while ((match = tierPattern.exec(text)) !== null) {
      tierMatches.push(match);
    }
    
    console.log('Tier matches found:', tierMatches.length);
    console.log('Raw text length:', text.length);
    console.log('First 1000 chars of text:', text.substring(0, 1000));
    
    tierMatches.forEach((tierMatch, index) => {
      const tierNumber = tierMatch[1];
      const tierType = tierMatch[2];
      const tableHtml = tierMatch[0];
      
      console.log(`Processing Tier ${tierNumber} (${tierType})`);
      console.log('Table HTML:', tableHtml.substring(0, 500));
      
      // Extract table rows from the HTML - looking for pattern like:
      // <tr><td>Standard Retail:</td><td>$2</td><td>Not Supported</td><td>$6</td></tr>
      const rowPattern = /<tr><td>([^<]+?):<\/td><td>([^<]*?)<\/td><td>([^<]*?)<\/td><td>([^<]*?)<\/td><\/tr>/g;
      const rowMatches = [];
      let rowMatch;
      while ((rowMatch = rowPattern.exec(tableHtml)) !== null) {
        rowMatches.push(rowMatch);
        console.log(`Row found: ${rowMatch[1]} | ${rowMatch[2]} | ${rowMatch[3]} | ${rowMatch[4]}`);
      }
      
      console.log(`Found ${rowMatches.length} rows for Tier ${tierNumber}`);
      
      // If no matches with the above pattern, try a simpler approach
      if (rowMatches.length === 0) {
        console.log('No rows found with regex, trying manual parsing...');
        // Split the table HTML by <tr> tags and process each row
        const trSections = tableHtml.split('<tr>').slice(1); // Skip first empty section
        trSections.forEach(trSection => {
          const trContent = trSection.split('</tr>')[0];
          const tdMatches = trContent.match(/<td>([^<]*?)<\/td>/g);
          if (tdMatches && tdMatches.length >= 4) {
            const cells = tdMatches.map(td => td.replace(/<\/?td>/g, ''));
            console.log('Manually parsed row:', cells);
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
    
    console.log('Final parsed pharmaceutical data:', tableData);
    
    if (tableData.length > 0) {
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
          <div className="text-center py-4 text-gray-600">
            <div className="text-sm font-medium">No Drug Coverage</div>
          </div>
        );
      }
      
      // Create a carousel component
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
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {row.thirtyDay === 'Not Supported' ? (
                            <span className="text-red-600 text-xs">Not Covered</span>
                          ) : (
                            <span className={`font-semibold ${row.thirtyDay.includes('%') ? 'text-blue-700' : 'text-green-700'}`}>
                              {row.thirtyDay}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {row.sixtyDay === 'Not Supported' ? (
                            <span className="text-red-600 text-xs">Not Covered</span>
                          ) : (
                            <span className={`font-semibold ${row.sixtyDay.includes('%') ? 'text-blue-700' : 'text-green-700'}`}>
                              {row.sixtyDay}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {row.ninetyDay === 'Not Supported' ? (
                            <span className="text-red-600 text-xs">Not Covered</span>
                          ) : (
                            <span className={`font-semibold ${row.ninetyDay.includes('%') ? 'text-blue-700' : 'text-green-700'}`}>
                              {row.ninetyDay}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Tier Indicators */}
            {tierEntries.length > 1 && (
              <div className="relative flex justify-center">
                <div className="flex space-x-2">
                  {tierEntries.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTierIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentTierIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      title={`Go to ${tierEntries[index][0]}`}
                    />
                  ))}
                </div>
                <div className="absolute right-0 text-xs text-gray-600">
                  {currentTierIndex + 1} of {tierEntries.length} tiers
                </div>
              </div>
            )}
          </div>
        );
      };

      return (
        <div className="space-y-4">
          <PharmacyCarousel />
        </div>
      );
    } else {
      // If parsing failed, show debug info
      return (
        <div className="space-y-2">
          <div className="p-3 border border-yellow-300 bg-yellow-50 rounded">
            <strong>Pharmaceutical Data Parsing Failed</strong>
            <p className="text-sm mt-1">Could not parse tier data from HTML structure.</p>
          </div>
        </div>
      );
    }
  }
  
  // Clean HTML tags for non-pharmaceutical data
  let cleanText = text.replace(/<[^>]*>/g, '').trim();
  
  // Replace "In and Out-of-network" with "Combined"
  cleanText = cleanText.replace(/In and Out-of-network/gi, 'Combined');
  
  // Add line breaks before dollar amounts that follow text or numbers, but not before network types
  cleanText = cleanText.replace(/([a-zA-Z0-9])\s*(\$[\d,]+)(?!\s*(In-network|Out-of-network))/gi, '$1\n$2');
  
  // Add line breaks between different dollar amounts with network types
  cleanText = cleanText.replace(/(\$[\d,]+\s*(?:In-network|Out-of-network|Combined))\s*(\$[\d,]+)/gi, '$1\n$2');
  
  // Split by periods and filter out empty strings
  const sentences = cleanText.split('.').filter(sentence => sentence.trim().length > 0);
  
  return (
    <div className="space-y-1">
      {sentences.map((sentence, index) => {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) return null;
        
        // Split by newlines first to handle our custom line breaks
        const lines = trimmedSentence.split('\n');
        
        return (
          <div key={index} className="leading-relaxed space-y-1">
            {lines.map((line, lineIndex) => {
              if (!line.trim()) return null;
              
              // Enhanced regex to match:
              // - Dollar amounts: $0, $15, $1,500.00
              // - Dollar ranges: $0-$50, $10-$100, $0-200 (without second $)
              // - Percentages: 20%, 0%, 100%
              // - Percentage ranges: 0-20%, 10-50%, 0 - 50% (with spaces)
              const parts = line.split(/(\$[\d,]+(?:\.\d{2})?(?:\s*-\s*(?:\$)?[\d,]+(?:\.\d{2})?)?|\d+\s*-?\s*\d*%|\d+%)/g);
              
              return (
                <div key={lineIndex}>
                  {parts.map((part, partIndex) => {
                    // Check if this part is a dollar amount, dollar range, percentage, or percentage range
                    if (/^(\$[\d,]+(?:\.\d{2})?(?:\s*-\s*(?:\$)?[\d,]+(?:\.\d{2})?)?|\d+\s*-\s*\d*%|\d+%)$/.test(part)) {
                      return <strong key={partIndex} className="font-semibold text-green-700">{part}</strong>;
                    }
                    return part;
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

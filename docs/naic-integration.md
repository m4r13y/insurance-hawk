# NAIC Carrier Integration

This implementation provides a comprehensive system for working with NAIC (National Association of Insurance Commissioners) carrier data in The Insurance Hawk app.

## Overview

The NAIC carrier system enables:
1. **Quote Filtering**: Automatically filter quote results to only show carriers with valid NAIC codes
2. **Logo Integration**: Automatic logo URL generation using Clearbit's logo API
3. **Carrier Information**: Access to comprehensive carrier details including contact information
4. **Data Consistency**: Standardized carrier information across the application

## Files Structure

```
src/
├── lib/
│   ├── naic-carriers.ts     # Core NAIC carrier data and utilities
│   └── carriers.ts          # Enhanced carrier utilities with NAIC integration
├── types/
│   └── index.ts            # NAICCarrier interface definition
└── docs/
    └── naic-reference.md   # Human-readable carrier reference
```

## Usage Examples

### 1. Filter Quote Results by Valid NAIC Codes

```typescript
import { filterQuotesByValidNaicCodes } from '@/lib/naic-carriers';

// Example quote data structure
interface Quote {
  id: string;
  planName: string;
  premium: number;
  naicCode?: string;
  carrierName?: string;
}

const rawQuotes: Quote[] = [
  { id: "1", planName: "Plan A", premium: 100, naicCode: "72052", carrierName: "AETNA HEALTH" },
  { id: "2", planName: "Plan B", premium: 150, naicCode: "99999", carrierName: "Unknown Carrier" },
  { id: "3", planName: "Plan C", premium: 120, naicCode: "60054", carrierName: "AETNA LIFE" }
];

// Filter to only include quotes with valid NAIC codes
const validQuotes = filterQuotesByValidNaicCodes(rawQuotes);
// Result: Only quotes with naicCode "72052" and "60054" will be included
```

### 2. Enhance Quotes with Carrier Information

```typescript
import { enhanceQuotesWithCarrierData } from '@/lib/carriers';

const enhancedQuotes = enhanceQuotesWithCarrierData(rawQuotes);

enhancedQuotes.forEach(quote => {
  if (quote.carrierInfo) {
    console.log(`Carrier: ${quote.carrierInfo.name}`);
    console.log(`Logo: ${quote.carrierInfo.logoUrl}`);
    console.log(`Phone: ${quote.carrierInfo.phone}`);
  }
});
```

### 3. Get Carrier Logo URLs

```typescript
import { getCarrierLogoUrl } from '@/lib/naic-carriers';

// Get logo URL for a specific NAIC code
const logoUrl = getCarrierLogoUrl("72052"); // Returns Aetna logo URL
```

### 4. Search Carriers

```typescript
import { searchCarriersByName } from '@/lib/naic-carriers';

// Search for carriers by name
const aetnaCarriers = searchCarriersByName("aetna");
const humanaCarriers = searchCarriersByName("humana");
```

### 5. Build Carrier Filter UI

```typescript
import { getAvailableNaicCarriers } from '@/lib/carriers';

const availableCarriers = getAvailableNaicCarriers();

// Use in a React component
function CarrierFilter({ onCarrierSelect }: { onCarrierSelect: (naicCode: string) => void }) {
  return (
    <select onChange={(e) => onCarrierSelect(e.target.value)}>
      <option value="">All Carriers</option>
      {availableCarriers.map(carrier => (
        <option key={carrier.naicCode} value={carrier.naicCode}>
          {carrier.name}
        </option>
      ))}
    </select>
  );
}
```

## Integration with Quote Results Component

Here's how to integrate NAIC filtering into your quote results:

```typescript
import { filterQuotesByValidNaicCodes, getCarrierByNaicCode } from '@/lib/naic-carriers';

function QuoteResults({ quotes }: { quotes: Quote[] }) {
  // Filter quotes to only show valid NAIC carriers
  const validQuotes = filterQuotesByValidNaicCodes(quotes);
  
  return (
    <div className="quote-results">
      {validQuotes.map(quote => {
        const carrier = getCarrierByNaicCode(quote.naicCode!);
        
        return (
          <div key={quote.id} className="quote-card">
            <div className="carrier-info">
              {carrier?.logoUrl && (
                <img 
                  src={carrier.logoUrl} 
                  alt={carrier.shortName}
                  className="carrier-logo"
                  onError={(e) => {
                    // Fallback to website favicon
                    e.currentTarget.src = `${carrier.website}/favicon.ico`;
                  }}
                />
              )}
              <h3>{carrier?.shortName || quote.carrierName}</h3>
            </div>
            <div className="plan-details">
              <h4>{quote.planName}</h4>
              <p className="premium">${quote.premium}/month</p>
            </div>
            <div className="carrier-contact">
              {carrier?.phone && <p>📞 {carrier.phone}</p>}
              {carrier?.website && (
                <a href={carrier.website} target="_blank" rel="noopener noreferrer">
                  Visit Website
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

## Data Structure

### NAICCarrier Interface

```typescript
interface NAICCarrier {
  carrierId: string;       // Unique carrier identifier
  carrierName: string;     // Full legal carrier name
  naicCode: string;        // NAIC regulatory code (used for filtering)
  phone: string;           // Carrier contact phone
  website: string;         // Carrier website URL
  shortName: string;       // Display-friendly short name
  logoUrl?: string;        // Generated Clearbit logo URL
}
```

## Logo URL Generation

Logo URLs are automatically generated using Clearbit's logo API:
- Format: `https://logo.clearbit.com/{domain}`
- Fallback: Website favicon (`{website}/favicon.ico`)
- The system intelligently extracts the primary domain from carrier websites

## Benefits

1. **Automatic Filtering**: Only display quotes from verified, licensed carriers
2. **Consistent Branding**: Standardized logo display across the application
3. **Rich Carrier Data**: Access to carrier contact information and websites
4. **Performance**: Pre-built maps for O(1) lookups by NAIC code or carrier ID
5. **Maintainability**: Centralized carrier data that's easy to update

## Maintenance

To update carrier information:
1. Edit the `naicCarriers` array in `src/lib/naic-carriers.ts`
2. Update the markdown documentation in `docs/naic-reference.md` if needed
3. Logo URLs will automatically update based on website changes

The system is designed to be self-maintaining with minimal manual intervention required.

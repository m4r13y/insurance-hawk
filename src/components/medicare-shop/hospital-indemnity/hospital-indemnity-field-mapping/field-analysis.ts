/**
 * Hospital Indemnity Field Mapping Analysis
 * Based on complete 1767-line quote structure analysis
 */

export interface HospitalIndemnityFieldCategory {
  category: string;
  description: string;
  fields: FieldMapping[];
  complexity: 'simple' | 'moderate' | 'complex';
  notes?: string;
}

export interface FieldMapping {
  originalField: string;
  mappedField: string;
  dataType: string;
  description: string;
  sampleValue?: any;
  required: boolean;
  nested?: boolean;
  arrayType?: boolean;
}

/**
 * Complete Hospital Indemnity Quote Field Structure Analysis
 * 
 * STRUCTURE OVERVIEW:
 * - Total Lines: 1767
 * - Core Fields: 18 top-level fields
 * - Base Plans: 1 plan with 27 benefit amount options
 * - Optional Riders: 11 different rider types
 * - Included Riders: 7 core benefit types (rate=0, automatically included)
 * - Benefit Options: 400+ individual benefit configurations
 * - Company Data: Multi-level company information with parent company details
 * 
 * KEY INSIGHTS:
 * - Benefit Days are VARIABLE per plan (similar to dental annual maximums)
 * - Plan names like "07 Benefit Days" indicate 7-day coverage periods
 * - Different plans can have 3, 7, 14, 30+ day configurations
 * - This affects all included rider benefit calculations and limits
 */

export const HOSPITAL_INDEMNITY_FIELD_CATEGORIES: HospitalIndemnityFieldCategory[] = [
  // 1. CORE QUOTE INFORMATION
  {
    category: "Core Quote Information",
    description: "Basic quote identification and customer details",
    complexity: "simple",
    fields: [
      {
        originalField: "key",
        mappedField: "id",
        dataType: "string",
        description: "Unique quote identifier (Base64 encoded key)",
        sampleValue: "agZjc2dhcGlyIwsSFkhvc3BpdGFsSW5kZW1uaXR5UXVvdGUYgICc2tTbrQgMogESaG9zcGl0YWxfaW5kZW1uaXR5",
        required: true
      },
      {
        originalField: "age",
        mappedField: "age",
        dataType: "number",
        description: "Applicant age",
        sampleValue: 45,
        required: true
      },
      {
        originalField: "gender",
        mappedField: "gender",
        dataType: "string",
        description: "Applicant gender (M/F)",
        sampleValue: "M",
        required: true
      },
      {
        originalField: "state",
        mappedField: "state",
        dataType: "string",
        description: "State abbreviation",
        sampleValue: "TX",
        required: true
      },
      {
        originalField: "tobacco",
        mappedField: "tobacco",
        dataType: "boolean",
        description: "Tobacco usage status",
        sampleValue: false,
        required: true
      },
      {
        originalField: "plan_name",
        mappedField: "planName",
        dataType: "string",
        description: "Plan name identifier - contains variable benefit days (e.g., '07 Benefit Days', '14 Benefit Days')",
        sampleValue: "07 Benefit Days",
        required: true,
        nested: false,
        arrayType: false
      }
    ]
  },

  // 2. DATES AND METADATA
  {
    category: "Dates and Metadata",
    description: "Quote timing and administrative information",
    complexity: "simple",
    fields: [
      {
        originalField: "created_date",
        mappedField: "createdDate",
        dataType: "string",
        description: "Quote creation timestamp",
        sampleValue: "2025-08-20T14:24:39.884239",
        required: true
      },
      {
        originalField: "last_modified",
        mappedField: "lastModified",
        dataType: "string",
        description: "Last modification timestamp",
        sampleValue: "2025-08-20T14:24:39.884245",
        required: true
      },
      {
        originalField: "effective_date",
        mappedField: "effectiveDate",
        dataType: "string",
        description: "Coverage effective date",
        sampleValue: "2025-08-01T00:00:00",
        required: true
      },
      {
        originalField: "expires_date",
        mappedField: "expiresDate",
        dataType: "string",
        description: "Quote expiration date",
        sampleValue: "2099-12-31T00:00:00",
        required: true
      }
    ]
  },

  // 3. FINANCIAL INFORMATION
  {
    category: "Financial Information",
    description: "Fees, discounts, and financial terms",
    complexity: "simple",
    fields: [
      {
        originalField: "policy_fee",
        mappedField: "policyFee",
        dataType: "number",
        description: "Monthly policy administration fee",
        sampleValue: 25,
        required: true
      },
      {
        originalField: "hh_discount",
        mappedField: "hhDiscount",
        dataType: "number",
        description: "Household discount percentage",
        sampleValue: 0.1,
        required: true
      }
    ]
  },

  // 4. COMPANY INFORMATION
  {
    category: "Company Information",
    description: "Insurance company details and ratings",
    complexity: "moderate",
    notes: "Contains nested company_base object with parent company information",
    fields: [
      {
        originalField: "company",
        mappedField: "companyKey",
        dataType: "string",
        description: "Company identifier key",
        sampleValue: "agZjc2dhcGlyFAsSB0NvbXBhbnkYgICAgMCrtwgMogEIbWVkX3N1cHA",
        required: true
      },
      {
        originalField: "company_base.name",
        mappedField: "companyName",
        dataType: "string",
        description: "Short company name",
        sampleValue: "Liberty Bankers Life Ins Co",
        required: true,
        nested: true
      },
      {
        originalField: "company_base.name_full",
        mappedField: "companyFullName",
        dataType: "string",
        description: "Full legal company name",
        sampleValue: "Liberty Bankers Life Insurance Company",
        required: true,
        nested: true
      },
      {
        originalField: "company_base.naic",
        mappedField: "naic",
        dataType: "string",
        description: "NAIC company identifier",
        sampleValue: "68543",
        required: true,
        nested: true
      },
      {
        originalField: "company_base.ambest_rating",
        mappedField: "ambestRating",
        dataType: "string",
        description: "AM Best financial rating",
        sampleValue: "A-",
        required: true,
        nested: true
      },
      {
        originalField: "company_base.ambest_outlook",
        mappedField: "ambestOutlook",
        dataType: "string",
        description: "AM Best rating outlook",
        sampleValue: "Stable",
        required: true,
        nested: true
      },
      {
        originalField: "company_base.business_type",
        mappedField: "businessType",
        dataType: "string",
        description: "Type of insurance business",
        sampleValue: "Life Accident and Health",
        required: true,
        nested: true
      },
      {
        originalField: "company_base.type",
        mappedField: "companyType",
        dataType: "string",
        description: "Company structure type",
        sampleValue: "STOCK",
        required: true,
        nested: true
      }
    ]
  },

  // 5. PARENT COMPANY INFORMATION
  {
    category: "Parent Company Information",
    description: "Parent company details and hierarchy",
    complexity: "moderate",
    notes: "Nested parent company structure within company_base",
    fields: [
      {
        originalField: "company_base.parent_company_base.name",
        mappedField: "parentCompanyName",
        dataType: "string",
        description: "Parent company name",
        sampleValue: "Liberty Bankers Ins Grp",
        required: false,
        nested: true
      },
      {
        originalField: "company_base.parent_company_base.code",
        mappedField: "parentCompanyCode",
        dataType: "string",
        description: "Parent company code",
        sampleValue: "3436",
        required: false,
        nested: true
      },
      {
        originalField: "company_base.parent_company_base.established_year",
        mappedField: "parentCompanyEstablished",
        dataType: "number",
        description: "Parent company establishment year",
        sampleValue: 2013,
        required: false,
        nested: true
      }
    ]
  },

  // 6. BASE PLANS STRUCTURE
  {
    category: "Base Plans",
    description: "Core hospital confinement benefit plans with variable day configurations",
    complexity: "complex",
    notes: "Array of base plans with 27 benefit amount options ranging from $100-$750 per day. Benefit days are variable (similar to dental annual maximums) - plans can have 7, 14, 30+ day configurations based on plan_name.",
    fields: [
      {
        originalField: "base_plans",
        mappedField: "basePlans",
        dataType: "array",
        description: "Array of base plan options",
        required: true,
        arrayType: true,
        nested: true
      },
      {
        originalField: "base_plans[].name",
        mappedField: "basePlans[].name",
        dataType: "string",
        description: "Base plan name",
        sampleValue: "Hospital Confinement Benefit",
        required: true,
        nested: true
      },
      {
        originalField: "base_plans[].included",
        mappedField: "basePlans[].included",
        dataType: "boolean",
        description: "Whether plan is automatically included",
        sampleValue: false,
        required: true,
        nested: true
      },
      {
        originalField: "base_plans[].benefits",
        mappedField: "basePlans[].benefits",
        dataType: "array",
        description: "Array of benefit amount options (27 options)",
        required: true,
        arrayType: true,
        nested: true
      }
    ]
  },

  // 7. OPTIONAL RIDERS
  {
    category: "Optional Riders",
    description: "11 different optional rider types with varying benefit structures",
    complexity: "complex",
    notes: "Each rider has different benefit options, rates, and quantifiers. Rate > 0 indicates additional cost.",
    fields: [
      {
        originalField: "riders[].name",
        mappedField: "riders[].name",
        dataType: "string",
        description: "Rider name/type",
        sampleValue: "Ambulance Services Rider",
        required: true,
        nested: true
      },
      {
        originalField: "riders[].included",
        mappedField: "riders[].included",
        dataType: "boolean",
        description: "Whether rider is included (false = optional, true = automatic)",
        sampleValue: false,
        required: true,
        nested: true
      },
      {
        originalField: "riders[].note",
        mappedField: "riders[].note",
        dataType: "string",
        description: "Detailed rider description and limitations",
        sampleValue: "$250 Ground / $500 Air due to sickness or injury (2 Ground and 2 Air per calendar YR)",
        required: false,
        nested: true
      }
    ]
  },

  // 8. INCLUDED RIDERS (CORE BENEFITS)
  {
    category: "Included Riders",
    description: "7 automatically included core benefit types",
    complexity: "complex",
    notes: "These riders have rate=0 and included=true. They provide core coverage automatically included in the plan.",
    fields: [
      {
        originalField: "riders[included=true].name",
        mappedField: "includedRiders[].name",
        dataType: "string",
        description: "Included rider type",
        sampleValue: "Hospital Confinement Benefits",
        required: true,
        nested: true
      }
    ]
  },

  // 9. BENEFIT STRUCTURE
  {
    category: "Benefit Structure",
    description: "Individual benefit options within plans and riders",
    complexity: "complex",
    notes: "Each benefit has amount, rate, quantifier, and dependent_riders. Over 400 total benefit configurations.",
    fields: [
      {
        originalField: "benefits[].amount",
        mappedField: "benefits[].amount",
        dataType: "string",
        description: "Benefit amount (can include descriptive text)",
        sampleValue: "100",
        required: true,
        nested: true
      },
      {
        originalField: "benefits[].rate",
        mappedField: "benefits[].rate",
        dataType: "number",
        description: "Monthly rate for this benefit (0 = included)",
        sampleValue: 3.22,
        required: true,
        nested: true
      },
      {
        originalField: "benefits[].quantifier",
        mappedField: "benefits[].quantifier",
        dataType: "string",
        description: "Benefit frequency/limitation",
        sampleValue: "Day",
        required: true,
        nested: true
      },
      {
        originalField: "benefits[].dependent_riders",
        mappedField: "benefits[].dependentRiders",
        dataType: "array",
        description: "Array of dependent rider configurations",
        sampleValue: [],
        required: true,
        arrayType: true,
        nested: true
      }
    ]
  },

  // 10. GEOGRAPHIC AND MISC DATA
  {
    category: "Geographic and Miscellaneous",
    description: "Location restrictions and additional data fields",
    complexity: "simple",
    fields: [
      {
        originalField: "county",
        mappedField: "county",
        dataType: "array",
        description: "Included counties (empty = all counties)",
        sampleValue: [],
        required: true,
        arrayType: true
      },
      {
        originalField: "county_excluded",
        mappedField: "countyExcluded",
        dataType: "array",
        description: "Excluded counties",
        sampleValue: [],
        required: true,
        arrayType: true
      },
      {
        originalField: "contextual_data",
        mappedField: "contextualData",
        dataType: "object",
        description: "Additional contextual information",
        sampleValue: null,
        required: false
      },
      {
        originalField: "product_key",
        mappedField: "productKey",
        dataType: "string",
        description: "Product classification key",
        sampleValue: null,
        required: false
      },
      {
        originalField: "e_app_link",
        mappedField: "eAppLink",
        dataType: "string",
        description: "Electronic application link",
        sampleValue: "",
        required: false
      },
      {
        originalField: "has_brochure",
        mappedField: "hasBrochure",
        dataType: "boolean",
        description: "Whether brochure is available",
        sampleValue: false,
        required: true
      },
      {
        originalField: "has_pdf_app",
        mappedField: "hasPdfApp",
        dataType: "boolean",
        description: "Whether PDF application is available",
        sampleValue: false,
        required: true
      }
    ]
  }
];

/**
 * RIDER TYPE ANALYSIS (11 Optional + 7 Included = 18 Total)
 */
export const RIDER_TYPES = {
  optional: [
    "Ambulance Services Rider",
    "Dental, Vision & Hearing Rider", 
    "ER & Urgent Care Benefit Rider",
    "OP Dx Svcs & Wellness Rider",
    "OP Therapy & Medical Devices Rider",
    "Lump Sum Hospital Confinement Rider",
    "Outpatient Surgery Rider",
    "Skilled Nurse & Hospice Care Facility Rider 1",
    "Skilled Nurse & Hospice Care Facility Rider 2",
    "Skilled Nurse w/EP & Hospice Care Facility Rider",
    "Hospital Confinement Benefit" // Base plan (included=false in base_plans)
  ],
  included: [
    "Hospital Confinement Benefits", // Core daily benefit (rate=0)
    "Observation Benefit",
    "Intensive Care Benefit", 
    "Extended Care Benefit",
    "Mental Health Benefit",
    "Companion Travel Benefit",
    "Pet Boarding Benefit"
  ]
};

/**
 * QUANTIFIER PATTERNS ANALYSIS
 */
export const QUANTIFIER_PATTERNS = [
  "Day", // Daily benefits
  "per Occurrence", // Per incident
  "per Year", // Annual limits
  "per Confinement", // Per hospital stay
  "per Surgery", // Per surgical procedure
  "per Day", // Daily benefits
  "5 Visits per year", // Limited visits
  "15 Visits per year", 
  "30 Visits per year",
  "Max 10 Days per CY", // Calendar year maximums
  "Max 7 Days per CY",
  "Per Day - Max 7 Days per CY",
  "Per Day Beyond the Max Confinement Benefit Period",
  "Per Day of Confinement in Hospital - Max 7 Days per CY",
  "Per Day for Family Member - Insured Must be Hospitalized 50 Miles from Primary Residence",
  "Per Day for Boarding Pet in Licensed Facility - Max 10 Days per CY",
  " 07 Days" // Specific day limits
];

/**
 * RATE ANALYSIS
 * - Rate = 0: Included benefits (no additional cost)
 * - Rate > 0: Optional benefits with monthly premium
 * - Rate ranges from $1.26 to $30.75 monthly
 */
export const RATE_ANALYSIS = {
  includedBenefits: "rate === 0",
  optionalBenefits: "rate > 0", 
  rateRange: { min: 1.26, max: 30.75 },
  basePlanRates: { min: 3.22, max: 24.17 }, // 27 options for Hospital Confinement Benefit
  riderRates: { min: 1.28, max: 30.75 } // Various optional riders
};
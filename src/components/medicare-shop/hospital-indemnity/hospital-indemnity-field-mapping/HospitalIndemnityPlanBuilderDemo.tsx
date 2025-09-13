import React from 'react';
// import { AdaptiveHospitalIndemnityPlanBuilder } from './AdaptiveHospitalIndemnityPlanBuilder';
import { OptimizedHospitalIndemnityQuote } from '@/lib/hospital-indemnity-quote-optimizer';

// Mock data for testing the plan builder
const mockHospitalIndemnityQuotes: OptimizedHospitalIndemnityQuote[] = [
  {
    id: "test-quote-1",
    companyName: "Liberty Bankers Life Ins Co",
    companyFullName: "Liberty Bankers Life Insurance Company",
    planName: "07 Benefit Days",
    age: 45,
    gender: "M",
    state: "TX",
    tobacco: false,
    monthlyPremium: 31.00,
    policyFee: 25,
    hhDiscount: 0.1,
    ambest: {
      rating: "A-",
      outlook: "Stable"
    },
    lastModified: "2025-09-13T00:00:00Z",
    hasApplications: {
      brochure: false,
      pdfApp: false,
      eApp: false
    },
    basePlans: [{
      name: "Hospital Confinement Benefits",
      included: true,
      notes: null,
      benefitOptions: [
        { amount: "100", quantifier: "per Day", rate: 15.50 },
        { amount: "150", quantifier: "per Day", rate: 23.25 },
        { amount: "200", quantifier: "per Day", rate: 31.00 },
        { amount: "250", quantifier: "per Day", rate: 38.75 },
        { amount: "300", quantifier: "per Day", rate: 46.50 }
      ]
    }],
    riders: [
      {
        name: "Ambulance Services Rider",
        included: false,
        notes: "$250 Ground / $500 Air due to sickness or injury (2 Ground and 2 Air per calendar YR)",
        benefitOptions: [
          { amount: "250", quantifier: "per Occurrence", rate: 1.48 }
        ]
      },
      {
        name: "Dental, Vision & Hearing Rider",
        included: false,
        notes: "Dental, Vision & Hearing coverage",
        benefitOptions: [
          { amount: "400", quantifier: "per Year", rate: 22.42 },
          { amount: "800", quantifier: "per Year", rate: 26.50 },
          { amount: "1200", quantifier: "per Year", rate: 30.75 }
        ]
      },
      {
        name: "ER & Urgent Care Benefit Rider",
        included: false,
        notes: "$250 per Emergency Room visit / $50 per Ugent Care visit due to sickness or injury (1 visit per calendar YR quarter)",
        benefitOptions: [
          { amount: "250", quantifier: "per Occurrence", rate: 1.32 }
        ]
      },
      {
        name: "OP Dx Svcs & Wellness Rider",
        included: false,
        notes: "$200 Advanced Diagnostic / $50 Basic Diagnostic, Labs and Wellness Benefits (max of $500 per calendar YR per covered person)",
        benefitOptions: [
          { amount: "200", quantifier: "per Occurrence", rate: 3.07 }
        ]
      },
      {
        name: "OP Therapy & Medical Devices Rider",
        included: false,
        notes: "$50 Therapy | $50 Medical Equipment | $500 Home Modifications | $2,000 Prosthetic Devices",
        benefitOptions: [
          { amount: "50", quantifier: "5 Visits per year", rate: 3.10 },
          { amount: "50", quantifier: "15 Visits per year", rate: 4.68 },
          { amount: "50", quantifier: "30 Visits per year", rate: 5.40 }
        ]
      },
      {
        name: "Lump Sum Hospital Confinement Rider",
        included: false,
        notes: "Confinement due to Sickness or Injury (2 per calendar YR)",
        benefitOptions: [
          { amount: "500", quantifier: "per Confinement", rate: 6.52 },
          { amount: "1000", quantifier: "per Confinement", rate: 13.04 },
          { amount: "2000", quantifier: "per Confinement", rate: 26.08 }
        ]
      },
      {
        name: "Outpatient Surgery Rider",
        included: false,
        notes: "Outpatient Surgery due to Sickness or Injury (2 per calendar YR)",
        benefitOptions: [
          { amount: "250", quantifier: "per Surgery", rate: 4.62 },
          { amount: "500", quantifier: "per Surgery", rate: 9.23 },
          { amount: "1000", quantifier: "per Surgery", rate: 18.46 },
          { amount: "1500", quantifier: "per Surgery", rate: 27.69 }
        ]
      },
      {
        name: "Skilled Nurse & Hospice Care Facility Rider 1",
        included: false,
        notes: "Days 1-100 | Hospice Care 25% of SNF Daily Amount (Max 14 Days per calendar YR)",
        benefitOptions: [
          { amount: "100", quantifier: "per Day", rate: 2.42 },
          { amount: "125", quantifier: "per Day", rate: 3.02 },
          { amount: "150", quantifier: "per Day", rate: 3.63 },
          { amount: "175", quantifier: "per Day", rate: 4.23 },
          { amount: "200", quantifier: "per Day", rate: 4.84 },
          { amount: "225", quantifier: "per Day", rate: 5.44 },
          { amount: "250", quantifier: "per Day", rate: 6.05 },
          { amount: "275", quantifier: "per Day", rate: 6.65 },
          { amount: "300", quantifier: "per Day", rate: 7.26 }
        ]
      },
      {
        name: "Skilled Nurse & Hospice Care Facility Rider 2",
        included: false,
        notes: "Days 1-20 | Hospice Care 25% of SNF Daily Amount (Max 14 Days per calendar YR)",
        benefitOptions: [
          { amount: "100", quantifier: "per Day", rate: 1.28 },
          { amount: "125", quantifier: "per Day", rate: 1.60 },
          { amount: "150", quantifier: "per Day", rate: 1.91 },
          { amount: "175", quantifier: "per Day", rate: 2.23 },
          { amount: "200", quantifier: "per Day", rate: 2.55 },
          { amount: "225", quantifier: "per Day", rate: 2.87 },
          { amount: "250", quantifier: "per Day", rate: 3.19 },
          { amount: "275", quantifier: "per Day", rate: 3.51 },
          { amount: "300", quantifier: "per Day", rate: 3.83 }
        ]
      },
      {
        name: "Skilled Nurse w/EP & Hospice Care Facility Rider",
        included: false,
        notes: "Days 21-100 | Hospice Care 25% of SNF Daily Amount (Max 14 Days per calendar YR)",
        benefitOptions: [
          { amount: "100", quantifier: "per Day", rate: 1.26 },
          { amount: "125", quantifier: "per Day", rate: 1.57 },
          { amount: "150", quantifier: "per Day", rate: 1.88 },
          { amount: "175", quantifier: "per Day", rate: 2.20 },
          { amount: "200", quantifier: "per Day", rate: 2.51 },
          { amount: "225", quantifier: "per Day", rate: 2.83 },
          { amount: "250", quantifier: "per Day", rate: 3.14 },
          { amount: "275", quantifier: "per Day", rate: 3.46 },
          { amount: "300", quantifier: "per Day", rate: 3.77 }
        ]
      }
    ]
  },
  {
    id: "test-quote-2",
    companyName: "Liberty Bankers Life Ins Co",
    companyFullName: "Liberty Bankers Life Insurance Company", 
    planName: "14 Benefit Days",
    age: 45,
    gender: "M",
    state: "TX", 
    tobacco: false,
    monthlyPremium: 56.00,
    policyFee: 25,
    hhDiscount: 0.1,
    ambest: {
      rating: "A-",
      outlook: "Stable"
    },
    lastModified: "2025-09-13T00:00:00Z",
    hasApplications: {
      brochure: false,
      pdfApp: false,
      eApp: false
    },
    basePlans: [{
      name: "Hospital Confinement Benefits",
      included: true,
      notes: null,
      benefitOptions: [
        { amount: "100", quantifier: "per Day", rate: 28.00 },
        { amount: "150", quantifier: "per Day", rate: 42.00 },
        { amount: "200", quantifier: "per Day", rate: 56.00 },
        { amount: "250", quantifier: "per Day", rate: 70.00 },
        { amount: "300", quantifier: "per Day", rate: 84.00 }
      ]
    }],
    riders: [
      {
        name: "Ambulance Services Rider",
        included: false,
        notes: "$250 Ground / $500 Air due to sickness or injury (2 Ground and 2 Air per calendar YR)",
        benefitOptions: [
          { amount: "250", quantifier: "per Occurrence", rate: 1.48 }
        ]
      },
      {
        name: "Dental, Vision & Hearing Rider",
        included: false,
        notes: "Dental, Vision & Hearing coverage",
        benefitOptions: [
          { amount: "400", quantifier: "per Year", rate: 22.42 },
          { amount: "800", quantifier: "per Year", rate: 26.50 },
          { amount: "1200", quantifier: "per Year", rate: 30.75 }
        ]
      },
      {
        name: "ER & Urgent Care Benefit Rider",
        included: false,
        notes: "$250 per Emergency Room visit / $50 per Ugent Care visit due to sickness or injury (1 visit per calendar YR quarter)",
        benefitOptions: [
          { amount: "250", quantifier: "per Occurrence", rate: 1.32 }
        ]
      },
      {
        name: "OP Dx Svcs & Wellness Rider",
        included: false,
        notes: "$200 Advanced Diagnostic / $50 Basic Diagnostic, Labs and Wellness Benefits (max of $500 per calendar YR per covered person)",
        benefitOptions: [
          { amount: "200", quantifier: "per Occurrence", rate: 3.07 }
        ]
      },
      {
        name: "OP Therapy & Medical Devices Rider",
        included: false,
        notes: "$50 Therapy | $50 Medical Equipment | $500 Home Modifications | $2,000 Prosthetic Devices",
        benefitOptions: [
          { amount: "50", quantifier: "5 Visits per year", rate: 3.10 },
          { amount: "50", quantifier: "15 Visits per year", rate: 4.68 },
          { amount: "50", quantifier: "30 Visits per year", rate: 5.40 }
        ]
      },
      {
        name: "Lump Sum Hospital Confinement Rider",
        included: false,
        notes: "Confinement due to Sickness or Injury (2 per calendar YR)",
        benefitOptions: [
          { amount: "500", quantifier: "per Confinement", rate: 6.52 },
          { amount: "1000", quantifier: "per Confinement", rate: 13.04 },
          { amount: "2000", quantifier: "per Confinement", rate: 26.08 }
        ]
      },
      {
        name: "Outpatient Surgery Rider",
        included: false,
        notes: "Outpatient Surgery due to Sickness or Injury (2 per calendar YR)",
        benefitOptions: [
          { amount: "250", quantifier: "per Surgery", rate: 4.62 },
          { amount: "500", quantifier: "per Surgery", rate: 9.23 },
          { amount: "1000", quantifier: "per Surgery", rate: 18.46 },
          { amount: "1500", quantifier: "per Surgery", rate: 27.69 }
        ]
      },
      {
        name: "Skilled Nurse & Hospice Care Facility Rider 1",
        included: false,
        notes: "Days 1-100 | Hospice Care 25% of SNF Daily Amount (Max 14 Days per calendar YR)",
        benefitOptions: [
          { amount: "100", quantifier: "per Day", rate: 2.42 },
          { amount: "125", quantifier: "per Day", rate: 3.02 },
          { amount: "150", quantifier: "per Day", rate: 3.63 },
          { amount: "175", quantifier: "per Day", rate: 4.23 },
          { amount: "200", quantifier: "per Day", rate: 4.84 },
          { amount: "225", quantifier: "per Day", rate: 5.44 },
          { amount: "250", quantifier: "per Day", rate: 6.05 },
          { amount: "275", quantifier: "per Day", rate: 6.65 },
          { amount: "300", quantifier: "per Day", rate: 7.26 }
        ]
      },
      {
        name: "Skilled Nurse & Hospice Care Facility Rider 2",
        included: false,
        notes: "Days 1-20 | Hospice Care 25% of SNF Daily Amount (Max 14 Days per calendar YR)",
        benefitOptions: [
          { amount: "100", quantifier: "per Day", rate: 1.28 },
          { amount: "125", quantifier: "per Day", rate: 1.60 },
          { amount: "150", quantifier: "per Day", rate: 1.91 },
          { amount: "175", quantifier: "per Day", rate: 2.23 },
          { amount: "200", quantifier: "per Day", rate: 2.55 },
          { amount: "225", quantifier: "per Day", rate: 2.87 },
          { amount: "250", quantifier: "per Day", rate: 3.19 },
          { amount: "275", quantifier: "per Day", rate: 3.51 },
          { amount: "300", quantifier: "per Day", rate: 3.83 }
        ]
      },
      {
        name: "Skilled Nurse w/EP & Hospice Care Facility Rider",
        included: false,
        notes: "Days 21-100 | Hospice Care 25% of SNF Daily Amount (Max 14 Days per calendar YR)",
        benefitOptions: [
          { amount: "100", quantifier: "per Day", rate: 1.26 },
          { amount: "125", quantifier: "per Day", rate: 1.57 },
          { amount: "150", quantifier: "per Day", rate: 1.88 },
          { amount: "175", quantifier: "per Day", rate: 2.20 },
          { amount: "200", quantifier: "per Day", rate: 2.51 },
          { amount: "225", quantifier: "per Day", rate: 2.83 },
          { amount: "250", quantifier: "per Day", rate: 3.14 },
          { amount: "275", quantifier: "per Day", rate: 3.46 },
          { amount: "300", quantifier: "per Day", rate: 3.77 }
        ]
      }
    ]
  },
  {
    id: "test-quote-3",
    companyName: "Another Insurance Co",
    companyFullName: "Another Insurance Company",
    planName: "30 Benefit Days", 
    age: 45,
    gender: "M",
    state: "TX",
    tobacco: false,
    monthlyPremium: 90.00,
    policyFee: 30,
    hhDiscount: 0.05,
    ambest: {
      rating: "A",
      outlook: "Stable"
    },
    lastModified: "2025-09-13T00:00:00Z",
    hasApplications: {
      brochure: true,
      pdfApp: true,
      eApp: false
    },
    basePlans: [{
      name: "Hospital Confinement Benefits",
      included: true,
      notes: null,
      benefitOptions: [
        { amount: "100", quantifier: "per Day", rate: 45.00 },
        { amount: "150", quantifier: "per Day", rate: 67.50 },
        { amount: "200", quantifier: "per Day", rate: 90.00 },
        { amount: "250", quantifier: "per Day", rate: 112.50 }
      ]
    }],
    riders: [
      {
        name: "Lump Sum Hospital Confinement Rider",
        included: false,
        notes: "Confinement due to Sickness or Injury",
        benefitOptions: [
          { amount: "500", quantifier: "per Confinement", rate: 6.52 },
          { amount: "1000", quantifier: "per Confinement", rate: 13.04 },
          { amount: "2000", quantifier: "per Confinement", rate: 26.08 }
        ]
      }
    ]
  }
];

interface HospitalIndemnityPlanBuilderDemoProps {
  className?: string;
}

export function HospitalIndemnityPlanBuilderDemo({ className }: HospitalIndemnityPlanBuilderDemoProps) {
  const handlePlanBuilt = (selectedQuote: OptimizedHospitalIndemnityQuote, configuration: any) => {
    console.log('Plan built:', {
      quote: selectedQuote,
      configuration: configuration
    });
    
    const riderSummary = configuration.selectedRiders?.map((r: any) => 
      `${r.name}: $${r.selectedBenefitOption?.amount} ${r.selectedBenefitOption?.quantifier} (+$${r.selectedBenefitOption?.rate}/mo)`
    ).join('\n') || 'No riders selected';
    
    alert(`Plan built successfully!\n\nCompany: ${selectedQuote.companyName}\nPlan: ${selectedQuote.planName}\nBenefit Days: ${configuration.benefitDays}\nDaily Benefit: $${configuration.dailyBenefit}\nTotal Premium: $${configuration.totalPremium?.toFixed(2)}/month\n\nSelected Riders:\n${riderSummary}`);
  };

  return (
    <div className={className}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Hospital Indemnity Plan Builder Demo</h2>
        <p className="text-gray-600 mb-4">
          Mock data with {mockHospitalIndemnityQuotes.length} quotes and comprehensive rider options.
        </p>
        <div className="text-sm text-gray-500">
          Plan builder temporarily disabled due to module resolution issues.
          Working on fixing the import system.
        </div>
      </div>
    </div>
  );
}
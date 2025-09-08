import React from 'react';
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { FaCheck, FaTimes } from "react-icons/fa";
import { MedicareAdvantageQuote, FieldMapping } from '@/types/medicare-advantage';
import { 
  formatCurrency, 
  getMedicalDeductible, 
  getDrugDeductible, 
  getMOOPData, 
  getPrimaryCareData, 
  getSpecialistCareData, 
  getOTCBenefit, 
  hasDrugCoverage 
} from '@/utils/medicare-advantage-data';
import { hasBenefitType } from '@/utils/medicare-advantage-data';

interface FieldMappingTableProps {
  selectedPlan: MedicareAdvantageQuote;
}

export const FieldMappingTable: React.FC<FieldMappingTableProps> = ({ selectedPlan }) => {
  // Dynamic field mappings based on plan type
  const getFieldMappings = (): FieldMapping[] => {
    const planType = selectedPlan.plan_type?.toLowerCase() || '';
    const moopData = getMOOPData(selectedPlan);
    
    // Always include all possible fields for consistency
    return [
      {
        column: 'Monthly Premium',
        field: 'month_rate',
        value: formatCurrency(selectedPlan.month_rate / 100)
      },
      {
        column: 'Annual Cost',
        field: 'month_rate * 12',
        value: formatCurrency((selectedPlan.month_rate / 100) * 12)
      },
      {
        column: 'MOOP In-Network',
        field: 'benefits["Maximum Oopc"].summary_description.in_network',
        value: moopData.inNetwork !== 'N/A' && moopData.inNetwork !== 'Contact Plan' ? moopData.inNetwork : 'N/A'
      },
      {
        column: 'MOOP Combined',
        field: 'benefits["Maximum Oopc"].summary_description.out_network',
        value: moopData.combined !== 'N/A' && moopData.combined !== 'Contact Plan' ? moopData.combined : 'N/A'
      },
      {
        column: 'Drug Deductible',
        field: 'annual_drug_deductible',
        value: hasDrugCoverage(selectedPlan) ? getDrugDeductible(selectedPlan) : 'No Drug Coverage'
      },
      {
        column: 'Medical Deductible',
        field: 'benefits["Health Plan Deductible"]',
        value: getMedicalDeductible(selectedPlan)
      },
      {
        column: 'Primary Care Co-pay',
        field: 'benefits["Doctor\'s office visits"]',
        value: getPrimaryCareData(selectedPlan)
      },
      {
        column: 'Specialist Co-pay',
        field: 'benefits["Doctor\'s office visits"]',
        value: getSpecialistCareData(selectedPlan)
      },
      {
        column: 'OTC Benefit',
        field: 'benefits["Otc Items"]',
        value: getOTCBenefit(selectedPlan)
      },
      {
        column: 'Dental',
        field: 'benefits["Comprehensive Dental Service"]',
        value: hasBenefitType(selectedPlan, 'Comprehensive Dental Service') ? <FaCheck className="w-4 h-4 text-green-600" /> : <FaTimes className="w-4 h-4 text-red-600" />
      },
      {
        column: 'Vision',
        field: 'benefits["Vision"]',
        value: hasBenefitType(selectedPlan, 'Vision') ? <FaCheck className="w-4 h-4 text-green-600" /> : <FaTimes className="w-4 h-4 text-red-600" />
      },
      {
        column: 'Hearing',
        field: 'benefits["Hearing services"]',
        value: hasBenefitType(selectedPlan, 'Hearing services') ? <FaCheck className="w-4 h-4 text-green-600" /> : <FaTimes className="w-4 h-4 text-red-600" />
      },
      {
        column: 'Transport',
        field: 'benefits["Transportation"]',
        value: hasBenefitType(selectedPlan, 'Transportation') ? <FaCheck className="w-4 h-4 text-green-600" /> : <FaTimes className="w-4 h-4 text-red-600" />
      }
    ];
  };

  const fieldMappings = getFieldMappings();

  return (
    <Table>
      <TableBody>
        {fieldMappings.map((mapping, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{mapping.column}</TableCell>
            <TableCell>{mapping.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

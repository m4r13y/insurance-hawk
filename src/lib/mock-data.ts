import type { Plan, Document } from '@/types';

export const mockPlans: Plan[] = [
  {
    id: 'plan-1',
    name: 'Blue Shield Secure PPO',
    provider: 'Blue Shield',
    category: 'Medicare Supplement',
    type: 'PPO',
    premium: 150,
    deductible: 500,
    maxOutOfPocket: 5000,
    rating: 4,
    features: {
        dental: true,
        vision: true,
        hearing: false,
        prescriptionDrug: true,
    }
  },
  {
    id: 'plan-2',
    name: 'Kaiser Permanente Gold HMO',
    provider: 'Kaiser Permanente',
    category: 'Medicare Supplement',
    type: 'HMO',
    premium: 120,
    deductible: 750,
    maxOutOfPocket: 6000,
    rating: 5,
    features: {
        dental: true,
        vision: true,
        hearing: true,
        prescriptionDrug: true,
    }
  },
  {
    id: 'plan-3',
    name: 'Aetna Value FFS',
    provider: 'Aetna',
    category: 'Medicare Supplement',
    type: 'FFS',
    premium: 200,
    deductible: 250,
    maxOutOfPocket: 4000,
    rating: 4,
    features: {
        dental: false,
        vision: true,
        hearing: true,
        prescriptionDrug: false,
    }
  },
  {
    id: 'plan-4',
    name: 'UnitedHealthCare Choice SNP',
    provider: 'UnitedHealthCare',
    category: 'Medicare Supplement',
    type: 'SNP',
    premium: 50,
    deductible: 1000,
    maxOutOfPocket: 7500,
    rating: 3,
    features: {
        dental: true,
        vision: false,
        hearing: false,
        prescriptionDrug: true,
    }
  },
    {
    id: 'plan-5',
    name: 'Humana Basic PPO',
    provider: 'Humana',
    category: 'Medicare Supplement',
    type: 'PPO',
    premium: 180,
    deductible: 600,
    maxOutOfPocket: 5500,
    rating: 4,
    features: {
        dental: true,
        vision: true,
        hearing: true,
        prescriptionDrug: false,
    }
  },
  {
    id: 'plan-6',
    name: 'Cigna HealthSpring HMO',
    provider: 'Cigna',
    category: 'Medicare Supplement',
    type: 'HMO',
    premium: 135,
    deductible: 800,
    maxOutOfPocket: 6200,
    rating: 4,
    features: {
        dental: true,
        vision: true,
        hearing: true,
        prescriptionDrug: true,
    }
  },
  {
    id: 'plan-7',
    name: 'Delta Dental PPO Plus',
    provider: 'Delta Dental',
    category: 'Dental',
    type: 'PPO',
    premium: 45,
    deductible: 50,
    maxOutOfPocket: 1500,
    rating: 4.5,
    features: {
        dental: true,
        vision: false,
        hearing: false,
        prescriptionDrug: false,
    }
  }
];

export const mockDocuments: Document[] = [
    { id: 'doc-1', name: 'Proof_of_Residency.pdf', uploadDate: '2023-10-15', size: '1.2MB' },
    { id: 'doc-2', name: 'Medicare_Card_Scan.jpg', uploadDate: '2023-10-12', size: '850KB' },
    { id: 'doc-3', name: 'Application_Form_Signed.pdf', uploadDate: '2023-10-11', size: '2.5MB' },
];

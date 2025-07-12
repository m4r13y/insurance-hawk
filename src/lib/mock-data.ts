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
    {
      id: 'doc-1', name: 'Proof_of_Residency.pdf', uploadDate: '2023-10-15', size: '1.2MB',
      downloadURL: '',
      storagePath: ''
    },
    {
      id: 'doc-2', name: 'Medicare_Card_Scan.jpg', uploadDate: '2023-10-12', size: '850KB',
      downloadURL: '',
      storagePath: ''
    },
    {
      id: 'doc-3', name: 'Application_Form_Signed.pdf', uploadDate: '2023-10-11', size: '2.5MB',
      downloadURL: '',
      storagePath: ''
    },
];

export const carriers = [
  { "id": "unitedhealth", "name": "UnitedHealth Group", "logoUrl": "https://logo.clearbit.com/uhc.com", "website": "https://uhc.com" },
  { "id": "elevance", "name": "Elevance Health (Anthem)", "logoUrl": "https://logo.clearbit.com/anthem.com", "website": "https://anthem.com" },
  { "id": "centene", "name": "Centene Corporation", "logoUrl": "https://logo.clearbit.com/centene.com", "website": "https://centene.com" },
  { "id": "humana", "name": "Humana", "logoUrl": "https://logo.clearbit.com/humana.com", "website": "https://humana.com" },
  { "id": "cvs_aetna", "name": "CVS Health (Aetna)", "logoUrl": "https://logo.clearbit.com/aetna.com", "website": "https://aetna.com" },
  { "id": "kaiser", "name": "Kaiser Permanente", "logoUrl": "https://logo.clearbit.com/kaiserpermanente.org", "website": "https://kaiserpermanente.org" },
  { "id": "hcsc", "name": "Health Care Service Corporation", "logoUrl": "https://logo.clearbit.com/hcsc.com", "website": "https://hcsc.com" },
  { "id": "cigna", "name": "Cigna", "logoUrl": "https://logo.clearbit.com/cigna.com", "website": "https://cigna.com" },
  { "id": "molina", "name": "Molina Healthcare", "logoUrl": "https://logo.clearbit.com/molinahealthcare.com", "website": "https://molinahealthcare.com" },
  { "id": "guidewell", "name": "GuideWell (Florida Blue)", "logoUrl": "https://logo.clearbit.com/floridablue.com", "website": "https://floridablue.com" },
  { "id": "highmark", "name": "Highmark", "logoUrl": "https://logo.clearbit.com/highmark.com", "website": "https://highmark.com" },
  { "id": "bcbsm", "name": "Blue Cross Blue Shield Michigan", "logoUrl": "https://logo.clearbit.com/bcbsm.com", "website": "https://bcbsm.com" },
  { "id": "bcbsca", "name": "Blue Shield of California", "logoUrl": "https://logo.clearbit.com/blueshieldca.com", "website": "https://blueshieldca.com" },
  { "id": "bcbstx", "name": "Blue Cross Blue Shield Texas", "logoUrl": "https://logo.clearbit.com/bcbstx.com", "website": "https://bcbstx.com" },
  { "id": "bcbsnc", "name": "Blue Cross Blue Shield North Carolina", "logoUrl": "https://logo.clearbit.com/bcbsnc.com", "website": "https://bcbsnc.com" },
  { "id": "independence", "name": "Independence Blue Cross", "logoUrl": "https://logo.clearbit.com/ibx.com", "website": "https://ibx.com" },
  { "id": "carefirst", "name": "CareFirst BlueCross BlueShield", "logoUrl": "https://logo.clearbit.com/carefirst.com", "website": "https://carefirst.com" },
  { "id": "premera", "name": "Premera Blue Cross", "logoUrl": "https://logo.clearbit.com/premera.com", "website": "https://premera.com" },
  { "id": "oscar", "name": "Oscar Health", "logoUrl": "https://logo.clearbit.com/oscar.com", "website": "https://oscar.com" },
  { "id": "brighthealth", "name": "Bright Health", "logoUrl": "https://logo.clearbit.com/brighthealth.com", "website": "https://brighthealth.com" },
  { "id": "amerihealth", "name": "AmeriHealth Caritas", "logoUrl": "https://logo.clearbit.com/amerihealthcaritas.com", "website": "https://amerihealthcaritas.com" },
  { "id": "upmc", "name": "UPMC Health Plan", "logoUrl": "https://logo.clearbit.com/upmc.com", "website": "https://upmc.com" },
  { "id": "point32health", "name": "Point32Health", "logoUrl": "https://logo.clearbit.com/point32health.org", "website": "https://point32health.org" },
  { "id": "northwestern", "name": "Northwestern Mutual", "logoUrl": "https://logo.clearbit.com/northwesternmutual.com", "website": "https://northwesternmutual.com" },
  { "id": "newyorklife", "name": "New York Life", "logoUrl": "https://logo.clearbit.com/newyorklife.com", "website": "https://newyorklife.com" },
  { "id": "massmutual", "name": "MassMutual", "logoUrl": "https://logo.clearbit.com/massmutual.com", "website": "https://massmutual.com" },
  { "id": "pru", "name": "Prudential Financial", "logoUrl": "https://logo.clearbit.com/prudential.com", "website": "https://prudential.com" },
  { "id": "lincoln", "name": "Lincoln Financial", "logoUrl": "https://logo.clearbit.com/lfg.com", "website": "https://lfg.com" },
  { "id": "metlife", "name": "MetLife", "logoUrl": "https://logo.clearbit.com/metlife.com", "website": "https://metlife.com" },
  { "id": "statefarm", "name": "State Farm", "logoUrl": "https://logo.clearbit.com/statefarm.com", "website": "https://statefarm.com" },
  { "id": "nationwide", "name": "Nationwide", "logoUrl": "https://logo.clearbit.com/nationwide.com", "website": "https://nationwide.com" },
  { "id": "johnhancock", "name": "John Hancock", "logoUrl": "https://logo.clearbit.com/johnhancock.com", "website": "https://johnhancock.com" },
  { "id": "axa", "name": "AXA Equitable", "logoUrl": "https://logo.clearbit.com/axa.com", "website": "https://axa.com" },
  { "id": "aegon", "name": "Aegon/Transamerica", "logoUrl": "https://logo.clearbit.com/transamerica.com", "website": "https://transamerica.com" },
  { "id": "principal", "name": "Principal Financial Group", "logoUrl": "https://logo.clearbit.com/principal.com", "website": "https://principal.com" },
  { "id": "nationlife", "name": "Nationwide", "logoUrl": "https://logo.clearbit.com/nationwide.com", "website": "https://nationwide.com" },
  { "id": "guardian", "name": "Guardian Life", "logoUrl": "https://logo.clearbit.com/guardianlife.com", "website": "https://guardianlife.com" },
  { "id": "americo", "name": "Americo", "logoUrl": "https://logo.clearbit.com/americo.com", "website": "https://americo.com" },
  { "id": "aflac", "name": "Aflac", "logoUrl": "https://logo.clearbit.com/aflac.com", "website": "https://aflac.com" },
  { "id": "transamerica", "name": "Transamerica", "logoUrl": "https://logo.clearbit.com/transamerica.com", "website": "https://transamerica.com" },
  { "id": "gerber", "name": "Gerber Life", "logoUrl": "https://logo.clearbit.com/gerberlife.com", "website": "https://gerberlife.com" },
  { "id": "assurity", "name": "Assurity", "logoUrl": "https://logo.clearbit.com/assurity.com", "website": "https://assurity.com" },
  { "id": "colonialpenn", "name": "Colonial Penn", "logoUrl": "https://logo.clearbit.com/colonialpenn.com", "website": "https://colonialpenn.com" },
  { "id": "eyemed", "name": "EyeMed", "logoUrl": "https://logo.clearbit.com/eyemed.com", "website": "https://eyemed.com" },
  { "id": "vsp", "name": "VSP Vision Care", "logoUrl": "https://logo.clearbit.com/vsp.com", "website": "https://vsp.com" },
  { "id": "wellcare", "name": "WellCare", "logoUrl": "https://logo.clearbit.com/wellcare.com", "website": "https://wellcare.com" },
  { "id": "bankersfidelity", "name": "Bankers Fidelity", "logoUrl": "https://logo.clearbit.com/bankersfidelity.com", "website": "https://bankersfidelity.com" },
  { "id": "sentinel", "name": "Sentinel Security Life", "logoUrl": "https://logo.clearbit.com/sslco.com", "website": "https://sslco.com" },
  { "id": "greatsouthern", "name": "Great Southern Life", "logoUrl": "https://logo.clearbit.com/gslife.com", "website": "https://gslife.com" }
];
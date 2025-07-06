export type Plan = {
  id: string;
  name: string;
  provider: string;
  type: 'HMO' | 'PPO' | 'FFS' | 'SNP';
  premium: number;
  deductible: number;
  maxOutOfPocket: number;
  rating: number;
  features: {
    dental: boolean;
    vision: boolean;
    hearing: boolean;
    prescriptionDrug: boolean;
  }
};

export type Document = {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
};

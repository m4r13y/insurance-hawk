// Global type definitions for The Insurance Hawk app

export interface Plan {
  id: string;
  name: string;
  type: string;
  premium: number;
  deductible?: number;
  description?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size?: number;
  url?: string;
}

export interface ProviderService {
  id: string;
  name: string;
  type: string;
  description?: string;
  location?: string;
  phone?: string;
  website?: string;
}

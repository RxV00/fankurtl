
export interface MaterialItem {
  id: string;
  productCode: string;
  description: string;
  dimensions: string;
  requestQty: number;
  shipQty: number;
  unit: string;
  unitPrice: number;
  manualTotal?: number; // Optional override for line item total
}

export interface DiscoveryItem {
  id: string;
  floor: string;
  roomName: string;
  area: number;
  pipeDensity: number; // MT/M2
  pipeLength: number; // Calculated or manual
  circuits: number;
  thermostat: number;
  collector: string;
}

export interface Signatory {
  id: string;
  name: string;
  email: string;
  // title removed as requested
}

export interface ProposalData {
  date: string;
  projectName: string;
  attentionTo: string;
  subject: string;
  currency: string;
  
  // Dynamic Titles
  page1Title: string;
  page2Title: string;
  productTitle?: string; // New field for product title

  // Financials
  manualTotal?: number; // Optional manual override for total amount

  // Lists
  materials: MaterialItem[];
  discovery: DiscoveryItem[];
  signatories: Signatory[]; // Dynamic list
  notes: string[]; // Dynamic list
}
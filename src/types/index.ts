export type PropertyState = 'CURRENT' | 'CANCELLED';

export interface DocumentAttachment {
  id: string;
  name: string;
  type: string; // 'Deed of Sale' | 'Title Copy' | 'eCAR / CAR' | 'Transfer Tax' | 'Tax Clearance' | 'Survey Plan' | 'Sworn Statement' | 'Other'
  size: number;
  uploadDate: string;
  url?: string;
  fileData?: string; // base64 or object URL
  notes?: string;
}

export interface TaxDeclaration {
  id: string;
  tdNumber: string; // e.g. "TD-2024-04-001-00892"
  prevTdNumber?: string; // Linked previous tax declaration
  pin: string; // Property Identification Number, e.g. "024-04-0001-002-15"
  propertyState: PropertyState; // 'CURRENT' | 'CANCELLED'
  cancellationReason?: string;
  cancelledDate?: string;
  supersededByTdNumber?: string; // Which TD replaced this one
  
  // Owner info
  firstName: string;
  lastName: string;
  middleName?: string;
  adminBusinessName?: string; // Administrator or Business/Company Name
  taxpayerTin?: string;
  contactNumber?: string;
  
  // Property Location & Physical Details
  address: string; // Street / Sitio / Postal address
  barangayCode: string;
  barangayName: string;
  municipalityCode?: string;
  municipalityName?: string;
  provinceName?: string;
  
  // Land & Title Details
  titleNumber: string; // OCT / TCT / CCT No.
  lotNumber: string; // e.g. Lot 12-A
  surveyNumber: string; // Cadastral survey no. e.g. Psd-04-002145
  blockNumber?: string;
  
  // Quantities & Valuations
  area: number; // e.g. 250
  areaUnit: 'sqm' | 'ha'; // Square Meters or Hectares
  unitValue?: number; // Base unit market value per sqm/ha
  marketValue: number; // Total Base Market Value
  assessmentLevel: number; // Percentage, e.g. 20 for 20%
  assessedValue: number; // (marketValue * assessmentLevel / 100)
  
  // Classification
  kindOfProperty: string; // e.g. Land, Building, Machinery, Special
  generalClass: string; // e.g. Residential, Commercial, Industrial, Agricultural, Special
  actualUse?: string;
  
  // Assessment Effectivity & Dates
  effectivityYear: number; // e.g. 2024
  effectivityQuarter?: 1 | 2 | 3 | 4;
  assessmentDate: string; // YYYY-MM-DD
  
  // Memoranda & Legal Annotations
  memoranda: string; // Encumbrances, transfers, decree notes, easements
  
  // Supporting Documents
  documents: DocumentAttachment[];
  
  // Metadata & Approvals
  approvedBy?: string;
  appraisedBy?: string;
  taxMapper?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface KindOfPropertyConfig {
  id: string;
  name: string;
  code: string;
  description?: string;
  isSystem?: boolean;
}
export type KindOfProperty = KindOfPropertyConfig;

export interface GeneralClassConfig {
  id: string;
  name: string;
  code?: string;
  defaultAssessmentLevel: number; // e.g. 20
  description?: string;
  isSystem?: boolean;
}
export type GeneralClass = GeneralClassConfig;

export interface PSGCLocation {
  code: string;
  name: string;
  type?: string;
}

export interface PSGCBarangay {
  code: string;
  name: string;
  municipalityCode?: string;
  provinceCode?: string;
  regionCode?: string;
}

export interface AppSettings {
  officeName: string;
  lguName: string;
  provinceName: string;
  regionName: string;
  municipalAssessor: string;
  provincialAssessor: string;
  appraiserName: string;
  taxMapperName: string;
  
  // PSGC Configured Municipality
  psgcRegionCode: string;
  psgcProvinceCode: string;
  psgcMunicipalityCode: string;
  psgcMunicipalityName: string;
  psgcProvinceName: string;
  psgcRegionName: string;
  lastPsgcSync?: string;
  
  // Registered Barangays
  availableBarangays: PSGCBarangay[];
  
  // Classification Settings
  kindsOfProperty: KindOfPropertyConfig[];
  generalClasses: GeneralClassConfig[];
  
  // Defaults
  currencySymbol: string;
  defaultAreaUnit: 'sqm' | 'ha';
}

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'Municipal Assessor' | 'Assistant Assessor' | 'Appraiser' | 'Tax Mapper' | 'Records Officer' | 'Viewer';
  department: string;
  status: 'Active' | 'Inactive';
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  performedByName?: string;
  performedByRole?: string;
  action: 'CREATE' | 'UPDATE' | 'CANCEL' | 'SUPERSEDE' | 'DELETE' | 'DOCUMENT_UPLOAD' | 'SETTINGS_CHANGE' | 'LOGIN';
  targetTdNumber?: string;
  targetPin?: string;
  description: string;
  details?: string;
}

export type ActiveTab = 'dashboard' | 'properties' | 'lineage' | 'users' | 'settings' | 'audit-logs';

import { AppSettings, AuditLog, DocumentAttachment, GeneralClassConfig, KindOfPropertyConfig, TaxDeclaration, UserAccount } from '../types';

const STORAGE_KEYS = {
  TAX_DECLARATIONS: 'rpt_tax_declarations_v1',
  SETTINGS: 'rpt_settings_v1',
  USERS: 'rpt_users_v1',
  CURRENT_USER: 'rpt_current_user_v1',
  AUDIT_LOGS: 'rpt_audit_logs_v1',
};

const DEFAULT_KINDS_OF_PROPERTY: KindOfPropertyConfig[] = [
  { id: 'kop-1', name: 'Land', code: 'LND', description: 'Real agricultural, residential, commercial or industrial land parcel', isSystem: true },
  { id: 'kop-2', name: 'Building', code: 'BLD', description: 'Permanent structural improvements, houses, warehouses, office buildings', isSystem: true },
  { id: 'kop-3', name: 'Machinery', code: 'MCH', description: 'Industrial, manufacturing, and commercial machinery & equipment', isSystem: true },
  { id: 'kop-4', name: 'Improvement', code: 'IMP', description: 'Fences, pavements, pools, landscaping, civil works', isSystem: true },
  { id: 'kop-5', name: 'Special Class', code: 'SPC', description: 'Government, educational, hospital, and religious facilities', isSystem: true },
];

const DEFAULT_GENERAL_CLASSES: GeneralClassConfig[] = [
  { id: 'gc-1', name: 'Residential', code: 'RES', defaultAssessmentLevel: 20, description: 'Single-family homes, townhouses, residential lots', isSystem: true },
  { id: 'gc-2', name: 'Commercial', code: 'COM', defaultAssessmentLevel: 50, description: 'Retail shops, offices, malls, commercial complexes', isSystem: true },
  { id: 'gc-3', name: 'Industrial', code: 'IND', defaultAssessmentLevel: 50, description: 'Factories, processing plants, industrial warehouses', isSystem: true },
  { id: 'gc-4', name: 'Agricultural', code: 'AGR', defaultAssessmentLevel: 40, description: 'Farms, crop plantations, orchards, poultry', isSystem: true },
  { id: 'gc-5', name: 'Special', code: 'SPC', defaultAssessmentLevel: 10, description: 'Hospitals, cultural, scientific, public non-profit institutions', isSystem: true },
  { id: 'gc-6', name: 'Timberland', code: 'TMB', defaultAssessmentLevel: 20, description: 'Forestry and timberland concessions', isSystem: true },
  { id: 'gc-7', name: 'Mineral', code: 'MNR', defaultAssessmentLevel: 50, description: 'Mining and mineral extraction reservations', isSystem: true },
];

const DEFAULT_SETTINGS: AppSettings = {
  officeName: 'Office of the Municipal Assessor',
  lguName: 'Municipality of Taytay',
  provinceName: 'Province of Rizal',
  regionName: 'Region IV-A (CALABARZON)',
  municipalAssessor: 'Atty. Eduardo M. Santos, REA, REB',
  provincialAssessor: 'Engr. Carmela R. Valenzuela',
  appraiserName: 'Mark Lester G. Reyes, REA',
  taxMapperName: 'Glaiza P. Del Rosario, Geodetic Eng.',
  
  psgcRegionCode: '040000000',
  psgcRegionName: 'Region IV-A (CALABARZON)',
  psgcProvinceCode: '045800000',
  psgcProvinceName: 'Rizal',
  psgcMunicipalityCode: '045813000',
  psgcMunicipalityName: 'Taytay',
  
  availableBarangays: [
    { code: '045813001', name: 'Dolores (Poblacion)', municipalityCode: '045813000' },
    { code: '045813002', name: 'Muzon', municipalityCode: '045813000' },
    { code: '045813003', name: 'San Isidro', municipalityCode: '045813000' },
    { code: '045813004', name: 'San Juan', municipalityCode: '045813000' },
    { code: '045813005', name: 'Santa Ana', municipalityCode: '045813000' },
  ],
  
  kindsOfProperty: DEFAULT_KINDS_OF_PROPERTY,
  generalClasses: DEFAULT_GENERAL_CLASSES,
  
  currencySymbol: '₱',
  defaultAreaUnit: 'sqm',
};

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    username: 'assessor.admin',
    fullName: 'Atty. Eduardo M. Santos',
    email: 'e.santos@assessor.taytay.gov.ph',
    role: 'Municipal Assessor',
    department: 'Office of the Municipal Assessor',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-08-26 08:30 AM',
    createdAt: '2023-01-10',
  },
  {
    id: 'usr-2',
    username: 'appraiser.reyes',
    fullName: 'Mark Lester G. Reyes, REA',
    email: 'm.reyes@assessor.taytay.gov.ph',
    role: 'Appraiser',
    department: 'Appraisal & Assessment Division',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-08-25 04:15 PM',
    createdAt: '2023-03-15',
  },
  {
    id: 'usr-3',
    username: 'taxmapper.glaiza',
    fullName: 'Engr. Glaiza P. Del Rosario',
    email: 'g.delrosario@assessor.taytay.gov.ph',
    role: 'Tax Mapper',
    department: 'Tax Mapping Operations',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-08-26 09:00 AM',
    createdAt: '2023-06-01',
  },
  {
    id: 'usr-4',
    username: 'records.officer',
    fullName: 'Maria Cristina V. Alcantara',
    email: 'c.alcantara@assessor.taytay.gov.ph',
    role: 'Records Officer',
    department: 'Archives & Records Management',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    lastLogin: '2026-08-26 08:45 AM',
    createdAt: '2023-08-20',
  },
];

const DEFAULT_DOCUMENTS: DocumentAttachment[] = [
  {
    id: 'doc-1',
    name: 'Deed_of_Absolute_Sale_Notarized.pdf',
    type: 'Deed of Sale',
    size: 2450000,
    uploadDate: '2024-03-14',
    notes: 'Doc. No. 420; Page No. 85; Book No. XII; Series of 2024. Notary Public Atty. Ramon C. De Vera.',
  },
  {
    id: 'doc-2',
    name: 'TCT_No_184920_Certified_Copy.pdf',
    type: 'Title Copy',
    size: 1890000,
    uploadDate: '2024-03-15',
    notes: 'Electronic Certified True Copy from Registry of Deeds - Binangonan Branch.',
  },
  {
    id: 'doc-3',
    name: 'BIR_eCAR_No_040-2024-001923.pdf',
    type: 'eCAR / CAR',
    size: 980000,
    uploadDate: '2024-03-16',
    notes: 'Bureau of Internal Revenue Certificate Authorizing Registration RDO 046.',
  },
  {
    id: 'doc-4',
    name: 'Transfer_Tax_Receipt_LGU.pdf',
    type: 'Transfer Tax',
    size: 650000,
    uploadDate: '2024-03-18',
    notes: 'Official Receipt # 9812457 issued by Municipal Treasurer Office.',
  },
];

// High quality initial dataset with clear genealogy / history chain
const DEFAULT_TAX_DECLARATIONS: TaxDeclaration[] = [
  // 1. Ancestor / Grandfather Tax Dec (Cancelled)
  {
    id: 'td-001',
    tdNumber: 'TD-2018-04-001-00118',
    prevTdNumber: 'TD-2012-04-001-00084',
    pin: '024-04-0001-001-10',
    propertyState: 'CANCELLED',
    cancellationReason: 'Cancelled by virtue of Subdivision and Transfer of Title to heirs / buyer under TCT No. 184920.',
    cancelledDate: '2021-06-15',
    supersededByTdNumber: 'TD-2021-04-001-00452',
    
    firstName: 'Vicente',
    lastName: 'Villanueva',
    middleName: 'Santos',
    adminBusinessName: 'Villanueva Heritage Estate',
    taxpayerTin: '124-589-321-000',
    contactNumber: '0917-555-0192',
    
    address: '142 Rizal Avenue Extension',
    barangayCode: '045813001',
    barangayName: 'Dolores (Poblacion)',
    municipalityCode: '045813000',
    municipalityName: 'Taytay',
    provinceName: 'Rizal',
    
    titleNumber: 'OCT No. P-4521',
    lotNumber: 'Lot 10',
    surveyNumber: 'Psu-184520',
    area: 1200,
    areaUnit: 'sqm',
    unitValue: 4000,
    marketValue: 4800000,
    assessmentLevel: 20,
    assessedValue: 960000,
    
    kindOfProperty: 'Land',
    generalClass: 'Residential',
    actualUse: 'Residential / Ancestral Home',
    
    effectivityYear: 2018,
    effectivityQuarter: 1,
    assessmentDate: '2018-01-15',
    
    memoranda: 'ORIGINAL ANCESTRAL PARCEL: Subject to statutory lien under Sec. 4, Rule 74 of the Rules of Court for the period of two (2) years. Cancelled upon issuance of Partition Subdivision Plan (LRC) Psd-21940.',
    documents: [
      {
        id: 'doc-anc-1',
        name: 'Original_Certificate_Title_OCT_P-4521.pdf',
        type: 'Title Copy',
        size: 2100000,
        uploadDate: '2018-01-15',
        notes: 'Original decree recorded at RD Morong.',
      },
    ],
    approvedBy: 'Atty. Eduardo M. Santos',
    appraisedBy: 'Mark Lester G. Reyes, REA',
    taxMapper: 'Engr. Glaiza P. Del Rosario',
    createdAt: '2018-01-15',
    updatedAt: '2021-06-15',
    createdBy: 'assessor.admin',
  },

  // 2. Predecessor Tax Dec (Cancelled when sold & re-assessed in 2024)
  {
    id: 'td-002',
    tdNumber: 'TD-2021-04-001-00452',
    prevTdNumber: 'TD-2018-04-001-00118',
    pin: '024-04-0001-001-10A',
    propertyState: 'CANCELLED',
    cancellationReason: 'Cancelled by reason of Absolute Sale and General Revision under City Ordinance 2024-08.',
    cancelledDate: '2024-03-20',
    supersededByTdNumber: 'TD-2024-04-001-00892',
    
    firstName: 'Antonio',
    lastName: 'Villanueva',
    middleName: 'Castillo',
    adminBusinessName: '',
    taxpayerTin: '234-891-102-000',
    contactNumber: '0918-444-1290',
    
    address: '142-A Rizal Avenue, corner San Mateo St.',
    barangayCode: '045813001',
    barangayName: 'Dolores (Poblacion)',
    municipalityCode: '045813000',
    municipalityName: 'Taytay',
    provinceName: 'Rizal',
    
    titleNumber: 'TCT No. T-124901',
    lotNumber: 'Lot 10-A',
    surveyNumber: 'Psd-04-184520-A',
    area: 600,
    areaUnit: 'sqm',
    unitValue: 6500,
    marketValue: 3900000,
    assessmentLevel: 20,
    assessedValue: 780000,
    
    kindOfProperty: 'Land',
    generalClass: 'Residential',
    actualUse: 'Residential Vacant / House Construction',
    
    effectivityYear: 2021,
    effectivityQuarter: 3,
    assessmentDate: '2021-06-15',
    
    memoranda: 'Subdivided portion of Lot 10. Prior TD-2018-04-001-00118 cancelled. Mortgage annotated in favor of BDO Unibank cancelled under Entry #90214 dated 2023-11-04.',
    documents: [
      {
        id: 'doc-pred-1',
        name: 'TCT_124901_Partition_Deed.pdf',
        type: 'Title Copy',
        size: 1750000,
        uploadDate: '2021-06-15',
        notes: 'Partition deed with approved subdivision plan.',
      },
    ],
    approvedBy: 'Atty. Eduardo M. Santos',
    appraisedBy: 'Mark Lester G. Reyes, REA',
    taxMapper: 'Engr. Glaiza P. Del Rosario',
    createdAt: '2021-06-15',
    updatedAt: '2024-03-20',
    createdBy: 'appraiser.reyes',
  },

  // 3. CURRENT Active Tax Dec (Linked to TD-2021-04-001-00452)
  {
    id: 'td-003',
    tdNumber: 'TD-2024-04-001-00892',
    prevTdNumber: 'TD-2021-04-001-00452',
    pin: '024-04-0001-001-10A-01',
    propertyState: 'CURRENT',
    
    firstName: 'Mateo',
    lastName: 'Guerrero',
    middleName: 'Lim',
    adminBusinessName: 'M. Lim & Associates Development Corp.',
    taxpayerTin: '441-209-883-000',
    contactNumber: '0917-882-9901',
    
    address: '142-A Rizal Avenue, corner San Mateo St.',
    barangayCode: '045813001',
    barangayName: 'Dolores (Poblacion)',
    municipalityCode: '045813000',
    municipalityName: 'Taytay',
    provinceName: 'Rizal',
    
    titleNumber: 'TCT No. 184920',
    lotNumber: 'Lot 10-A-1',
    surveyNumber: 'Psd-04-2024-00412',
    blockNumber: 'Blk 3',
    area: 600,
    areaUnit: 'sqm',
    unitValue: 9500,
    marketValue: 5700000,
    assessmentLevel: 20,
    assessedValue: 1140000,
    
    kindOfProperty: 'Land',
    generalClass: 'Residential',
    actualUse: 'Residential Two-Storey Single Detached',
    
    effectivityYear: 2024,
    effectivityQuarter: 2,
    assessmentDate: '2024-03-20',
    
    memoranda: 'CURRENT TAX DECLARATION: Issued by virtue of Deed of Absolute Sale executed on March 14, 2024 by Antonio V. Villanueva in favor of Mateo Lim Guerrero married to Sofia Chan Guerrero. CAR No. 040-2024-001923 issued by BIR RDO 046. Transfer Tax paid under O.R. No. 9812457 dated March 18, 2024. Prior TD-2021-04-001-00452 hereby CANCELLED and superseded.',
    documents: DEFAULT_DOCUMENTS,
    approvedBy: 'Atty. Eduardo M. Santos',
    appraisedBy: 'Mark Lester G. Reyes, REA',
    taxMapper: 'Engr. Glaiza P. Del Rosario',
    createdAt: '2024-03-20',
    updatedAt: '2024-03-20',
    createdBy: 'assessor.admin',
  },

  // 4. Commercial Building / Complex (Current)
  {
    id: 'td-004',
    tdNumber: 'TD-2024-04-003-01055',
    prevTdNumber: 'TD-2019-04-003-00512',
    pin: '024-04-0003-012-05-B',
    propertyState: 'CURRENT',
    
    firstName: 'Catalina',
    lastName: 'Tan-Rodriguez',
    middleName: 'Sy',
    adminBusinessName: 'San Isidro Commercial Plaza & Leasing Inc.',
    taxpayerTin: '009-432-111-000',
    contactNumber: '0919-333-8822',
    
    address: 'Km. 22 Manila East Road, Brgy. San Isidro',
    barangayCode: '045813003',
    barangayName: 'San Isidro',
    municipalityCode: '045813000',
    municipalityName: 'Taytay',
    provinceName: 'Rizal',
    
    titleNumber: 'TCT No. 201-99812',
    lotNumber: 'Lot 5-B',
    surveyNumber: 'Pcs-04-009182',
    area: 1850,
    areaUnit: 'sqm',
    unitValue: 18000,
    marketValue: 33300000,
    assessmentLevel: 50,
    assessedValue: 16650000,
    
    kindOfProperty: 'Building',
    generalClass: 'Commercial',
    actualUse: 'Commercial 3-Storey Retail & Office Building',
    
    effectivityYear: 2024,
    effectivityQuarter: 1,
    assessmentDate: '2024-01-10',
    
    memoranda: 'Assessment on 3-Storey Reinforced Concrete Commercial Building with Occupancy Permit No. 2023-OP-0442 issued by Office of the Building Official. Real Property Tax paid updated for current taxable year.',
    documents: [
      {
        id: 'doc-com-1',
        name: 'Building_Occupancy_Permit_2023.pdf',
        type: 'Other',
        size: 3200000,
        uploadDate: '2024-01-10',
        notes: 'Approved architectural floor plans and building evaluation sheet.',
      },
    ],
    approvedBy: 'Atty. Eduardo M. Santos',
    appraisedBy: 'Mark Lester G. Reyes, REA',
    taxMapper: 'Engr. Glaiza P. Del Rosario',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
    createdBy: 'assessor.admin',
  },

  // 5. Agricultural Land Parcel (Current)
  {
    id: 'td-005',
    tdNumber: 'TD-2023-04-002-00318',
    prevTdNumber: '',
    pin: '024-04-0002-045-02',
    propertyState: 'CURRENT',
    
    firstName: 'Bernardo',
    lastName: 'Pascual',
    middleName: 'Ramos',
    adminBusinessName: 'Pascual Organic Farm Cooperative',
    taxpayerTin: '312-764-908-000',
    contactNumber: '0920-111-4433',
    
    address: 'Sitio Bato-Bato, Muzon',
    barangayCode: '045813002',
    barangayName: 'Muzon',
    municipalityCode: '045813000',
    municipalityName: 'Taytay',
    provinceName: 'Rizal',
    
    titleNumber: 'OCT No. 04-9812',
    lotNumber: 'Lot 245',
    surveyNumber: 'Cad-688-D',
    area: 2.5,
    areaUnit: 'ha',
    unitValue: 800000, // per ha
    marketValue: 2000000,
    assessmentLevel: 40,
    assessedValue: 800000,
    
    kindOfProperty: 'Land',
    generalClass: 'Agricultural',
    actualUse: 'Agricultural - Fruit Orchard & Lowland Crops',
    
    effectivityYear: 2023,
    effectivityQuarter: 1,
    assessmentDate: '2023-02-18',
    
    memoranda: 'Covered under DAR Certificate of Land Ownership Award (CLOA) No. 00812948. Agricultural land classification strictly observed pursuant to RA 7160.',
    documents: [
      {
        id: 'doc-agr-1',
        name: 'DAR_CLOA_Certificate_00812948.pdf',
        type: 'Title Copy',
        size: 1600000,
        uploadDate: '2023-02-18',
        notes: 'Department of Agrarian Reform Registered CLOA.',
      },
    ],
    approvedBy: 'Atty. Eduardo M. Santos',
    appraisedBy: 'Mark Lester G. Reyes, REA',
    taxMapper: 'Engr. Glaiza P. Del Rosario',
    createdAt: '2023-02-18',
    updatedAt: '2023-02-18',
    createdBy: 'appraiser.reyes',
  },

  // 6. Industrial Machinery & Warehouse (Current)
  {
    id: 'td-006',
    tdNumber: 'TD-2024-04-004-00712',
    prevTdNumber: 'TD-2020-04-004-00388',
    pin: '024-04-0004-088-12-M',
    propertyState: 'CURRENT',
    
    firstName: 'Franklin',
    lastName: 'Chua',
    middleName: 'Ang',
    adminBusinessName: 'Apex Textile & Garments Manufacturing Corp.',
    taxpayerTin: '004-912-456-000',
    contactNumber: '0917-300-9988',
    
    address: 'San Juan Industrial Compound, Hi-way 2000',
    barangayCode: '045813004',
    barangayName: 'San Juan',
    municipalityCode: '045813000',
    municipalityName: 'Taytay',
    provinceName: 'Rizal',
    
    titleNumber: 'TCT No. T-309412',
    lotNumber: 'Lot 12-Industrial',
    surveyNumber: 'Psd-04-098124',
    area: 3200,
    areaUnit: 'sqm',
    unitValue: 12000,
    marketValue: 38400000,
    assessmentLevel: 50,
    assessedValue: 19200000,
    
    kindOfProperty: 'Machinery',
    generalClass: 'Industrial',
    actualUse: 'Industrial Weaving, Dyeing & Boiler Equipment Plant',
    
    effectivityYear: 2024,
    effectivityQuarter: 1,
    assessmentDate: '2024-01-25',
    
    memoranda: 'Assessment covers High-Pressure Steam Boiler (500 HP), Automated Weaving Looms, and Textile Finishing Systems installed pursuant to SEC Registration CS20081298.',
    documents: [],
    approvedBy: 'Atty. Eduardo M. Santos',
    appraisedBy: 'Mark Lester G. Reyes, REA',
    taxMapper: 'Engr. Glaiza P. Del Rosario',
    createdAt: '2024-01-25',
    updatedAt: '2024-01-25',
    createdBy: 'assessor.admin',
  },
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2024-03-20 10:45 AM',
    userId: 'usr-1',
    userName: 'Atty. Eduardo M. Santos',
    action: 'SUPERSEDE',
    targetTdNumber: 'TD-2024-04-001-00892',
    description: 'Issued TD-2024-04-001-00892 superseding TD-2021-04-001-00452 (Owner transferred to Mateo L. Guerrero). Old TD status updated to CANCELLED.',
  },
  {
    id: 'log-2',
    timestamp: '2024-03-20 09:15 AM',
    userId: 'usr-4',
    userName: 'Maria Cristina V. Alcantara',
    action: 'DOCUMENT_UPLOAD',
    targetTdNumber: 'TD-2024-04-001-00892',
    description: 'Uploaded 4 supporting legal documents (Deed of Sale, TCT 184920, BIR eCAR, Transfer Tax Receipt).',
  },
  {
    id: 'log-3',
    timestamp: '2024-01-25 02:20 PM',
    userId: 'usr-1',
    userName: 'Atty. Eduardo M. Santos',
    action: 'CREATE',
    targetTdNumber: 'TD-2024-04-004-00712',
    description: 'Created new Industrial Machinery assessment TD-2024-04-004-00712 for Apex Textile & Garments Mfg.',
  },
];

export const storageService = {
  getTaxDeclarations(): TaxDeclaration[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TAX_DECLARATIONS);
    if (!raw) {
      this.saveTaxDeclarations(DEFAULT_TAX_DECLARATIONS);
      return DEFAULT_TAX_DECLARATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_TAX_DECLARATIONS;
    }
  },

  saveTaxDeclarations(declarations: TaxDeclaration[]): void {
    localStorage.setItem(STORAGE_KEYS.TAX_DECLARATIONS, JSON.stringify(declarations));
  },

  getSettings(): AppSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      this.saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getUsers(): UserAccount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      this.saveUsers(DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USERS;
    }
  },

  saveUsers(users: UserAccount[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser(): UserAccount {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      const defaultUser = DEFAULT_USERS[0];
      this.saveCurrentUser(defaultUser);
      return defaultUser;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USERS[0];
    }
  },

  saveCurrentUser(user: UserAccount): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getAuditLogs(): AuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) {
      this.saveAuditLogs(DEFAULT_AUDIT_LOGS);
      return DEFAULT_AUDIT_LOGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_AUDIT_LOGS;
    }
  },

  saveAuditLogs(logs: AuditLog[]): void {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };
    const updated = [newLog, ...logs];
    this.saveAuditLogs(updated);
    return newLog;
  },

  resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.TAX_DECLARATIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  },
};

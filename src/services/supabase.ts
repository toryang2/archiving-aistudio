import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TaxDeclaration, AppSettings, UserAccount, AuditLog } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
}

const SUPABASE_CONFIG_KEY = 'rpt_supabase_config_v1';

export class SupabaseIntegrationService {
  private client: SupabaseClient | null = null;
  private config: SupabaseConfig = {
    url: '',
    anonKey: '',
    autoSync: false,
  };

  constructor() {
    this.loadConfig();
  }

  public loadConfig(): SupabaseConfig {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      try {
        this.config = JSON.parse(raw);
        if (this.config.url && this.config.anonKey) {
          this.initClient(this.config.url, this.config.anonKey);
        }
      } catch (err) {
        console.error('Failed to parse Supabase config', err);
      }
    }
    return this.config;
  }

  public saveConfig(config: SupabaseConfig): boolean {
    this.config = config;
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
    if (config.url && config.anonKey) {
      return this.initClient(config.url, config.anonKey);
    } else {
      this.client = null;
      return false;
    }
  }

  public clearConfig(): void {
    this.config = { url: '', anonKey: '', autoSync: false };
    this.client = null;
    localStorage.removeItem(SUPABASE_CONFIG_KEY);
  }

  public getConfig(): SupabaseConfig {
    return { ...this.config };
  }

  public isConnected(): boolean {
    return !!(this.client && this.config.url && this.config.anonKey);
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  private initClient(url: string, anonKey: string): boolean {
    try {
      const cleanUrl = url.trim().replace(/\/$/, '');
      const cleanKey = anonKey.trim();
      if (!cleanUrl || !cleanKey) {
        this.client = null;
        return false;
      }
      this.client = createClient(cleanUrl, cleanKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return true;
    } catch (e) {
      console.error('Error initializing Supabase client:', e);
      this.client = null;
      return false;
    }
  }

  /**
   * Tests the connection to the Supabase database and checks if tables exist.
   */
  public async testConnection(url?: string, key?: string): Promise<{
    success: boolean;
    message: string;
    missingTables?: string[];
  }> {
    try {
      let testClient = this.client;
      if (url && key) {
        testClient = createClient(url.trim(), key.trim());
      }

      if (!testClient) {
        return {
          success: false,
          message: 'Supabase client is not configured. Provide Project URL and Anon API Key.',
        };
      }

      // Check access to tax_declarations table
      const { error: tdError } = await testClient
        .from('tax_declarations')
        .select('id')
        .limit(1);

      if (tdError) {
        // Table might not exist or bad credentials
        if (tdError.code === '42P01' || tdError.message?.toLowerCase().includes('relation') || tdError.message?.toLowerCase().includes('does not exist')) {
          return {
            success: true,
            message: 'Connected to Supabase project! Database tables need to be created using the provided SQL schema script.',
            missingTables: ['tax_declarations', 'app_settings', 'user_accounts', 'audit_logs'],
          };
        }
        return {
          success: false,
          message: `Connection failed: ${tdError.message} (${tdError.code || 'UNKNOWN'})`,
        };
      }

      return {
        success: true,
        message: 'Successfully connected and verified Supabase tax_declarations table!',
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Connection error: ${errorMsg}`,
      };
    }
  }

  /**
   * Pull all records from Supabase into local memory
   */
  public async pullAll(): Promise<{
    success: boolean;
    taxDeclarations?: TaxDeclaration[];
    settings?: AppSettings;
    users?: UserAccount[];
    auditLogs?: AuditLog[];
    message: string;
  }> {
    if (!this.client) {
      return { success: false, message: 'Supabase client is not connected.' };
    }

    try {
      const results: {
        taxDeclarations?: TaxDeclaration[];
        settings?: AppSettings;
        users?: UserAccount[];
        auditLogs?: AuditLog[];
      } = {};

      // 1. Fetch tax declarations
      const { data: tdData, error: tdError } = await this.client
        .from('tax_declarations')
        .select('*')
        .order('created_at', { ascending: false });

      if (tdError) throw tdError;

      if (tdData) {
        results.taxDeclarations = tdData.map((row: any) => ({
          id: row.id,
          tdNumber: row.td_number,
          prevTdNumber: row.prev_td_number || '',
          pin: row.pin,
          propertyState: row.property_state,
          cancellationReason: row.cancellation_reason || undefined,
          cancelledDate: row.cancelled_date || undefined,
          supersededByTdNumber: row.superseded_by_td_number || undefined,
          firstName: row.first_name,
          lastName: row.last_name,
          middleName: row.middle_name || undefined,
          adminBusinessName: row.admin_business_name || undefined,
          taxpayerTin: row.taxpayer_tin || undefined,
          contactNumber: row.contact_number || undefined,
          address: row.address,
          barangayCode: row.barangay_code,
          barangayName: row.barangay_name,
          municipalityCode: row.municipality_code || undefined,
          municipalityName: row.municipality_name || undefined,
          provinceName: row.province_name || undefined,
          titleNumber: row.title_number || '',
          lotNumber: row.lot_number || '',
          surveyNumber: row.survey_number || '',
          blockNumber: row.block_number || undefined,
          area: Number(row.area) || 0,
          areaUnit: row.area_unit || 'sqm',
          unitValue: row.unit_value ? Number(row.unit_value) : undefined,
          marketValue: Number(row.market_value) || 0,
          assessmentLevel: Number(row.assessment_level) || 0,
          assessedValue: Number(row.assessed_value) || 0,
          kindOfProperty: row.kind_of_property,
          generalClass: row.general_class,
          actualUse: row.actual_use || undefined,
          effectivityYear: Number(row.effectivity_year) || new Date().getFullYear(),
          effectivityQuarter: row.effectivity_quarter || 1,
          assessmentDate: row.assessment_date,
          memoranda: row.memoranda || '',
          documents: row.documents || [],
          approvedBy: row.approved_by || undefined,
          appraisedBy: row.appraised_by || undefined,
          taxMapper: row.tax_mapper || undefined,
          createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          updatedAt: row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          createdBy: row.created_by || 'system',
        }));
      }

      // 2. Fetch settings
      const { data: settingsData } = await this.client
        .from('app_settings')
        .select('*')
        .eq('id', 'global')
        .maybeSingle();

      if (settingsData && settingsData.config) {
        results.settings = settingsData.config;
      }

      // 3. Fetch users
      const { data: usersData } = await this.client
        .from('user_accounts')
        .select('*')
        .order('created_at', { ascending: true });

      if (usersData) {
        results.users = usersData.map((u: any) => ({
          id: u.id,
          username: u.username,
          fullName: u.full_name,
          email: u.email,
          role: u.role,
          department: u.department,
          status: u.status,
          avatar: u.avatar || undefined,
          lastLogin: u.last_login || undefined,
          createdAt: u.created_at || new Date().toISOString().split('T')[0],
        }));
      }

      // 4. Fetch audit logs
      const { data: auditData } = await this.client
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(200);

      if (auditData) {
        results.auditLogs = auditData.map((a: any) => ({
          id: a.id,
          timestamp: a.timestamp,
          userId: a.user_id,
          userName: a.user_name,
          action: a.action,
          targetTdNumber: a.target_td_number || undefined,
          targetPin: a.target_pin || undefined,
          description: a.description,
          details: a.details || undefined,
        }));
      }

      return {
        success: true,
        ...results,
        message: `Successfully loaded ${results.taxDeclarations?.length || 0} tax declarations from Supabase.`,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Failed to pull from Supabase: ${errorMsg}`,
      };
    }
  }

  /**
   * Push local state to Supabase database (Upsert)
   */
  public async pushAll(payload: {
    taxDeclarations: TaxDeclaration[];
    settings: AppSettings;
    users: UserAccount[];
    auditLogs: AuditLog[];
  }): Promise<{ success: boolean; message: string }> {
    if (!this.client) {
      return { success: false, message: 'Supabase client is not connected.' };
    }

    try {
      // 1. Upsert Tax Declarations
      if (payload.taxDeclarations.length > 0) {
        const rows = payload.taxDeclarations.map((td) => ({
          id: td.id,
          td_number: td.tdNumber,
          prev_td_number: td.prevTdNumber || null,
          pin: td.pin,
          property_state: td.propertyState,
          cancellation_reason: td.cancellationReason || null,
          cancelled_date: td.cancelledDate || null,
          superseded_by_td_number: td.supersededByTdNumber || null,
          first_name: td.firstName,
          last_name: td.lastName,
          middle_name: td.middleName || null,
          admin_business_name: td.adminBusinessName || null,
          taxpayer_tin: td.taxpayerTin || null,
          contact_number: td.contactNumber || null,
          address: td.address,
          barangay_code: td.barangayCode,
          barangay_name: td.barangayName,
          municipality_code: td.municipalityCode || null,
          municipality_name: td.municipalityName || null,
          province_name: td.provinceName || null,
          title_number: td.titleNumber || '',
          lot_number: td.lotNumber || '',
          survey_number: td.surveyNumber || '',
          block_number: td.blockNumber || null,
          area: td.area,
          area_unit: td.areaUnit,
          unit_value: td.unitValue || null,
          market_value: td.marketValue,
          assessment_level: td.assessmentLevel,
          assessed_value: td.assessedValue,
          kind_of_property: td.kindOfProperty,
          general_class: td.generalClass,
          actual_use: td.actualUse || null,
          effectivity_year: td.effectivityYear,
          effectivity_quarter: td.effectivityQuarter || 1,
          assessment_date: td.assessmentDate,
          memoranda: td.memoranda || '',
          documents: td.documents || [],
          approved_by: td.approvedBy || null,
          appraised_by: td.appraisedBy || null,
          tax_mapper: td.taxMapper || null,
          created_by: td.createdBy || 'system',
          updated_at: new Date().toISOString(),
        }));

        const { error: tdErr } = await this.client
          .from('tax_declarations')
          .upsert(rows, { onConflict: 'id' });

        if (tdErr) throw tdErr;
      }

      // 2. Upsert Settings
      const { error: setErr } = await this.client
        .from('app_settings')
        .upsert(
          {
            id: 'global',
            config: payload.settings,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (setErr) throw setErr;

      // 3. Upsert Users
      if (payload.users.length > 0) {
        const userRows = payload.users.map((u) => ({
          id: u.id,
          username: u.username,
          full_name: u.fullName,
          email: u.email,
          role: u.role,
          department: u.department,
          status: u.status,
          avatar: u.avatar || null,
          last_login: u.lastLogin || null,
        }));

        const { error: userErr } = await this.client
          .from('user_accounts')
          .upsert(userRows, { onConflict: 'id' });

        if (userErr) throw userErr;
      }

      // 4. Upsert Logs
      if (payload.auditLogs.length > 0) {
        const logRows = payload.auditLogs.slice(0, 100).map((l) => ({
          id: l.id,
          timestamp: l.timestamp,
          user_id: l.userId,
          user_name: l.userName,
          action: l.action,
          target_td_number: l.targetTdNumber || null,
          target_pin: l.targetPin || null,
          description: l.description,
          details: l.details || null,
        }));

        const { error: logErr } = await this.client
          .from('audit_logs')
          .upsert(logRows, { onConflict: 'id' });

        if (logErr) console.warn('Could not sync logs to Supabase:', logErr);
      }

      return {
        success: true,
        message: `Successfully pushed ${payload.taxDeclarations.length} records and configuration to Supabase.`,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Failed to push data to Supabase: ${errorMsg}`,
      };
    }
  }

  /**
   * Sync a single Tax Declaration upsert in real-time
   */
  public async upsertTaxDeclaration(td: TaxDeclaration): Promise<boolean> {
    if (!this.client) return false;
    try {
      const row = {
        id: td.id,
        td_number: td.tdNumber,
        prev_td_number: td.prevTdNumber || null,
        pin: td.pin,
        property_state: td.propertyState,
        cancellation_reason: td.cancellationReason || null,
        cancelled_date: td.cancelledDate || null,
        superseded_by_td_number: td.supersededByTdNumber || null,
        first_name: td.firstName,
        last_name: td.lastName,
        middle_name: td.middleName || null,
        admin_business_name: td.adminBusinessName || null,
        taxpayer_tin: td.taxpayerTin || null,
        contact_number: td.contactNumber || null,
        address: td.address,
        barangay_code: td.barangayCode,
        barangay_name: td.barangayName,
        municipality_code: td.municipalityCode || null,
        municipality_name: td.municipalityName || null,
        province_name: td.provinceName || null,
        title_number: td.titleNumber || '',
        lot_number: td.lotNumber || '',
        survey_number: td.surveyNumber || '',
        block_number: td.blockNumber || null,
        area: td.area,
        area_unit: td.areaUnit,
        unit_value: td.unitValue || null,
        market_value: td.marketValue,
        assessment_level: td.assessmentLevel,
        assessed_value: td.assessedValue,
        kind_of_property: td.kindOfProperty,
        general_class: td.generalClass,
        actual_use: td.actualUse || null,
        effectivity_year: td.effectivityYear,
        effectivity_quarter: td.effectivityQuarter || 1,
        assessment_date: td.assessmentDate,
        memoranda: td.memoranda || '',
        documents: td.documents || [],
        approved_by: td.approvedBy || null,
        appraised_by: td.appraisedBy || null,
        tax_mapper: td.taxMapper || null,
        created_by: td.createdBy || 'system',
        updated_at: new Date().toISOString(),
      };

      const { error } = await this.client
        .from('tax_declarations')
        .upsert(row, { onConflict: 'id' });

      if (error) {
        console.error('Error syncing TD to Supabase:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error in upsertTaxDeclaration:', e);
      return false;
    }
  }

  /**
   * Delete a single Tax Declaration in real-time
   */
  public async deleteTaxDeclaration(id: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      const { error } = await this.client
        .from('tax_declarations')
        .delete()
        .eq('id', id);
      return !error;
    } catch (e) {
      console.error('Error deleting from Supabase:', e);
      return false;
    }
  }

  /**
   * Generate the official PostgreSQL / Supabase Schema SQL script
   */
  public getSqlMigrationScript(): string {
    return `-- =========================================================================
-- REAL PROPERTY TAX DECLARATION ARCHIVE & ASSESSMENT SYSTEM
-- SUPABASE POSTGRESQL DATABASE SCHEMA & MIGRATION SCRIPT
-- =========================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Tax Declarations table
CREATE TABLE IF NOT EXISTS public.tax_declarations (
    id TEXT PRIMARY KEY,
    td_number TEXT NOT NULL UNIQUE,
    prev_td_number TEXT,
    pin TEXT NOT NULL,
    property_state TEXT NOT NULL DEFAULT 'CURRENT' CHECK (property_state IN ('CURRENT', 'CANCELLED')),
    cancellation_reason TEXT,
    cancelled_date DATE,
    superseded_by_td_number TEXT,
    
    -- Owner Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    admin_business_name TEXT,
    taxpayer_tin TEXT,
    contact_number TEXT,
    
    -- Location & Cadastral
    address TEXT NOT NULL,
    barangay_code TEXT NOT NULL,
    barangay_name TEXT NOT NULL,
    municipality_code TEXT,
    municipality_name TEXT,
    province_name TEXT,
    
    -- Title & Survey
    title_number TEXT,
    lot_number TEXT,
    survey_number TEXT,
    block_number TEXT,
    
    -- Valuation & Assessment
    area NUMERIC NOT NULL,
    area_unit TEXT NOT NULL DEFAULT 'sqm',
    unit_value NUMERIC,
    market_value NUMERIC NOT NULL,
    assessment_level NUMERIC NOT NULL,
    assessed_value NUMERIC NOT NULL,
    
    -- Classification
    kind_of_property TEXT NOT NULL,
    general_class TEXT NOT NULL,
    actual_use TEXT,
    
    -- Dates & Signatories
    effectivity_year INTEGER NOT NULL,
    effectivity_quarter INTEGER DEFAULT 1,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    memoranda TEXT,
    
    -- Attachments (JSONB format)
    documents JSONB DEFAULT '[]'::jsonb,
    
    -- Approvals & Metadata
    approved_by TEXT,
    appraised_by TEXT,
    tax_mapper TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning-fast querying and genealogy lookups
CREATE INDEX IF NOT EXISTS idx_td_number ON public.tax_declarations(td_number);
CREATE INDEX IF NOT EXISTS idx_prev_td_number ON public.tax_declarations(prev_td_number);
CREATE INDEX IF NOT EXISTS idx_pin ON public.tax_declarations(pin);
CREATE INDEX IF NOT EXISTS idx_property_state ON public.tax_declarations(property_state);
CREATE INDEX IF NOT EXISTS idx_owner_name ON public.tax_declarations(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_barangay ON public.tax_declarations(barangay_name);

-- 3. App Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY,
    config JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Accounts Table
CREATE TABLE IF NOT EXISTS public.user_accounts (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    avatar TEXT,
    last_login TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    target_td_number TEXT,
    target_pin TEXT,
    description TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS) & Public Access Policies for Anon Key
ALTER TABLE public.tax_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon key full CRUD access (can be restricted per role if using Supabase Auth)
CREATE POLICY "Allow all operations for public/anon on tax_declarations" 
ON public.tax_declarations FOR ALL 
TO anon, authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for public/anon on app_settings" 
ON public.app_settings FOR ALL 
TO anon, authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for public/anon on user_accounts" 
ON public.user_accounts FOR ALL 
TO anon, authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for public/anon on audit_logs" 
ON public.audit_logs FOR ALL 
TO anon, authenticated 
USING (true) WITH CHECK (true);
`;
  }
}

export const supabaseService = new SupabaseIntegrationService();

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  TaxDeclaration, 
  AppSettings, 
  UserAccount, 
  AuditLog, 
  ActiveTab, 
  DocumentAttachment,
  KindOfPropertyConfig,
  GeneralClassConfig,
  PSGCBarangay
} from '../types';
import { storageService } from '../services/storage';
import { supabaseService, SupabaseConfig } from '../services/supabase';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface FilterOptions {
  status: 'ALL' | 'CURRENT' | 'CANCELLED';
  barangay: string;
  kindOfProperty: string;
  generalClass: string;
  searchQuery: string;
  year: string;
}

interface AppContextType {
  // Navigation & Tabs
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Tax Declarations
  taxDeclarations: TaxDeclaration[];
  selectedProperty: TaxDeclaration | null;
  setSelectedProperty: (property: TaxDeclaration | null) => void;
  createTaxDeclaration: (data: Omit<TaxDeclaration, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => TaxDeclaration;
  updateTaxDeclaration: (id: string, data: Partial<TaxDeclaration>) => void;
  deleteTaxDeclaration: (id: string) => void;
  cancelTaxDeclaration: (id: string, reason: string) => void;
  supersedeTaxDeclaration: (oldId: string, newDraft: Partial<TaxDeclaration>) => TaxDeclaration;
  
  // Documents
  addDocumentToProperty: (propertyId: string, doc: Omit<DocumentAttachment, 'id' | 'uploadDate'>) => void;
  deleteDocumentFromProperty: (propertyId: string, docId: string) => void;
  
  // Lineage helpers
  getPropertyLineage: (propertyIdOrTd: string) => {
    current: TaxDeclaration | null;
    ancestors: TaxDeclaration[];
    descendants: TaxDeclaration[];
  };
  
  // Filters & Search
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  
  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateBarangays: (barangays: PSGCBarangay[]) => void;
  addKindOfProperty: (kind: Omit<KindOfPropertyConfig, 'id'>) => void;
  deleteKindOfProperty: (id: string) => void;
  addGeneralClass: (generalClass: Omit<GeneralClassConfig, 'id'>) => void;
  deleteGeneralClass: (id: string) => void;
  
  // Users & Auth
  users: UserAccount[];
  currentUser: UserAccount;
  loginUser: (username: string) => boolean;
  switchUser: (userId: string) => void;
  addUser: (user: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, data: Partial<UserAccount>) => void;
  deleteUser: (id: string) => void;
  
  // Audit Logs
  auditLogs: AuditLog[];
  
  // Toasts
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  
  // System Tools
  resetData: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonString: string) => boolean;

  // Supabase Cloud Database Integration
  isSupabaseConnected: boolean;
  supabaseConfig: { url: string; anonKey: string; autoSync: boolean };
  saveSupabaseConfig: (config: { url: string; anonKey: string; autoSync: boolean }) => boolean;
  clearSupabaseConfig: () => void;
  syncToSupabase: () => Promise<{ success: boolean; message: string }>;
  pullFromSupabase: () => Promise<{ success: boolean; message: string }>;
  testSupabaseConnection: (url?: string, key?: string) => Promise<{ success: boolean; message: string; missingTables?: string[] }>;
  isSyncingSupabase: boolean;
}

const initialFilters: FilterOptions = {
  status: 'ALL',
  barangay: '',
  kindOfProperty: '',
  generalClass: '',
  searchQuery: '',
  year: '',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [taxDeclarations, setTaxDeclarations] = useState<TaxDeclaration[]>(() => storageService.getTaxDeclarations());
  const [selectedProperty, setSelectedProperty] = useState<TaxDeclaration | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [users, setUsers] = useState<UserAccount[]>(() => storageService.getUsers());
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => storageService.getCurrentUser());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storageService.getAuditLogs());
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Supabase State
  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig>(() => supabaseService.getConfig());
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(() => supabaseService.isConnected());
  const [isSyncingSupabase, setIsSyncingSupabase] = useState<boolean>(false);

  // Keep local storage in sync
  useEffect(() => {
    storageService.saveTaxDeclarations(taxDeclarations);
  }, [taxDeclarations]);

  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storageService.saveUsers(users);
  }, [users]);

  useEffect(() => {
    storageService.saveCurrentUser(currentUser);
  }, [currentUser]);

  // Check initial connection and optionally auto-pull
  useEffect(() => {
    const config = supabaseService.getConfig();
    if (config.url && config.anonKey) {
      setIsSupabaseConnected(true);
      if (config.autoSync) {
        // Auto-pull initial data quietly
        supabaseService.pullAll().then((res) => {
          if (res.success) {
            if (res.taxDeclarations && res.taxDeclarations.length > 0) {
              setTaxDeclarations(res.taxDeclarations);
            }
            if (res.settings) setSettings(res.settings);
            if (res.users && res.users.length > 0) setUsers(res.users);
            if (res.auditLogs && res.auditLogs.length > 0) setAuditLogs(res.auditLogs);
          }
        }).catch(err => console.error('Supabase auto-pull error:', err));
      }
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Tax Declarations CRUD
  const createTaxDeclaration = (data: Omit<TaxDeclaration, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): TaxDeclaration => {
    const newId = 'td-' + Date.now();
    const nowStr = new Date().toISOString().split('T')[0];
    
    // Automatic Property State check:
    // If a previous TD is indicated and the new one is CURRENT, mark previous TD as CANCELLED!
    let updatedDeclarations = [...taxDeclarations];
    
    if (data.prevTdNumber && data.prevTdNumber.trim() !== '') {
      const prevIdx = updatedDeclarations.findIndex(
        (t) => t.tdNumber.toLowerCase().trim() === data.prevTdNumber?.toLowerCase().trim()
      );
      if (prevIdx !== -1) {
        const prevTd = updatedDeclarations[prevIdx];
        updatedDeclarations[prevIdx] = {
          ...prevTd,
          propertyState: 'CANCELLED',
          cancelledDate: data.assessmentDate || nowStr,
          supersededByTdNumber: data.tdNumber,
          cancellationReason: `Cancelled and superseded by Tax Declaration No. ${data.tdNumber} upon transfer/re-assessment.`,
          updatedAt: nowStr,
        };
        storageService.addAuditLog({
          userId: currentUser.id,
          userName: currentUser.fullName,
          action: 'CANCEL',
          targetTdNumber: prevTd.tdNumber,
          description: `Automatically marked ${prevTd.tdNumber} as CANCELLED because it was superseded by new ${data.tdNumber}.`,
        });
      }
    }

    const newRecord: TaxDeclaration = {
      ...data,
      id: newId,
      createdAt: nowStr,
      updatedAt: nowStr,
      createdBy: currentUser.username,
    };

    updatedDeclarations = [newRecord, ...updatedDeclarations];
    setTaxDeclarations(updatedDeclarations);

    // Sync to Supabase in real-time if connected & autoSync
    if (supabaseService.isConnected() && supabaseConfig.autoSync) {
      supabaseService.upsertTaxDeclaration(newRecord);
    }

    storageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      action: 'CREATE',
      targetTdNumber: newRecord.tdNumber,
      description: `Created new Tax Declaration ${newRecord.tdNumber} for ${newRecord.lastName}, ${newRecord.firstName} (PIN: ${newRecord.pin}).`,
    });

    setAuditLogs(storageService.getAuditLogs());
    showToast(`Tax Declaration ${newRecord.tdNumber} created successfully.`);
    return newRecord;
  };

  const updateTaxDeclaration = (id: string, data: Partial<TaxDeclaration>) => {
    const nowStr = new Date().toISOString().split('T')[0];
    let updatedDeclarations = [...taxDeclarations];
    const targetIdx = updatedDeclarations.findIndex((t) => t.id === id);
    
    if (targetIdx === -1) return;
    const currentRecord = updatedDeclarations[targetIdx];
    const mergedRecord = {
      ...currentRecord,
      ...data,
      updatedAt: nowStr,
    };

    // If prevTdNumber was changed/added, ensure linkage
    if (mergedRecord.prevTdNumber && mergedRecord.prevTdNumber !== currentRecord.prevTdNumber) {
      const prevIdx = updatedDeclarations.findIndex(
        (t) => t.tdNumber.toLowerCase().trim() === mergedRecord.prevTdNumber?.toLowerCase().trim()
      );
      if (prevIdx !== -1 && updatedDeclarations[prevIdx].propertyState === 'CURRENT') {
        updatedDeclarations[prevIdx] = {
          ...updatedDeclarations[prevIdx],
          propertyState: 'CANCELLED',
          cancelledDate: mergedRecord.assessmentDate || nowStr,
          supersededByTdNumber: mergedRecord.tdNumber,
          cancellationReason: `Cancelled and superseded by Tax Declaration No. ${mergedRecord.tdNumber}.`,
          updatedAt: nowStr,
        };
      }
    }

    updatedDeclarations[targetIdx] = mergedRecord;
    setTaxDeclarations(updatedDeclarations);

    // Sync to Supabase in real-time if connected & autoSync
    if (supabaseService.isConnected() && supabaseConfig.autoSync) {
      supabaseService.upsertTaxDeclaration(mergedRecord);
    }

    if (selectedProperty && selectedProperty.id === id) {
      setSelectedProperty(mergedRecord);
    }

    storageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      action: 'UPDATE',
      targetTdNumber: mergedRecord.tdNumber,
      description: `Updated details of Tax Declaration ${mergedRecord.tdNumber}.`,
    });

    setAuditLogs(storageService.getAuditLogs());
    showToast(`Tax Declaration ${mergedRecord.tdNumber} updated.`);
  };

  const deleteTaxDeclaration = (id: string) => {
    const target = taxDeclarations.find((t) => t.id === id);
    if (!target) return;

    setTaxDeclarations((prev) => prev.filter((t) => t.id !== id));
    if (selectedProperty?.id === id) {
      setSelectedProperty(null);
    }

    if (supabaseService.isConnected() && supabaseConfig.autoSync) {
      supabaseService.deleteTaxDeclaration(id);
    }

    storageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      action: 'DELETE',
      targetTdNumber: target.tdNumber,
      description: `Deleted Tax Declaration record ${target.tdNumber} (${target.lastName}, ${target.firstName}).`,
    });

    setAuditLogs(storageService.getAuditLogs());
    showToast(`Tax Declaration ${target.tdNumber} deleted.`, 'warning');
  };

  const cancelTaxDeclaration = (id: string, reason: string) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const target = taxDeclarations.find((t) => t.id === id);
    if (!target) return;

    updateTaxDeclaration(id, {
      propertyState: 'CANCELLED',
      cancellationReason: reason,
      cancelledDate: nowStr,
    });

    showToast(`Tax Declaration ${target.tdNumber} marked as CANCELLED.`, 'info');
  };

  const supersedeTaxDeclaration = (oldId: string, newDraft: Partial<TaxDeclaration>): TaxDeclaration => {
    const oldTd = taxDeclarations.find((t) => t.id === oldId);
    if (!oldTd) throw new Error('Original Tax Declaration not found');

    const created = createTaxDeclaration({
      tdNumber: newDraft.tdNumber || `TD-${new Date().getFullYear()}-04-${oldTd.barangayCode.slice(-3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      prevTdNumber: oldTd.tdNumber,
      pin: newDraft.pin || oldTd.pin,
      propertyState: 'CURRENT',
      firstName: newDraft.firstName || oldTd.firstName,
      lastName: newDraft.lastName || oldTd.lastName,
      middleName: newDraft.middleName || oldTd.middleName || '',
      adminBusinessName: newDraft.adminBusinessName || oldTd.adminBusinessName || '',
      taxpayerTin: newDraft.taxpayerTin || oldTd.taxpayerTin || '',
      contactNumber: newDraft.contactNumber || oldTd.contactNumber || '',
      address: newDraft.address || oldTd.address,
      barangayCode: newDraft.barangayCode || oldTd.barangayCode,
      barangayName: newDraft.barangayName || oldTd.barangayName,
      municipalityCode: oldTd.municipalityCode,
      municipalityName: oldTd.municipalityName,
      provinceName: oldTd.provinceName,
      titleNumber: newDraft.titleNumber || oldTd.titleNumber,
      lotNumber: newDraft.lotNumber || oldTd.lotNumber,
      surveyNumber: newDraft.surveyNumber || oldTd.surveyNumber,
      blockNumber: newDraft.blockNumber || oldTd.blockNumber,
      area: newDraft.area !== undefined ? newDraft.area : oldTd.area,
      areaUnit: newDraft.areaUnit || oldTd.areaUnit,
      unitValue: newDraft.unitValue !== undefined ? newDraft.unitValue : oldTd.unitValue,
      marketValue: newDraft.marketValue !== undefined ? newDraft.marketValue : oldTd.marketValue,
      assessmentLevel: newDraft.assessmentLevel !== undefined ? newDraft.assessmentLevel : oldTd.assessmentLevel,
      assessedValue: newDraft.assessedValue !== undefined ? newDraft.assessedValue : oldTd.assessedValue,
      kindOfProperty: newDraft.kindOfProperty || oldTd.kindOfProperty,
      generalClass: newDraft.generalClass || oldTd.generalClass,
      actualUse: newDraft.actualUse || oldTd.actualUse,
      effectivityYear: newDraft.effectivityYear || new Date().getFullYear(),
      effectivityQuarter: newDraft.effectivityQuarter || 1,
      assessmentDate: newDraft.assessmentDate || new Date().toISOString().split('T')[0],
      memoranda: newDraft.memoranda || `Supersedes Tax Dec. No. ${oldTd.tdNumber}. Transfer of ownership pursuant to new title/assessment.`,
      documents: newDraft.documents || [],
      approvedBy: settings.municipalAssessor,
      appraisedBy: settings.appraiserName,
      taxMapper: settings.taxMapperName,
    });

    return created;
  };

  // Lineage helpers
  const getPropertyLineage = (propertyIdOrTd: string) => {
    const target = taxDeclarations.find(
      (t) => t.id === propertyIdOrTd || t.tdNumber.toLowerCase().trim() === propertyIdOrTd.toLowerCase().trim()
    ) || null;

    if (!target) {
      return { current: null, ancestors: [], descendants: [] };
    }

    const ancestors: TaxDeclaration[] = [];
    let currentPrev = target.prevTdNumber;
    const visitedAncestors = new Set<string>();

    while (currentPrev && currentPrev.trim() !== '') {
      if (visitedAncestors.has(currentPrev.toLowerCase().trim())) break; // avoid loops
      visitedAncestors.add(currentPrev.toLowerCase().trim());
      
      const found = taxDeclarations.find(
        (t) => t.tdNumber.toLowerCase().trim() === currentPrev?.toLowerCase().trim()
      );
      if (found) {
        ancestors.push(found);
        currentPrev = found.prevTdNumber;
      } else {
        break;
      }
    }

    // Find all descendants (TDs that point to target or its descendants as previous TD)
    const descendants: TaxDeclaration[] = [];
    const queue = [target.tdNumber.toLowerCase().trim()];
    const visitedDescendants = new Set<string>(queue);

    while (queue.length > 0) {
      const currentTdNo = queue.shift()!;
      const children = taxDeclarations.filter(
        (t) => t.prevTdNumber && t.prevTdNumber.toLowerCase().trim() === currentTdNo
      );
      for (const child of children) {
        if (!visitedDescendants.has(child.tdNumber.toLowerCase().trim())) {
          visitedDescendants.add(child.tdNumber.toLowerCase().trim());
          descendants.push(child);
          queue.push(child.tdNumber.toLowerCase().trim());
        }
      }
    }

    return {
      current: target,
      ancestors, // ordered from direct parent to oldest ancestor
      descendants,
    };
  };

  // Document management
  const addDocumentToProperty = (propertyId: string, doc: Omit<DocumentAttachment, 'id' | 'uploadDate'>) => {
    const target = taxDeclarations.find((t) => t.id === propertyId);
    if (!target) return;

    const newDoc: DocumentAttachment = {
      ...doc,
      id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      uploadDate: new Date().toISOString().split('T')[0],
    };

    const updatedDocs = [...(target.documents || []), newDoc];
    updateTaxDeclaration(propertyId, { documents: updatedDocs });

    storageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      action: 'DOCUMENT_UPLOAD',
      targetTdNumber: target.tdNumber,
      description: `Attached document "${newDoc.name}" (${newDoc.type}) to ${target.tdNumber}.`,
    });

    setAuditLogs(storageService.getAuditLogs());
    showToast(`Document "${newDoc.name}" uploaded successfully.`);
  };

  const deleteDocumentFromProperty = (propertyId: string, docId: string) => {
    const target = taxDeclarations.find((t) => t.id === propertyId);
    if (!target) return;

    const updatedDocs = (target.documents || []).filter((d) => d.id !== docId);
    updateTaxDeclaration(propertyId, { documents: updatedDocs });
    showToast(`Document removed.`);
  };

  // Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });

    storageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      action: 'SETTINGS_CHANGE',
      description: `Updated assessor office configuration and PSGC preferences.`,
    });

    setAuditLogs(storageService.getAuditLogs());
    showToast('Settings saved successfully.');
  };

  const updateBarangays = (barangays: PSGCBarangay[]) => {
    setSettings((prev) => ({
      ...prev,
      availableBarangays: barangays,
    }));
    showToast(`Updated barangay registry (${barangays.length} barangays loaded from PSGC).`);
  };

  const addKindOfProperty = (kind: Omit<KindOfPropertyConfig, 'id'>) => {
    const newKind: KindOfPropertyConfig = {
      ...kind,
      id: 'kop-' + Date.now(),
    };
    setSettings((prev) => ({
      ...prev,
      kindsOfProperty: [...prev.kindsOfProperty, newKind],
    }));
    showToast(`Kind of Property "${newKind.name}" added.`);
  };

  const deleteKindOfProperty = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      kindsOfProperty: prev.kindsOfProperty.filter((k) => k.id !== id),
    }));
    showToast('Kind of property removed.');
  };

  const addGeneralClass = (generalClass: Omit<GeneralClassConfig, 'id'>) => {
    const newClass: GeneralClassConfig = {
      ...generalClass,
      id: 'gc-' + Date.now(),
    };
    setSettings((prev) => ({
      ...prev,
      generalClasses: [...prev.generalClasses, newClass],
    }));
    showToast(`General Class "${newClass.name}" added.`);
  };

  const deleteGeneralClass = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      generalClasses: prev.generalClasses.filter((g) => g.id !== id),
    }));
    showToast('General class removed.');
  };

  // Users & Auth
  const loginUser = (username: string): boolean => {
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      const nowStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      const updatedUser = { ...user, lastLogin: nowStr };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
      showToast(`Welcome back, ${user.fullName} (${user.role}).`);
      return true;
    }
    showToast('User account not found.', 'error');
    return false;
  };

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      showToast(`Switched active profile to ${user.fullName} (${user.role}).`, 'info');
    }
  };

  const addUser = (userData: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const newUser: UserAccount = {
      ...userData,
      id: 'usr-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);
    showToast(`User ${newUser.fullName} added successfully.`);
  };

  const updateUser = (id: string, data: Partial<UserAccount>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...data }));
    }
    showToast('User account updated.');
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) {
      showToast('Cannot delete the only remaining user account.', 'warning');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('User deleted.', 'info');
  };

  const resetData = () => {
    storageService.resetToDefault();
    setTaxDeclarations(storageService.getTaxDeclarations());
    setSettings(storageService.getSettings());
    setUsers(storageService.getUsers());
    setCurrentUser(storageService.getCurrentUser());
    setAuditLogs(storageService.getAuditLogs());
    setSelectedProperty(null);
    showToast('All data has been reset to factory defaults.', 'info');
  };

  const exportDatabaseJson = () => {
    const backup = {
      taxDeclarations,
      settings,
      users,
      auditLogs,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessor_tax_declarations_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database exported successfully.');
  };

  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.taxDeclarations && Array.isArray(parsed.taxDeclarations)) {
        setTaxDeclarations(parsed.taxDeclarations);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        showToast('Database imported successfully from JSON file.');
        return true;
      }
      showToast('Invalid backup file format.', 'error');
      return false;
    } catch (err) {
      showToast('Failed to parse backup JSON file.', 'error');
      return false;
    }
  };

  // Supabase integration methods
  const saveSupabaseConfig = (newConfig: SupabaseConfig): boolean => {
    const ok = supabaseService.saveConfig(newConfig);
    setSupabaseConfigState(newConfig);
    setIsSupabaseConnected(supabaseService.isConnected());
    if (ok) {
      showToast('Supabase connection parameters updated.', 'success');
    }
    return ok;
  };

  const clearSupabaseConfig = () => {
    supabaseService.clearConfig();
    setSupabaseConfigState({ url: '', anonKey: '', autoSync: false });
    setIsSupabaseConnected(false);
    showToast('Supabase connection removed.', 'info');
  };

  const testSupabaseConnection = async (url?: string, key?: string) => {
    return await supabaseService.testConnection(url, key);
  };

  const syncToSupabase = async (): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConnected) {
      showToast('Please connect to Supabase first in Settings.', 'warning');
      return { success: false, message: 'Not connected to Supabase' };
    }
    setIsSyncingSupabase(true);
    showToast('Pushing local archive to Supabase cloud database...', 'info');

    try {
      const res = await supabaseService.pushAll({
        taxDeclarations,
        settings,
        users,
        auditLogs,
      });

      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
      return res;
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const pullFromSupabase = async (): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConnected) {
      showToast('Please connect to Supabase first in Settings.', 'warning');
      return { success: false, message: 'Not connected to Supabase' };
    }
    setIsSyncingSupabase(true);
    showToast('Pulling real-time records from Supabase cloud database...', 'info');

    try {
      const res = await supabaseService.pullAll();

      if (res.success) {
        if (res.taxDeclarations) setTaxDeclarations(res.taxDeclarations);
        if (res.settings) setSettings(res.settings);
        if (res.users && res.users.length > 0) setUsers(res.users);
        if (res.auditLogs && res.auditLogs.length > 0) setAuditLogs(res.auditLogs);
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
      return { success: res.success, message: res.message };
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        taxDeclarations,
        selectedProperty,
        setSelectedProperty,
        createTaxDeclaration,
        updateTaxDeclaration,
        deleteTaxDeclaration,
        cancelTaxDeclaration,
        supersedeTaxDeclaration,
        addDocumentToProperty,
        deleteDocumentFromProperty,
        getPropertyLineage,
        filters,
        setFilters,
        resetFilters,
        settings,
        updateSettings,
        updateBarangays,
        addKindOfProperty,
        deleteKindOfProperty,
        addGeneralClass,
        deleteGeneralClass,
        users,
        currentUser,
        loginUser,
        switchUser,
        addUser,
        updateUser,
        deleteUser,
        auditLogs,
        toasts,
        showToast,
        removeToast,
        resetData,
        exportDatabaseJson,
        importDatabaseJson,
        isSupabaseConnected,
        supabaseConfig,
        saveSupabaseConfig,
        clearSupabaseConfig,
        syncToSupabase,
        pullFromSupabase,
        testSupabaseConnection,
        isSyncingSupabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings as SettingsIcon, 
  MapPin, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Save, 
  Building, 
  Layers, 
  Sliders, 
  CheckCircle, 
  AlertCircle,
  Database,
  Globe,
  Tag,
  Search,
  Check,
  ChevronDown,
  Navigation,
  Sparkles
} from 'lucide-react';
import { 
  fetchBarangaysByMunicipality, 
  POPULAR_MUNICIPALITIES, 
  ALL_PHILIPPINE_PROVINCES,
  PROVINCE_MUNICIPALITIES_MAP,
  psgcService,
  ProvinceItem,
  MunicipalityItem
} from '../../services/psgc';
import { KindOfProperty, GeneralClass } from '../../types';
import { SupabaseDatabaseTab } from './SupabaseDatabaseTab';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, showToast, isSupabaseConnected } = useApp();

  const [activeTab, setActiveTab] = useState<'psgc' | 'classes' | 'officials' | 'database'>('psgc');

  // PSGC Settings Form
  const [psgcCode, setPsgcCode] = useState(settings.psgcMunicipalityCode);
  const [psgcName, setPsgcName] = useState(settings.psgcMunicipalityName);
  const [provinceName, setProvinceName] = useState(settings.provinceName);
  const [isFetchingPsgc, setIsFetchingPsgc] = useState(false);
  const [barangaysList, setBarangaysList] = useState(settings.availableBarangays || []);
  const [brgySearch, setBrgySearch] = useState('');

  // Cascading Province & Municipality Dropdown States
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('045800000'); // Default Rizal or matched
  const [provinceMunicipalities, setProvinceMunicipalities] = useState<MunicipalityItem[]>([]);
  const [selectedMunCode, setSelectedMunCode] = useState<string>('');
  const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState<boolean>(false);

  // Search across entire Philippines
  const [globalSearchMun, setGlobalSearchMun] = useState('');
  const [searchResults, setSearchResults] = useState<MunicipalityItem[]>([]);

  // Officials Form
  const [lguName, setLguName] = useState(settings.lguName);
  const [officeName, setOfficeName] = useState(settings.officeName);
  const [municipalAssessor, setMunicipalAssessor] = useState(settings.municipalAssessor);
  const [appraiserName, setAppraiserName] = useState(settings.appraiserName);
  const [taxMapperName, setTaxMapperName] = useState(settings.taxMapperName);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);

  // Kinds & Classes
  const [kinds, setKinds] = useState<KindOfProperty[]>(settings.kindsOfProperty || []);
  const [newKindName, setNewKindName] = useState('');
  const [newKindCode, setNewKindCode] = useState('');
  const [newKindDesc, setNewKindDesc] = useState('');

  const [classes, setClasses] = useState<GeneralClass[]>(settings.generalClasses || []);
  const [newClassName, setNewClassName] = useState('');
  const [newClassLevel, setNewClassLevel] = useState<number>(20);
  const [newClassDesc, setNewClassDesc] = useState('');

  // Sync with global settings on load
  useEffect(() => {
    setPsgcCode(settings.psgcMunicipalityCode);
    setPsgcName(settings.psgcMunicipalityName);
    setProvinceName(settings.provinceName);
    setBarangaysList(settings.availableBarangays || []);
    setLguName(settings.lguName);
    setOfficeName(settings.officeName);
    setMunicipalAssessor(settings.municipalAssessor);
    setAppraiserName(settings.appraiserName);
    setTaxMapperName(settings.taxMapperName);
    setCurrencySymbol(settings.currencySymbol);
    setKinds(settings.kindsOfProperty || []);
    setClasses(settings.generalClasses || []);

    // Try to match selected province from current settings
    const matchedProv = ALL_PHILIPPINE_PROVINCES.find(
      (p) => p.name.toLowerCase() === (settings.provinceName || '').toLowerCase()
    );
    if (matchedProv) {
      setSelectedProvinceCode(matchedProv.code);
    }
  }, [settings]);

  // Load municipalities whenever selectedProvinceCode changes
  useEffect(() => {
    let isMounted = true;
    const loadMunis = async () => {
      setIsLoadingMunicipalities(true);
      const provObj = ALL_PHILIPPINE_PROVINCES.find((p) => p.code === selectedProvinceCode);
      const provTitle = provObj ? provObj.name : provinceName;
      
      const list = await psgcService.getMunicipalitiesByProvince(selectedProvinceCode, provTitle);
      if (isMounted) {
        setProvinceMunicipalities(list);
        setIsLoadingMunicipalities(false);
        // If current psgcCode is in this list, select it, otherwise default to first
        const found = list.find((m) => m.code === psgcCode);
        if (found) {
          setSelectedMunCode(found.code);
        } else if (list.length > 0) {
          setSelectedMunCode(list[0].code);
        }
      }
    };
    loadMunis();
    return () => {
      isMounted = false;
    };
  }, [selectedProvinceCode]);

  // Handle global search input
  useEffect(() => {
    if (globalSearchMun.trim().length >= 2) {
      const res = psgcService.searchMunicipalities(globalSearchMun);
      setSearchResults(res);
    } else {
      setSearchResults([]);
    }
  }, [globalSearchMun]);

  // PSGC Fetch Handler
  const handleFetchPsgc = async (codeToFetch: string, nameToFetch: string, provToFetch: string) => {
    setIsFetchingPsgc(true);
    showToast(`Fetching barangays for ${nameToFetch} (${provToFetch}) from PSGC...`, 'info');

    try {
      const brgys = await fetchBarangaysByMunicipality(codeToFetch);
      setBarangaysList(brgys);
      setPsgcCode(codeToFetch);
      setPsgcName(nameToFetch);
      setProvinceName(provToFetch);

      // Auto update LGU name appropriately
      const isCity = nameToFetch.toLowerCase().includes('city');
      const formattedLgu = isCity
        ? nameToFetch
        : `Municipality of ${nameToFetch}, Province of ${provToFetch}`;

      setLguName(formattedLgu);

      updateSettings({
        psgcMunicipalityCode: codeToFetch,
        psgcMunicipalityName: nameToFetch,
        provinceName: provToFetch,
        lguName: formattedLgu,
        availableBarangays: brgys,
        lastPsgcSync: new Date().toISOString().split('T')[0],
      });

      showToast(`Successfully synced ${brgys.length} barangays for ${nameToFetch}.`);
    } catch (err) {
      showToast('Error syncing with PSGC API. Maintained cached barangays.', 'warning');
    } finally {
      setIsFetchingPsgc(false);
    }
  };

  // When user clicks "Apply Selected Municipality from Dropdown"
  const handleApplyDropdownSelection = () => {
    const found = provinceMunicipalities.find((m) => m.code === selectedMunCode);
    if (found) {
      const provObj = ALL_PHILIPPINE_PROVINCES.find((p) => p.code === selectedProvinceCode);
      const pName = provObj ? provObj.name : found.provinceName;
      handleFetchPsgc(found.code, found.name, pName);
    }
  };

  // Add Kind of Property
  const handleAddKind = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKindName.trim()) return;

    const newKind: KindOfProperty = {
      id: 'kind-' + Date.now(),
      name: newKindName.trim(),
      code: newKindCode.trim().toUpperCase() || newKindName.trim().substring(0, 3).toUpperCase(),
      description: newKindDesc.trim(),
    };

    const updated = [...kinds, newKind];
    setKinds(updated);
    updateSettings({ kindsOfProperty: updated });
    setNewKindName('');
    setNewKindCode('');
    setNewKindDesc('');
    showToast(`Added property kind: ${newKind.name}`);
  };

  const handleRemoveKind = (id: string) => {
    const updated = kinds.filter((k) => k.id !== id);
    setKinds(updated);
    updateSettings({ kindsOfProperty: updated });
    showToast('Kind of property removed.');
  };

  // Add General Class
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newClass: GeneralClass = {
      id: 'class-' + Date.now(),
      name: newClassName.trim(),
      defaultAssessmentLevel: newClassLevel,
      description: newClassDesc.trim(),
    };

    const updated = [...classes, newClass];
    setClasses(updated);
    updateSettings({ generalClasses: updated });
    setNewClassName('');
    setNewClassLevel(20);
    setNewClassDesc('');
    showToast(`Added general class: ${newClass.name}`);
  };

  const handleRemoveClass = (id: string) => {
    const updated = classes.filter((c) => c.id !== id);
    setClasses(updated);
    updateSettings({ generalClasses: updated });
    showToast('Classification removed.');
  };

  // Save Officials & LGU
  const handleSaveOfficials = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      lguName: lguName.trim(),
      officeName: officeName.trim(),
      provinceName: provinceName.trim(),
      municipalAssessor: municipalAssessor.trim(),
      appraiserName: appraiserName.trim(),
      taxMapperName: taxMapperName.trim(),
      currencySymbol: currencySymbol.trim(),
    });
    showToast('LGU profile and assessor signatories saved.');
  };

  // Filtered barangays for display
  const displayedBarangays = brgySearch.trim()
    ? barangaysList.filter((b) =>
        b.name.toLowerCase().includes(brgySearch.toLowerCase()) ||
        b.code.includes(brgySearch)
      )
    : barangaysList;

  const currentProvinceObj = ALL_PHILIPPINE_PROVINCES.find((p) => p.code === selectedProvinceCode);

  return (
    <div id="settings-view-root" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Settings Header with Integrated Section Navigation */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <SettingsIcon className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                Assessor System Configuration
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Philippine Geographic (PSGC) Hierarchy, Assessment Levels, Kinds of Property, and LGU Signatories
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Active LGU: {settings.psgcMunicipalityName}, {settings.provinceName}</span>
            </span>
          </div>
        </div>

        {/* Clean Segmented Navigation (No faux tabs or nested card seams) */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('psgc')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'psgc'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>PSGC Location & LGUs</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'psgc' ? 'bg-blue-700 text-white' : 'bg-slate-200/70 text-slate-700'
            }`}>
              {ALL_PHILIPPINE_PROVINCES.length} Prov &middot; {barangaysList.length} Brgys
            </span>
          </button>

          <button
            onClick={() => setActiveTab('classes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'classes'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Kinds of Property & Classes</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'classes' ? 'bg-blue-700 text-white' : 'bg-slate-200/70 text-slate-700'
            }`}>
              {settings.kindsOfProperty.length} Kinds
            </span>
          </button>

          <button
            onClick={() => setActiveTab('officials')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'officials'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>LGU Profile & Signatories</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'database'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Cloud Database (Supabase)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-emerald-700 text-white'
                : isSupabaseConnected
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200/70 text-slate-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-300 animate-pulse' : 'bg-slate-400'
              }`}></span>
              <span>{isSupabaseConnected ? 'Connected' : 'Offline'}</span>
            </span>
          </button>
        </div>
      </div>

      {/* Active Section Content (Direct clean layout, no card-in-card nesting) */}
      <div className="space-y-6">
        
        {/* TAB 1: PSGC Location & Cascading Dropdowns */}
        {activeTab === 'psgc' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Current Active LGU Status Card */}
            <div className="p-4 bg-gradient-to-r from-blue-50/90 to-sky-50/70 rounded-2xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-blue-950">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Current Active Assessor LGU: <span className="text-blue-700 underline underline-offset-2">{settings.psgcMunicipalityName}, {settings.provinceName}</span></span>
                </div>
                <p className="text-slate-600">
                  PSGC Code: <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono text-[11px] font-bold text-slate-800">{settings.psgcMunicipalityCode}</code>
                  <span className="mx-2 text-slate-300">|</span>
                  <span>{barangaysList.length} Active Barangays loaded into Property forms</span>
                </p>
                <p className="text-slate-500 text-[11px]">
                  Switching municipality updates all new declaration defaults and populates the official barangay list.
                </p>
              </div>

              <button
                onClick={() => handleFetchPsgc(psgcCode, psgcName, provinceName)}
                disabled={isFetchingPsgc}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isFetchingPsgc ? 'animate-spin' : ''}`} />
                <span>{isFetchingPsgc ? 'Connecting PSGC...' : 'Re-sync Barangays'}</span>
              </button>
            </div>

            {/* SECTION 1: CASCADING PROVINCE & MUNICIPALITY SELECTOR */}
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-blue-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span>Select Province & Municipality Dropdown</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Browse all 82 Philippine provinces and choose any municipality or city across Luzon, Visayas, and Mindanao.
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
                  All 82 Provinces Supported
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Step 1: Province Dropdown */}
                <div className="md:col-span-5 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Step 1: Select Province ({ALL_PHILIPPINE_PROVINCES.length} Available)
                  </label>
                  <div className="relative">
                    <select
                      id="psgc-province-select"
                      value={selectedProvinceCode}
                      onChange={(e) => setSelectedProvinceCode(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                    >
                      {ALL_PHILIPPINE_PROVINCES.map((prov) => (
                        <option key={prov.code} value={prov.code}>
                          {prov.name} {prov.regionName ? `(${prov.regionName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Step 2: Municipality Dropdown */}
                <div className="md:col-span-5 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Step 2: Select Municipality / City</span>
                    <span className="text-[10px] text-blue-600 font-normal">
                      {isLoadingMunicipalities ? 'Loading...' : `${provinceMunicipalities.length} in ${currentProvinceObj?.name || 'Province'}`}
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      id="psgc-municipality-select"
                      value={selectedMunCode}
                      onChange={(e) => setSelectedMunCode(e.target.value)}
                      disabled={isLoadingMunicipalities || provinceMunicipalities.length === 0}
                      className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {provinceMunicipalities.map((mun) => (
                        <option key={mun.code} value={mun.code}>
                          {mun.name} {mun.isCity ? '(City)' : ''} &bull; Code: {mun.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Step 3: Apply Button */}
                <div className="md:col-span-2">
                  <button
                    id="apply-psgc-dropdown-btn"
                    onClick={handleApplyDropdownSelection}
                    disabled={!selectedMunCode || isFetchingPsgc}
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply & Sync</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 2: INSTANT SEARCH MUNICIPALITY ACROSS THE ENTIRE PHILIPPINES */}
            <div className="p-4 bg-white rounded-2xl border border-blue-100 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  <span>Instant Search Municipality / City across the Philippines:</span>
                </label>
                <span className="text-[11px] text-slate-400">Type e.g. "Baguio", "Davao", "Tagaytay", "Iloilo", "Cebu"</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={globalSearchMun}
                  onChange={(e) => setGlobalSearchMun(e.target.value)}
                  placeholder="Type any Philippine municipality, city, or province name..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                {globalSearchMun && (
                  <button
                    onClick={() => setGlobalSearchMun('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Search Suggestions dropdown */}
              {searchResults.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-2 border border-blue-100 divide-y divide-slate-200/60 max-h-48 overflow-y-auto">
                  {searchResults.map((item) => (
                    <div
                      key={item.code}
                      onClick={() => {
                        handleFetchPsgc(item.code, item.name, item.provinceName);
                        setGlobalSearchMun('');
                      }}
                      className="p-2 hover:bg-blue-100/60 rounded-lg cursor-pointer flex items-center justify-between transition-colors text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="text-slate-500 ml-2">Province: <strong className="text-slate-700">{item.provinceName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500">{item.code}</span>
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-600 hover:text-white transition-colors">Select</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 3: QUICK PRESET SWITCHER */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Preset LGUs:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {POPULAR_MUNICIPALITIES.slice(0, 12).map((mun) => {
                  const isSelected = psgcCode === mun.code;
                  return (
                    <button
                      key={mun.code}
                      onClick={() => handleFetchPsgc(mun.code, mun.name, mun.province)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-700 font-bold shadow-xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:border-blue-200 border-slate-200'
                      }`}
                    >
                      <p className="font-bold truncate">{mun.name}</p>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {mun.province}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: CUSTOM PSGC CODE OVERRIDE */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Manual / Custom PSGC Geographic Definition
                </p>
                <span className="text-[10px] text-slate-400">For specialized LGU or district codes</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Municipality / City Name</label>
                  <input
                    type="text"
                    value={psgcName}
                    onChange={(e) => setPsgcName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Province</label>
                  <input
                    type="text"
                    value={provinceName}
                    onChange={(e) => setProvinceName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">PSGC Code (9 Digits)</label>
                  <input
                    type="text"
                    value={psgcCode}
                    onChange={(e) => setPsgcCode(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-white border border-slate-300 rounded-xl text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <button
                    onClick={() => handleFetchPsgc(psgcCode, psgcName, provinceName)}
                    className="w-full py-2 px-3 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Apply Custom</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 5: LOADED BARANGAYS EXPLORER */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Active Barangays for {psgcName} ({barangaysList.length})
                  </p>
                  <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                    Populating Property Forms
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={brgySearch}
                      onChange={(e) => setBrgySearch(e.target.value)}
                      placeholder="Filter barangays..."
                      className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 w-44 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    Last Synced: {settings.lastPsgcSync || 'Today'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                {displayedBarangays.length > 0 ? (
                  displayedBarangays.map((brgy) => (
                    <div
                      key={brgy.code}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs flex items-center justify-between hover:border-blue-200 transition-colors"
                    >
                      <div className="min-w-0 pr-1">
                        <p className="font-semibold text-slate-800 truncate">{brgy.name}</p>
                        <p className="font-mono text-[10px] text-slate-400">{brgy.code}</p>
                      </div>
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 py-6 text-center text-xs text-slate-400">
                    No barangays match "{brgySearch}"
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Kinds & General Classes */}
        {activeTab === 'classes' && (
          <div className="space-y-8 animate-in fade-in duration-150 text-xs">
            
            {/* Section A: Kinds of Property */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Kinds of Real Property</h3>
                  <p className="text-slate-500">Assessment categories (e.g. Land, Building, Machinery, Special)</p>
                </div>
              </div>

              {/* Add Kind Form */}
              <form onSubmit={handleAddKind} className="p-4 bg-blue-50/70 rounded-xl border border-blue-100 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Kind Name</label>
                  <input
                    type="text"
                    required
                    value={newKindName}
                    onChange={(e) => setNewKindName(e.target.value)}
                    placeholder="e.g. Special Improvement"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Code / Abbr.</label>
                  <input
                    type="text"
                    value={newKindCode}
                    onChange={(e) => setNewKindCode(e.target.value)}
                    placeholder="e.g. IMP"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={newKindDesc}
                    onChange={(e) => setNewKindDesc(e.target.value)}
                    placeholder="Description or notes"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Property Kind</span>
                  </button>
                </div>
              </form>

              {/* Table of Kinds */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Code</th>
                      <th className="py-2.5 px-4">Kind Name</th>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {kinds.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-4 font-mono font-bold text-blue-700">{k.code}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{k.name}</td>
                        <td className="py-2.5 px-4 text-slate-500">{k.description || '—'}</td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => handleRemoveKind(k.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section B: General Classes & Assessment Levels */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">General Property Classifications</h3>
                  <p className="text-slate-500">Statutory Assessment Levels pursuant to R.A. 7160 (Local Government Code)</p>
                </div>
              </div>

              {/* Add Class Form */}
              <form onSubmit={handleAddClass} className="p-4 bg-blue-50/70 rounded-xl border border-blue-100 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Classification Name</label>
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g. Institutional / Timberland"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Assessment Level (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={newClassLevel}
                    onChange={(e) => setNewClassLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 font-bold text-blue-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Description / Notes</label>
                  <input
                    type="text"
                    value={newClassDesc}
                    onChange={(e) => setNewClassDesc(e.target.value)}
                    placeholder="Legal basis or notes"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Classification</span>
                  </button>
                </div>
              </form>

              {/* Table of Classes */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Classification</th>
                      <th className="py-2.5 px-4">Assessment Level</th>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {classes.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{c.name}</td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-md text-[11px]">
                            {c.defaultAssessmentLevel}%
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">{c.description || '—'}</td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => handleRemoveClass(c.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: Officials & LGU Signatories */}
        {activeTab === 'officials' && (
          <form onSubmit={handleSaveOfficials} className="space-y-6 animate-in fade-in duration-150 text-xs">
            
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span>Local Government Unit & Header Settings</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">LGU / Municipality Title</label>
                  <input
                    type="text"
                    required
                    value={lguName}
                    onChange={(e) => setLguName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Office / Department Name</label>
                  <input
                    type="text"
                    required
                    value={officeName}
                    onChange={(e) => setOfficeName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Province Name</label>
                  <input
                    type="text"
                    required
                    value={provinceName}
                    onChange={(e) => setProvinceName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>Authorized Tax Declaration Signatories</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Municipal Assessor (Approver)</label>
                  <input
                    type="text"
                    required
                    value={municipalAssessor}
                    onChange={(e) => setMunicipalAssessor(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Local Assessment Appraiser</label>
                  <input
                    type="text"
                    required
                    value={appraiserName}
                    onChange={(e) => setAppraiserName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Tax Mapper / GIS In-Charge</label>
                  <input
                    type="text"
                    required
                    value={taxMapperName}
                    onChange={(e) => setTaxMapperName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-sm text-slate-800">Currency & Valuation Formatting</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile & Signatories</span>
              </button>
            </div>

          </form>
        )}

        {/* TAB 4: Supabase / PostgreSQL Cloud Database */}
        {activeTab === 'database' && <SupabaseDatabaseTab />}
      </div>
    </div>
  );
};

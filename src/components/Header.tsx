import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building, 
  Search, 
  User, 
  Plus, 
  History, 
  MapPin, 
  Menu,
  X,
  Database,
  Cloud,
  CloudOff
} from 'lucide-react';

interface HeaderProps {
  onOpenNewPropertyModal: () => void;
  onOpenLoginModal: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewPropertyModal,
  onOpenLoginModal,
  onToggleMobileSidebar,
}) => {
  const { 
    settings, 
    currentUser, 
    taxDeclarations, 
    setSelectedProperty, 
    setActiveTab, 
    filters, 
    setFilters,
    isSupabaseConnected,
  } = useApp();
  
  const [quickSearch, setQuickSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const searchResults = quickSearch.trim().length > 1
    ? taxDeclarations.filter((td) => {
        const q = quickSearch.toLowerCase();
        return (
          td.tdNumber.toLowerCase().includes(q) ||
          (td.prevTdNumber && td.prevTdNumber.toLowerCase().includes(q)) ||
          td.pin.toLowerCase().includes(q) ||
          td.lastName.toLowerCase().includes(q) ||
          td.firstName.toLowerCase().includes(q) ||
          (td.adminBusinessName && td.adminBusinessName.toLowerCase().includes(q)) ||
          td.titleNumber.toLowerCase().includes(q) ||
          td.lotNumber.toLowerCase().includes(q) ||
          td.barangayName.toLowerCase().includes(q)
        );
      }).slice(0, 5)
    : [];

  const handleSelectSearchResult = (td: any) => {
    setSelectedProperty(td);
    setActiveTab('properties');
    setQuickSearch('');
    setIsSearchFocused(false);
  };

  const handleMainSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      setFilters((prev) => ({ ...prev, searchQuery: quickSearch.trim() }));
      setActiveTab('properties');
      setIsSearchFocused(false);
    }
  };

  return (
    <header id="main-header" className="h-16 bg-white border-b border-blue-100 flex items-center justify-between px-3 sm:px-6 lg:px-8 z-30 shrink-0 select-none no-print">
      {/* Left Title & Status Badge */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            title="Open Navigation Menu"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5 min-w-0">
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 tracking-tight truncate">
            Real Property Archive
          </h2>
          <span className="hidden md:inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">
            Public Service Module
          </span>
        </div>
      </div>

      {/* Right Search Bar & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search Input */}
        <div className="relative">
          <form onSubmit={handleMainSearchSubmit} className="relative">
            <input
              id="global-search-input"
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search TD or PIN..."
              className="w-32 xs:w-44 sm:w-60 md:w-72 bg-slate-50 border border-blue-100 rounded-full py-1.5 sm:py-2 px-3 sm:px-4 pl-8 sm:pl-10 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-slate-800 placeholder-slate-400"
            />
            <Search className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-slate-400 absolute left-3 sm:left-3.5 top-2 sm:top-2.5 pointer-events-none" />
            {quickSearch && (
              <button
                type="button"
                onClick={() => setQuickSearch('')}
                className="absolute right-2.5 top-2 sm:top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Quick Search Result Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-96 bg-white rounded-xl shadow-xl border border-blue-100 overflow-hidden z-50 divide-y divide-blue-50">
              <div className="px-4 py-2 bg-blue-50 text-[10px] font-bold text-blue-900 uppercase tracking-wider flex justify-between">
                <span>Search Matches</span>
                <span>{searchResults.length} found</span>
              </div>
              {searchResults.map((td) => (
                <button
                  key={td.id}
                  onMouseDown={() => handleSelectSearchResult(td)}
                  className="w-full text-left p-3 hover:bg-blue-50/50 transition-colors flex items-center justify-between gap-3 text-xs cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono font-bold text-blue-900 text-xs">
                        {td.tdNumber}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          td.propertyState === 'CURRENT'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {td.propertyState}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-700 truncate">
                      {td.lastName}, {td.firstName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      PIN: {td.pin} &bull; {td.barangayName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-800">
                      ₱ {td.assessedValue?.toLocaleString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cloud Database indicator */}
        <button
          onClick={() => setActiveTab('settings')}
          title={isSupabaseConnected ? 'Supabase Cloud Database Connected' : 'Database Settings / Offline Storage'}
          className={`hidden xs:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            isSupabaseConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className={`w-3.5 h-3.5 ${isSupabaseConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="hidden md:inline">{isSupabaseConnected ? 'Cloud PostgreSQL' : 'Local DB'}</span>
          <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-300'}`}></span>
        </button>

        {/* New Declaration Button */}
        <button
          id="header-new-tax-dec-btn"
          onClick={onOpenNewPropertyModal}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-shadow shadow-md shadow-blue-100 flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Declaration</span>
          <span className="sm:hidden">New</span>
        </button>

        {/* User profile toggle */}
        <button
          id="header-user-profile-btn"
          onClick={onOpenLoginModal}
          title={`Signed in as ${currentUser.fullName} (${currentUser.role}) - Click to switch profile`}
          className="flex items-center gap-2 p-1 sm:p-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
        >
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
            {currentUser.fullName ? currentUser.fullName[0] : 'U'}
          </div>
        </button>
      </div>
    </header>
  );
};

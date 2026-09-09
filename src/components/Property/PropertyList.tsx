import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  GitBranch, 
  Printer, 
  Trash2, 
  Edit3, 
  Eye, 
  FileCheck, 
  Paperclip, 
  ArrowUpDown, 
  Download,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Copy,
  Building2,
  Share2,
  LayoutGrid,
  List
} from 'lucide-react';
import { TaxDeclaration } from '../../types';

interface PropertyListProps {
  onOpenNewPropertyModal: () => void;
  onOpenEditModal: (property: TaxDeclaration) => void;
  onOpenSupersedeModal: (property: TaxDeclaration) => void;
  onOpenPrintView: (property: TaxDeclaration) => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({
  onOpenNewPropertyModal,
  onOpenEditModal,
  onOpenSupersedeModal,
  onOpenPrintView,
}) => {
  const { 
    taxDeclarations, 
    selectedProperty, 
    setSelectedProperty, 
    deleteTaxDeclaration, 
    cancelTaxDeclaration, 
    settings,
    filters,
    setFilters,
    resetFilters,
    setActiveTab,
    showToast
  } = useApp();

  const [sortField, setSortField] = useState<keyof TaxDeclaration>('assessmentDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedForBatch, setSelectedForBatch] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filter logic
  const filteredDeclarations = taxDeclarations.filter((td) => {
    // Status filter
    if (filters.status !== 'ALL' && td.propertyState !== filters.status) {
      return false;
    }

    // Barangay filter
    if (filters.barangay && td.barangayName.toLowerCase() !== filters.barangay.toLowerCase()) {
      return false;
    }

    // Kind of property filter
    if (filters.kindOfProperty && td.kindOfProperty.toLowerCase() !== filters.kindOfProperty.toLowerCase()) {
      return false;
    }

    // General class filter
    if (filters.generalClass && td.generalClass.toLowerCase() !== filters.generalClass.toLowerCase()) {
      return false;
    }

    // Effectivity year filter
    if (filters.year && td.effectivityYear.toString() !== filters.year) {
      return false;
    }

    // Free text search
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchTd = td.tdNumber.toLowerCase().includes(q);
      const matchPrevTd = td.prevTdNumber && td.prevTdNumber.toLowerCase().includes(q);
      const matchPin = td.pin.toLowerCase().includes(q);
      const matchOwner = `${td.lastName} ${td.firstName} ${td.middleName || ''}`.toLowerCase().includes(q);
      const matchBusiness = td.adminBusinessName && td.adminBusinessName.toLowerCase().includes(q);
      const matchTitle = td.titleNumber && td.titleNumber.toLowerCase().includes(q);
      const matchLot = td.lotNumber && td.lotNumber.toLowerCase().includes(q);
      const matchSurvey = td.surveyNumber && td.surveyNumber.toLowerCase().includes(q);
      const matchAddress = td.address && td.address.toLowerCase().includes(q);
      const matchMemoranda = td.memoranda && td.memoranda.toLowerCase().includes(q);

      return matchTd || matchPrevTd || matchPin || matchOwner || matchBusiness || matchTitle || matchLot || matchSurvey || matchAddress || matchMemoranda;
    }

    return true;
  });

  // Sort logic
  const sortedDeclarations = [...filteredDeclarations].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (valA === undefined || valA === null) valA = '';
    if (valB === undefined || valB === null) valB = '';

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return 0;
  });

  const handleSort = (field: keyof TaxDeclaration) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedForBatch(sortedDeclarations.map((t) => t.id));
    } else {
      setSelectedForBatch([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedForBatch.includes(id)) {
      setSelectedForBatch(selectedForBatch.filter((item) => item !== id));
    } else {
      setSelectedForBatch([...selectedForBatch, id]);
    }
  };

  const handleCopyTD = (tdNumber: string) => {
    navigator.clipboard.writeText(tdNumber);
    showToast(`Copied ${tdNumber} to clipboard.`);
  };

  return (
    <div id="real-property-archive-view" className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2 flex-wrap">
            <span>Real Property Tax Declaration Archive</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {filteredDeclarations.length} of {taxDeclarations.length} records
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Official assessment roll with automatic predecessor cancellation & historical lineage connections
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              title="Table View (Data Dense)"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              title="Card Grid View (Optimized for Mobile/Tablet)"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            id="new-tax-declaration-list-btn"
            onClick={onOpenNewPropertyModal}
            className="px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-lg shadow-md shadow-blue-100 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tax Declaration</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="filter-search-input"
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search TD, PIN, Owner, Lot, Title..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-blue-100 rounded-full focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-slate-800"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="filter-status-select"
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as any }))}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-blue-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-slate-800"
            >
              <option value="ALL">All States (Current & Cancelled)</option>
              <option value="CURRENT">Current / Active Only</option>
              <option value="CANCELLED">Cancelled / Superseded Only</option>
            </select>
          </div>

          {/* Barangay Filter */}
          <div>
            <select
              id="filter-barangay-select"
              value={filters.barangay}
              onChange={(e) => setFilters((prev) => ({ ...prev, barangay: e.target.value }))}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-blue-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-slate-800 truncate"
            >
              <option value="">All Barangays (PSGC)</option>
              {settings.availableBarangays.map((b) => (
                <option key={b.code} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Kind of Property */}
          <div>
            <select
              id="filter-kind-select"
              value={filters.kindOfProperty}
              onChange={(e) => setFilters((prev) => ({ ...prev, kindOfProperty: e.target.value }))}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-blue-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-slate-800"
            >
              <option value="">All Kinds of Property</option>
              {settings.kindsOfProperty.map((k) => (
                <option key={k.id} value={k.name}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>

          {/* General Classification */}
          <div>
            <select
              id="filter-class-select"
              value={filters.generalClass}
              onChange={(e) => setFilters((prev) => ({ ...prev, generalClass: e.target.value }))}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-blue-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-slate-800"
            >
              <option value="">All General Classes</option>
              {settings.generalClasses.map((gc) => (
                <option key={gc.id} value={gc.name}>
                  {gc.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Filter tags & Reset */}
        {(filters.searchQuery || filters.status !== 'ALL' || filters.barangay || filters.kindOfProperty || filters.generalClass || filters.year) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">Active Filters:</span>
              {filters.status !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[11px] font-semibold">
                  Status: {filters.status}
                </span>
              )}
              {filters.barangay && (
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[11px] font-semibold">
                  Brgy: {filters.barangay}
                </span>
              )}
              {filters.kindOfProperty && (
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[11px] font-semibold">
                  Kind: {filters.kindOfProperty}
                </span>
              )}
              {filters.generalClass && (
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[11px] font-semibold">
                  Class: {filters.generalClass}
                </span>
              )}
            </div>

            <button
              id="reset-filters-btn"
              onClick={resetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Selected Batch Actions Bar */}
      {selectedForBatch.length > 0 && (
        <div className="bg-blue-900 text-white p-3 sm:p-4 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="font-bold text-xs sm:text-sm">
              {selectedForBatch.length} record{selectedForBatch.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                const selectedData = taxDeclarations.filter(t => selectedForBatch.includes(t.id));
                const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedData, null, 2));
                const dlAnchor = document.createElement('a');
                dlAnchor.setAttribute("href", jsonStr);
                dlAnchor.setAttribute("download", `tax_declarations_export_${Date.now()}.json`);
                document.body.appendChild(dlAnchor);
                dlAnchor.click();
                dlAnchor.remove();
                showToast(`Exported ${selectedForBatch.length} records.`);
              }}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => setSelectedForBatch([])}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Content: Card Grid View or Table View */}
      {viewMode === 'cards' ? (
        <div>
          {sortedDeclarations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-blue-100 p-12 text-center text-slate-500 shadow-sm">
              <FileText className="w-12 h-12 mx-auto text-blue-200 mb-3" />
              <p className="text-base font-bold text-slate-700">No Tax Declaration records match criteria</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or filter settings.</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sortedDeclarations.map((td) => {
                const isCurrent = td.propertyState === 'CURRENT';
                const isChecked = selectedForBatch.includes(td.id);

                return (
                  <div
                    key={td.id}
                    className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                      isChecked ? 'border-blue-500 ring-2 ring-blue-100' : 'border-blue-100 hover:border-blue-200'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-blue-50">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSelectOne(td.id)}
                              className="rounded text-blue-600 focus:ring-blue-400 shrink-0"
                            />
                            <button
                              onClick={() => setSelectedProperty(td)}
                              className="font-mono font-bold text-sm text-blue-900 hover:text-blue-600 hover:underline truncate cursor-pointer text-left"
                            >
                              {td.tdNumber}
                            </button>
                            <button
                              onClick={() => handleCopyTD(td.tdNumber)}
                              title="Copy TD Number"
                              className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer shrink-0"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {td.prevTdNumber && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                              <GitBranch className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="truncate">Prev: <span className="font-mono">{td.prevTdNumber}</span></span>
                            </p>
                          )}
                        </div>

                        <span
                          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCurrent
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isCurrent ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{td.propertyState}</span>
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="py-3.5 space-y-2.5 text-xs">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Declared Owner</p>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">
                            {td.lastName}, {td.firstName} {td.middleName || ''}
                          </p>
                          {td.adminBusinessName && (
                            <p className="text-[11px] text-slate-500 truncate mt-0.5" title={td.adminBusinessName}>
                              {td.adminBusinessName}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="bg-slate-50 p-2 rounded-lg border border-blue-50">
                            <p className="text-[10px] text-slate-400 font-semibold">PIN</p>
                            <p className="font-mono text-slate-700 font-bold truncate text-[11px]">{td.pin}</p>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg border border-blue-50">
                            <p className="text-[10px] text-slate-400 font-semibold">Location</p>
                            <p className="text-slate-700 font-semibold truncate text-[11px]">{td.barangayName}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1">
                          <span>{td.kindOfProperty} &bull; {td.generalClass}</span>
                          <span>{td.area.toLocaleString()} {td.areaUnit}</span>
                        </div>

                        <div className="pt-2 border-t border-blue-50 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Assessed Valuation</span>
                            <p className="text-base font-extrabold text-blue-900">
                              {settings.currencySymbol}{td.assessedValue?.toLocaleString()}
                            </p>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">Eff. {td.effectivityYear}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-blue-50 flex items-center justify-between gap-1">
                      <button
                        onClick={() => setSelectedProperty(td)}
                        className="flex-1 py-1.5 px-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={() => onOpenSupersedeModal(td)}
                        title="Supersede / Issue New TD"
                        className="p-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenEditModal(td)}
                        title="Edit Record"
                        className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenPrintView(td)}
                        title="Print Form"
                        className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to permanently delete Tax Declaration ${td.tdNumber}?`)) {
                            deleteTaxDeclaration(td.id);
                          }
                        }}
                        title="Delete"
                        className="p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Main Table Container */
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="sticky top-0 bg-white border-b border-blue-50 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={sortedDeclarations.length > 0 && selectedForBatch.length === sortedDeclarations.length}
                      className="rounded text-blue-600 focus:ring-blue-400"
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('tdNumber')} 
                    className="p-3 cursor-pointer hover:bg-sky-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Tax Declaration / Prev TD</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('pin')} 
                    className="p-3 cursor-pointer hover:bg-sky-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>PIN & Title No.</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('propertyState')} 
                    className="p-3 cursor-pointer hover:bg-sky-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>State</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('lastName')} 
                    className="p-3 cursor-pointer hover:bg-sky-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Owner / Admin / Entity</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3">Location & Lot</th>
                  <th className="p-3">Classification & Area</th>
                  <th 
                    onClick={() => handleSort('assessedValue')} 
                    className="p-3 text-right cursor-pointer hover:bg-sky-100/70 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Assessed Value</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3 text-center">Docs</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {sortedDeclarations.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-slate-500">
                      <FileText className="w-12 h-12 mx-auto text-blue-200 mb-3" />
                      <p className="text-base font-bold text-slate-700">No Tax Declaration records match criteria</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or filter settings.</p>
                      <button
                        onClick={resetFilters}
                        className="mt-4 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  sortedDeclarations.map((td) => {
                    const isCurrent = td.propertyState === 'CURRENT';
                    const isChecked = selectedForBatch.includes(td.id);

                    return (
                      <tr 
                        key={td.id} 
                        className={`hover:bg-blue-50/50 cursor-pointer transition-colors border-l-4 ${
                          isChecked ? 'border-blue-500 bg-blue-50/40' : 'border-transparent'
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelectOne(td.id)}
                            className="rounded text-blue-600 focus:ring-blue-400"
                          />
                        </td>

                        {/* TD & Prev TD */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedProperty(td)}
                              className="font-mono font-bold text-blue-900 hover:text-blue-600 hover:underline text-left cursor-pointer"
                            >
                              {td.tdNumber}
                            </button>
                            <button
                              onClick={() => handleCopyTD(td.tdNumber)}
                              title="Copy TD Number"
                              className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          {td.prevTdNumber ? (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                              <GitBranch className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="truncate max-w-[140px]" title={`Previous TD: ${td.prevTdNumber}`}>
                                Prev: <span className="font-mono">{td.prevTdNumber}</span>
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">Original TD Base</span>
                          )}
                        </td>

                        {/* PIN & Title */}
                        <td className="p-3">
                          <p className="font-mono text-slate-700 font-semibold">{td.pin}</p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {td.titleNumber ? `Title: ${td.titleNumber}` : 'No Registered Title'}
                          </p>
                        </td>

                        {/* State */}
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              isCurrent
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {isCurrent ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{td.propertyState}</span>
                          </span>
                          {!isCurrent && td.cancelledDate && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Cancelled: {td.cancelledDate}
                            </p>
                          )}
                        </td>

                        {/* Owner / Admin */}
                        <td className="p-3">
                          <p className="font-bold text-slate-800">
                            {td.lastName}, {td.firstName} {td.middleName || ''}
                          </p>
                          {td.adminBusinessName && (
                            <p className="text-[11px] text-slate-500 truncate max-w-[180px]" title={td.adminBusinessName}>
                              {td.adminBusinessName}
                            </p>
                          )}
                        </td>

                        {/* Location & Lot */}
                        <td className="p-3">
                          <p className="font-semibold text-slate-700">{td.barangayName}</p>
                          <p className="text-[11px] text-slate-500">
                            {td.lotNumber ? `Lot ${td.lotNumber}` : ''} {td.surveyNumber ? `(${td.surveyNumber})` : ''}
                          </p>
                        </td>

                        {/* Classification & Area */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800">{td.kindOfProperty}</span>
                            <span className="text-slate-400">&bull;</span>
                            <span className="text-slate-600">{td.generalClass}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Area: {td.area.toLocaleString()} {td.areaUnit} ({td.assessmentLevel}%)
                          </p>
                        </td>

                        {/* Assessed Value */}
                        <td className="p-3 text-right">
                          <p className="font-extrabold text-blue-900 text-sm">
                            {settings.currencySymbol}
                            {td.assessedValue?.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Eff. {td.effectivityYear}
                          </p>
                        </td>

                        {/* Documents */}
                        <td className="p-3 text-center">
                          {td.documents && td.documents.length > 0 ? (
                            <button
                              onClick={() => setSelectedProperty(td)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold hover:bg-blue-100 transition-colors"
                            >
                              <Paperclip className="w-3 h-3" />
                              <span>{td.documents.length}</span>
                            </button>
                          ) : (
                            <span className="text-slate-300 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Action Menu */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              id={`view-td-${td.id}`}
                              onClick={() => setSelectedProperty(td)}
                              title="View Full Property Dossier"
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              id={`edit-td-${td.id}`}
                              onClick={() => onOpenEditModal(td)}
                              title="Edit Tax Declaration"
                              className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              id={`supersede-td-${td.id}`}
                              onClick={() => onOpenSupersedeModal(td)}
                              title="Supersede / Issue New TD (Transfer ownership & auto-cancel old TD)"
                              className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>

                            <button
                              id={`print-td-${td.id}`}
                              onClick={() => onOpenPrintView(td)}
                              title="Print Official Tax Declaration Form"
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <button
                              id={`delete-td-${td.id}`}
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete Tax Declaration ${td.tdNumber}?`)) {
                                  deleteTaxDeclaration(td.id);
                                }
                              }}
                              title="Delete Tax Declaration"
                              className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

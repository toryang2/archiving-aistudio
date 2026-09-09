import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  GitBranch, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowDown, 
  FileText, 
  Eye, 
  Share2, 
  Plus, 
  Layers, 
  Calendar,
  Building2,
  HelpCircle
} from 'lucide-react';
import { TaxDeclaration } from '../../types';

interface PropertyLineageGraphProps {
  onOpenNewPropertyModal: () => void;
  onOpenSupersedeModal: (property: TaxDeclaration) => void;
}

export const PropertyLineageGraph: React.FC<PropertyLineageGraphProps> = ({
  onOpenNewPropertyModal,
  onOpenSupersedeModal,
}) => {
  const { 
    taxDeclarations, 
    getPropertyLineage, 
    setSelectedProperty, 
    setActiveTab, 
    settings 
  } = useApp();

  const [selectedTdId, setSelectedTdId] = useState<string>(
    taxDeclarations.length > 0 ? taxDeclarations[0].id : ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  const activeProperty = taxDeclarations.find((t) => t.id === selectedTdId) || taxDeclarations[0] || null;
  const lineage = activeProperty ? getPropertyLineage(activeProperty.id) : { current: null, ancestors: [], descendants: [] };

  // Filtered dropdown for fast parcel lookup
  const filteredOptions = taxDeclarations.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.tdNumber.toLowerCase().includes(q) ||
      (t.prevTdNumber && t.prevTdNumber.toLowerCase().includes(q)) ||
      t.pin.toLowerCase().includes(q) ||
      t.lastName.toLowerCase().includes(q) ||
      t.firstName.toLowerCase().includes(q)
    );
  });

  return (
    <div id="property-lineage-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <GitBranch className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Tax Declaration Lineage & Genealogy Chain
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual inspection of predecessors, cancelled tax declarations, and successor transfers
          </p>
        </div>

        {/* Quick Selection Dropdown */}
        <div className="w-full md:w-80 relative">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Focus Property Record
          </label>
          <select
            id="select-lineage-focus"
            value={selectedTdId}
            onChange={(e) => setSelectedTdId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-blue-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-200 text-slate-800 truncate"
          >
            {taxDeclarations.map((td) => (
              <option key={td.id} value={td.id}>
                {td.tdNumber} ({td.propertyState}) - {td.lastName}, {td.firstName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeProperty ? (
        <div className="space-y-6">
          
          {/* Visual Genealogy Canvas / Tree */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-blue-100 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-blue-50 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Lineage Path for:
                </span>
                <span className="font-mono font-extrabold text-blue-950 text-sm">
                  {activeProperty.tdNumber}
                </span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs text-slate-600">
                  {lineage.ancestors.length} Predecessors &bull; {lineage.descendants.length} Successors
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedProperty(activeProperty);
                    setActiveTab('properties');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Dossier</span>
                </button>

                <button
                  onClick={() => onOpenSupersedeModal(activeProperty)}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Issue Successor TD</span>
                </button>
              </div>
            </div>

            {/* Tree Flow Container */}
            <div className="flex flex-col items-center gap-4 py-4 max-w-4xl w-full mx-auto">
              
              {/* 1. Ancestors / Predecessors */}
              {lineage.ancestors.length > 0 && (
                <div className="w-full space-y-4">
                  <div className="text-center">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold uppercase tracking-wider">
                      Predecessor / Ancestor Tax Declarations
                    </span>
                  </div>

                  {lineage.ancestors.slice().reverse().map((anc, idx) => (
                    <React.Fragment key={anc.id}>
                      <div className="p-4 rounded-xl border border-blue-100 bg-slate-50/80 hover:border-blue-300 transition-all shadow-xs flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800">{anc.tdNumber}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              {anc.propertyState}
                            </span>
                            <span className="text-[11px] text-slate-400">Year {anc.effectivityYear}</span>
                          </div>
                          <p className="font-bold text-slate-800 text-xs">{anc.lastName}, {anc.firstName} {anc.middleName || ''}</p>
                          <p className="text-[11px] text-slate-500">
                            PIN: {anc.pin} &bull; Title: {anc.titleNumber || 'None'} &bull; Area: {anc.area} {anc.areaUnit}
                          </p>
                          {anc.cancellationReason && (
                            <p className="text-[11px] text-rose-600 italic mt-1">
                              "{anc.cancellationReason}"
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => setSelectedTdId(anc.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-100 rounded-lg shrink-0 cursor-pointer"
                        >
                          Focus
                        </button>
                      </div>

                      <div className="flex justify-center">
                        <div className="flex flex-col items-center text-blue-500">
                          <ArrowDown className="w-5 h-5" />
                          <span className="text-[10px] font-semibold text-slate-400">Superseded upon transfer</span>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* 2. Focused Active Tax Declaration Card */}
              <div className="w-full p-5 rounded-2xl border-2 border-blue-500 bg-blue-50/70 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                      Active Selected Record
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        activeProperty.propertyState === 'CURRENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {activeProperty.propertyState}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-blue-800 font-bold">
                    Eff. Year: {activeProperty.effectivityYear}
                  </span>
                </div>

                <div>
                  <h3 className="font-mono text-lg font-extrabold text-blue-950">
                    {activeProperty.tdNumber}
                  </h3>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {activeProperty.lastName}, {activeProperty.firstName} {activeProperty.middleName || ''}
                    {activeProperty.adminBusinessName ? ` (${activeProperty.adminBusinessName})` : ''}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-blue-200/70 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">PIN</span>
                    <span className="font-mono font-semibold text-slate-800">{activeProperty.pin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Title Number</span>
                    <span className="font-semibold text-slate-800">{activeProperty.titleNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Classification</span>
                    <span className="font-semibold text-slate-800">{activeProperty.generalClass}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Assessed Value</span>
                    <span className="font-mono font-extrabold text-blue-900">
                      {settings.currencySymbol}{activeProperty.assessedValue?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {activeProperty.memoranda && (
                  <div className="p-2.5 bg-white rounded-xl border border-blue-200 text-[11px] text-slate-600 font-mono">
                    <span className="font-bold text-slate-700 block mb-0.5 font-sans">Memoranda / Stamp:</span>
                    <p className="line-clamp-3">{activeProperty.memoranda}</p>
                  </div>
                )}
              </div>

              {/* 3. Descendants / Successors */}
              {lineage.descendants.length > 0 && (
                <div className="w-full space-y-4">
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center text-emerald-500">
                      <ArrowDown className="w-5 h-5" />
                      <span className="text-[10px] font-semibold text-slate-400">Subdivided / Superseded into</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold uppercase tracking-wider">
                      Successor Tax Declarations
                    </span>
                  </div>

                  {lineage.descendants.map((desc) => (
                    <div
                      key={desc.id}
                      className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 transition-all shadow-2xs flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-950">{desc.tdNumber}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {desc.propertyState}
                          </span>
                          <span className="text-[11px] text-slate-500">Year {desc.effectivityYear}</span>
                        </div>
                        <p className="font-bold text-slate-800 text-xs">{desc.lastName}, {desc.firstName}</p>
                        <p className="text-[11px] text-slate-600">
                          PIN: {desc.pin} &bull; Title: {desc.titleNumber || 'None'} &bull; Assessed: {settings.currencySymbol}{desc.assessedValue?.toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedTdId(desc.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-lg shrink-0"
                      >
                        Focus
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* No lineage connections note */}
              {lineage.ancestors.length === 0 && lineage.descendants.length === 0 && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500 w-full mt-2">
                  <p className="font-semibold text-slate-700">Original Base Declaration</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    This Tax Declaration has no prior ancestor recorded and has not yet been superseded by any subsequent transfers.
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
};

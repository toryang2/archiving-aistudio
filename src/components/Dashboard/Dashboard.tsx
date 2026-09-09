import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Coins, 
  Plus, 
  GitBranch, 
  TrendingUp, 
  Building2, 
  Layers, 
  Calendar, 
  ArrowRight, 
  MapPin,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { TaxDeclaration } from '../../types';

interface DashboardProps {
  onOpenNewPropertyModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenNewPropertyModal }) => {
  const { 
    taxDeclarations, 
    settings, 
    setSelectedProperty, 
    setActiveTab, 
    setFilters 
  } = useApp();

  const totalCount = taxDeclarations.length;
  const currentDeclarations = taxDeclarations.filter((t) => t.propertyState === 'CURRENT');
  const cancelledDeclarations = taxDeclarations.filter((t) => t.propertyState === 'CANCELLED');
  
  const currentCount = currentDeclarations.length;
  const cancelledCount = cancelledDeclarations.length;

  const totalAssessedValue = currentDeclarations.reduce((sum, t) => sum + (t.assessedValue || 0), 0);
  const totalMarketValue = currentDeclarations.reduce((sum, t) => sum + (t.marketValue || 0), 0);

  // Group by General Class
  const classBreakdown = settings.generalClasses.map((gc) => {
    const matching = currentDeclarations.filter((t) => t.generalClass?.toLowerCase() === gc.name.toLowerCase());
    const count = matching.length;
    const value = matching.reduce((sum, t) => sum + (t.assessedValue || 0), 0);
    return {
      name: gc.name,
      count,
      value,
      percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
    };
  });

  // Group by Kind of Property
  const kindBreakdown = settings.kindsOfProperty.map((kop) => {
    const count = currentDeclarations.filter((t) => t.kindOfProperty?.toLowerCase() === kop.name.toLowerCase()).length;
    return {
      name: kop.name,
      count,
    };
  });

  // Recent 5 declarations
  const recentDeclarations = [...taxDeclarations]
    .sort((a, b) => new Date(b.createdAt || b.assessmentDate).getTime() - new Date(a.createdAt || a.assessmentDate).getTime())
    .slice(0, 5);

  const handleSelectProperty = (td: TaxDeclaration) => {
    setSelectedProperty(td);
    setActiveTab('properties');
  };

  const handleFilterStatus = (status: 'CURRENT' | 'CANCELLED') => {
    setFilters((prev) => ({ ...prev, status }));
    setActiveTab('properties');
  };

  return (
    <div id="dashboard-view" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Building2 className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-blue-50 text-xs font-semibold mb-3 border border-white/20">
            <MapPin className="w-3.5 h-3.5 text-blue-200" />
            <span>{settings.provinceName} &bull; {settings.psgcMunicipalityName} PSGC Connected</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Real Property Tax Declaration History & Archive
          </h2>
          <p className="text-sm text-blue-100/90 leading-relaxed mb-5">
            Centralized repository for real property assessment rolls, traceable title & tax declaration lineage chains, cancelled records, and supporting legal deeds.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dashboard-new-td-btn"
              onClick={onOpenNewPropertyModal}
              className="px-4 py-2.5 bg-white text-blue-900 font-bold text-xs sm:text-sm rounded-lg shadow-lg shadow-blue-900/20 hover:bg-blue-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Issue New Tax Declaration</span>
            </button>
            <button
              id="dashboard-view-lineage-btn"
              onClick={() => setActiveTab('lineage')}
              className="px-4 py-2.5 bg-blue-500/30 hover:bg-blue-500/50 text-white font-semibold text-xs sm:text-sm rounded-lg border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <GitBranch className="w-4 h-4" />
              <span>Explore Property Genealogy Tree</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total TD Archive */}
        <div 
          onClick={() => {
            setFilters((prev) => ({ ...prev, status: 'ALL' }));
            setActiveTab('properties');
          }}
          className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tax Decs</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-800">{totalCount}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{settings.availableBarangays.length}</span>
            <span>Barangays Covered</span>
          </div>
        </div>

        {/* Active Current TDs */}
        <div 
          onClick={() => handleFilterStatus('CURRENT')}
          className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Current / Active</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-950">{currentCount}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700">
            <span className="font-semibold">{totalCount > 0 ? Math.round((currentCount / totalCount) * 100) : 0}%</span>
            <span>of total taxable inventory</span>
          </div>
        </div>

        {/* Cancelled / Superseded TDs */}
        <div 
          onClick={() => handleFilterStatus('CANCELLED')}
          className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Cancelled / Historic</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-950">{cancelledCount}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-700">
            <span>Tied to predecessor deeds</span>
          </div>
        </div>

        {/* Total Assessed Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Assessed Valuation</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-900">
            {settings.currencySymbol}
            {totalAssessedValue.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 truncate">
            <span>Market Val: {settings.currencySymbol}{totalMarketValue.toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* Main Content Grid: Classifications & Recent Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Assessments Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-blue-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Recent Real Property Records</h3>
              <p className="text-xs text-slate-500">Latest assessments, revisions, and transferred tax declarations</p>
            </div>
            <button
              id="view-all-properties-btn"
              onClick={() => setActiveTab('properties')}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View Full Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-blue-50 bg-slate-50/70 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="py-2.5 px-3 rounded-l-lg">Tax Dec No.</th>
                  <th className="py-2.5 px-3">Owner / Administrator</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3 text-right">Assessed Value</th>
                  <th className="py-2.5 px-3 text-center rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {recentDeclarations.map((td) => (
                  <tr key={td.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-mono font-bold text-blue-900">{td.tdNumber}</p>
                      {td.prevTdNumber ? (
                        <p className="text-[10px] text-slate-600 flex items-center gap-0.5 mt-0.5">
                          <GitBranch className="w-2.5 h-2.5 text-blue-600" />
                          <span>Prev: {td.prevTdNumber}</span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400">Original TD</p>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">
                        {td.lastName}, {td.firstName} {td.middleName ? `${td.middleName[0]}.` : ''}
                      </p>
                      {td.adminBusinessName && (
                        <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          {td.adminBusinessName}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-700">{td.barangayName}</p>
                      <p className="text-[10px] text-slate-400">{td.titleNumber || 'No Title'}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          td.propertyState === 'CURRENT'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {td.propertyState}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <p className="font-bold text-slate-800">
                        {settings.currencySymbol}
                        {td.assessedValue?.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-slate-400">{td.generalClass}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleSelectProperty(td)}
                        className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: General Class & Property Kind Distribution */}
        <div className="space-y-6">
          
          {/* General Classification */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
              <span>Classification Breakdown</span>
              <span className="text-xs text-blue-700 font-semibold">{currentCount} Active</span>
            </h3>

            <div className="space-y-2.5">
              {classBreakdown.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>{item.name}</span>
                    <span className="font-bold text-slate-900">{item.count} properties</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${totalCount > 0 ? (item.count / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kind of Property Cards */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Kind of Property</h3>
            <div className="grid grid-cols-2 gap-2">
              {kindBreakdown.map((kind) => (
                <div key={kind.name} className="p-3 bg-slate-50 rounded-lg border border-blue-50">
                  <p className="text-xs text-slate-500 font-medium">{kind.name}</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{kind.count}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

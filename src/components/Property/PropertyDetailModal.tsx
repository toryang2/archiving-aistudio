import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Printer, 
  Edit3, 
  GitBranch, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Paperclip, 
  Building2, 
  MapPin, 
  Calendar, 
  Coins, 
  Share2, 
  ExternalLink,
  Download,
  Eye,
  Trash2,
  Upload,
  Plus,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TaxDeclaration, DocumentAttachment } from '../../types';

interface PropertyDetailModalProps {
  property: TaxDeclaration | null;
  onClose: () => void;
  onOpenEditModal: (property: TaxDeclaration) => void;
  onOpenSupersedeModal: (property: TaxDeclaration) => void;
  onOpenPrintView: (property: TaxDeclaration) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onOpenEditModal,
  onOpenSupersedeModal,
  onOpenPrintView,
}) => {
  const { 
    settings, 
    getPropertyLineage, 
    setSelectedProperty, 
    cancelTaxDeclaration, 
    addDocumentToProperty,
    deleteDocumentFromProperty,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'lineage' | 'memoranda' | 'documents'>('overview');
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('Deed of Sale');
  const [newDocNotes, setNewDocNotes] = useState('');
  const [previewingDoc, setPreviewingDoc] = useState<DocumentAttachment | null>(null);

  // Close on Escape key press with hierarchical handling
  useEffect(() => {
    if (!property) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (previewingDoc) {
          setPreviewingDoc(null);
        } else if (showDocUpload) {
          setShowDocUpload(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [property, previewingDoc, showDocUpload, onClose]);

  const lineage = property ? getPropertyLineage(property.id) : { current: null, ancestors: [], descendants: [] };
  const isCurrent = property?.propertyState === 'CURRENT';

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !newDocName.trim()) return;

    addDocumentToProperty(property.id, {
      name: newDocName.trim().endsWith('.pdf') ? newDocName.trim() : `${newDocName.trim()}.pdf`,
      type: newDocType,
      size: Math.floor(600000 + Math.random() * 2000000),
      notes: newDocNotes.trim(),
    });

    setNewDocName('');
    setNewDocNotes('');
    setShowDocUpload(false);
    showToast('Supporting document attached successfully.');
  };

  const handleCancelThisTD = () => {
    if (!property) return;
    const reason = window.prompt('Enter reason for cancelling this Tax Declaration:');
    if (reason && reason.trim()) {
      cancelTaxDeclaration(property.id, reason.trim());
    }
  };

  return (
    <AnimatePresence>
      {property && (
        <motion.div
          id="property-detail-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print"
        >
        <motion.div 
          id="property-detail-modal-card" 
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 14 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="bg-white rounded-2xl shadow-2xl border border-blue-100 max-w-4xl w-full my-auto max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-800 text-white p-6 shrink-0 flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xl font-extrabold tracking-tight text-white">
                  {property.tdNumber}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isCurrent
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isCurrent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>{property.propertyState}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-xs font-semibold text-sky-50">
                  {property.generalClass}
                </span>
              </div>
              
              <p className="text-sm font-semibold text-sky-100">
                {property.lastName}, {property.firstName} {property.middleName || ''}
                {property.adminBusinessName ? ` • ${property.adminBusinessName}` : ''}
              </p>
              <p className="text-xs text-sky-200">
                PIN: <span className="font-mono">{property.pin}</span> • {property.barangayName}, {settings.psgcMunicipalityName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenPrintView(property)}
                title="Print Official Tax Declaration"
                className="p-2 bg-white/15 hover:bg-white/25 rounded-xl border border-white/20 text-white transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                title="Press Esc to close"
                className="p-2 text-sky-200 hover:text-white rounded-xl hover:bg-sky-500/30 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-sky-100 bg-slate-50/70 px-6 pt-2 shrink-0 gap-3 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-sky-600 text-sky-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Property Dossier
            </button>
            <button
              onClick={() => setActiveTab('lineage')}
              className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'lineage'
                  ? 'border-sky-600 text-sky-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-sky-600" />
              <span>Lineage History ({lineage.ancestors.length + lineage.descendants.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('memoranda')}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'memoranda'
                  ? 'border-sky-600 text-sky-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Memoranda & Annotations
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'documents'
                  ? 'border-sky-600 text-sky-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Paperclip className="w-3.5 h-3.5 text-sky-600" />
              <span>Supporting Documents ({property.documents?.length || 0})</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* TAB 1: Overview */}
            {activeTab === 'overview' && (
              <motion.div 
                initial={{ opacity: 0, y: 6 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-6"
              >
                {/* Valuation Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-sky-50/80 rounded-2xl border border-sky-100">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assessed Value</span>
                    <p className="text-2xl font-extrabold text-sky-900 font-mono mt-0.5">
                      {settings.currencySymbol}
                      {property.assessedValue?.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-sky-700">Taxable assessment base</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Market Value</span>
                    <p className="text-xl font-bold text-slate-800 font-mono mt-0.5">
                      {settings.currencySymbol}
                      {property.marketValue?.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-500">Unit: {settings.currencySymbol}{property.unitValue?.toLocaleString()} / {property.areaUnit}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assessment Level</span>
                    <p className="text-xl font-bold text-slate-800 font-mono mt-0.5">
                      {property.assessmentLevel}%
                    </p>
                    <p className="text-[11px] text-slate-500">Effectivity: {property.effectivityYear} Q{property.effectivityQuarter || 1}</p>
                  </div>
                </div>

                {/* Two Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: Owner & Location */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Declared Owner & Location
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Primary Owner</span>
                        <p className="font-bold text-slate-800 text-sm">
                          {property.lastName}, {property.firstName} {property.middleName || ''}
                        </p>
                      </div>
                      {property.adminBusinessName && (
                        <div>
                          <span className="text-slate-400 block text-[11px]">Administrator / Business Name</span>
                          <p className="font-semibold text-slate-800">{property.adminBusinessName}</p>
                        </div>
                      )}
                      {property.taxpayerTin && (
                        <div>
                          <span className="text-slate-400 block text-[11px]">Taxpayer TIN</span>
                          <p className="font-mono text-slate-700">{property.taxpayerTin}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400 block text-[11px]">Property Street Address</span>
                        <p className="font-semibold text-slate-800">{property.address}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Barangay & Municipality</span>
                        <p className="font-semibold text-slate-800">
                          {property.barangayName}, {settings.psgcMunicipalityName}, {settings.provinceName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Land, Title & Cadastral */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Cadastral & Title Description
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Certificate of Title No.</span>
                        <p className="font-bold text-slate-800">{property.titleNumber || 'No Title Annotated'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Lot Number</span>
                          <p className="font-semibold text-slate-800">{property.lotNumber || '—'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Survey Number</span>
                          <p className="font-semibold text-slate-800">{property.surveyNumber || '—'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Total Land / Floor Area</span>
                          <p className="font-bold text-slate-800">{property.area?.toLocaleString()} {property.areaUnit}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Kind of Property</span>
                          <p className="font-semibold text-slate-800">{property.kindOfProperty}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Actual Use</span>
                        <p className="font-semibold text-slate-800">{property.actualUse || property.generalClass}</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Lineage Predecessor Notice if exists */}
                {property.prevTdNumber && (
                  <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <GitBranch className="w-4 h-4 text-sky-600" />
                      <div>
                        <span className="text-slate-500">Connected Predecessor Tax Dec:</span>
                        <p className="font-mono font-bold text-sky-950">{property.prevTdNumber}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('lineage')}
                      className="px-3 py-1.5 bg-white border border-sky-200 rounded-lg text-sky-800 font-bold hover:bg-sky-100 transition-colors cursor-pointer"
                    >
                      View Lineage History &rarr;
                    </button>
                  </div>
                )}

                {/* Cancellation Info if cancelled */}
                {!isCurrent && (
                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-rose-800">
                      <XCircle className="w-4 h-4" />
                      <span>Cancellation Record Notice</span>
                    </div>
                    <p><strong>Cancellation Date:</strong> {property.cancelledDate || 'N/A'}</p>
                    <p><strong>Reason:</strong> {property.cancellationReason || 'Superseded upon transfer of title.'}</p>
                    {property.supersededByTdNumber && (
                      <p><strong>Superseded By TD:</strong> <span className="font-mono font-bold">{property.supersededByTdNumber}</span></p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: Lineage History */}
            {activeTab === 'lineage' && (
              <motion.div 
                initial={{ opacity: 0, y: 6 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-6"
              >
                <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-900">
                  <p className="font-bold mb-1">Tax Declaration Genealogy & History Chain</p>
                  <p className="text-slate-600">
                    Trace the succession of titles, transfers of ownership, and superseded tax declarations tied to this parcel over time.
                  </p>
                </div>

                {/* Timeline Tree */}
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-sky-200">
                  
                  {/* Ancestors (Oldest to newest) */}
                  {lineage.ancestors.slice().reverse().map((anc, idx) => (
                    <div key={anc.id} className="relative flex items-start gap-4 pl-2">
                      <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 z-10 border-2 border-white shadow-xs">
                        P{idx + 1}
                      </div>
                      <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-800">{anc.tdNumber}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {anc.propertyState}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-700">{anc.lastName}, {anc.firstName} ({anc.titleNumber})</p>
                        <p className="text-[11px] text-slate-500">
                          Assessed: {settings.currencySymbol}{anc.assessedValue?.toLocaleString()} • Eff: {anc.effectivityYear}
                        </p>
                        <button
                          onClick={() => setSelectedProperty(anc)}
                          className="mt-2 text-[11px] font-bold text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Inspect This Historical Record &rarr;
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Current Selected TD (Highlight) */}
                  <div className="relative flex items-start gap-4 pl-2">
                    <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 z-10 border-2 border-white shadow-md">
                      •
                    </div>
                    <div className="flex-1 bg-sky-50/90 p-4 rounded-xl border-2 border-sky-400 text-xs space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sky-950 text-sm">{property.tdNumber} (Active Selection)</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCurrent ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {property.propertyState}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm">
                        {property.lastName}, {property.firstName} {property.adminBusinessName ? `(${property.adminBusinessName})` : ''}
                      </p>
                      <p className="text-slate-600">
                        PIN: {property.pin} • Title: {property.titleNumber || 'No Title'} • Area: {property.area} {property.areaUnit}
                      </p>
                      <p className="font-bold text-sky-900">
                        Assessed Value: {settings.currencySymbol}{property.assessedValue?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Descendants (if any) */}
                  {lineage.descendants.map((desc, idx) => (
                    <div key={desc.id} className="relative flex items-start gap-4 pl-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 z-10 border-2 border-white shadow-xs">
                        S{idx + 1}
                      </div>
                      <div className="flex-1 bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-emerald-950">{desc.tdNumber} (Successor TD)</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {desc.propertyState}
                          </span>
                        </div>
                        <p className="font-bold text-slate-800">{desc.lastName}, {desc.firstName}</p>
                        <p className="text-[11px] text-slate-600">
                          Assessed: {settings.currencySymbol}{desc.assessedValue?.toLocaleString()} • Eff: {desc.effectivityYear}
                        </p>
                        <button
                          onClick={() => setSelectedProperty(desc)}
                          className="mt-2 text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Inspect Successor Record &rarr;
                        </button>
                      </div>
                    </div>
                  ))}

                </div>
              </motion.div>
            )}

            {/* TAB 3: Memoranda */}
            {activeTab === 'memoranda' && (
              <motion.div 
                initial={{ opacity: 0, y: 6 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-4"
              >
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {property.memoranda || 'No memoranda annotations recorded for this property.'}
                </div>

                <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-900 space-y-1">
                  <p className="font-bold">Assessment Approvals & Signatures</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Appraised by</span>
                      <p className="font-semibold text-slate-800">{property.appraisedBy || settings.appraiserName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tax Mapped by</span>
                      <p className="font-semibold text-slate-800">{property.taxMapper || settings.taxMapperName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Approved by</span>
                      <p className="font-semibold text-slate-800">{property.approvedBy || settings.municipalAssessor}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: Supporting Documents */}
            {activeTab === 'documents' && (
              <motion.div 
                initial={{ opacity: 0, y: 6 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Attached Deeds, Titles & Clearances
                    </h4>
                    <p className="text-xs text-slate-500">Legal proof of ownership and assessment references</p>
                  </div>
                  <button
                    onClick={() => setShowDocUpload(!showDocUpload)}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Attach Document</span>
                  </button>
                </div>

                {/* Upload Box toggle */}
                <AnimatePresence>
                  {showDocUpload && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleUploadDoc} 
                      className="p-4 bg-sky-50 rounded-xl border border-sky-200 space-y-3 text-xs overflow-hidden"
                    >
                      <p className="font-bold text-sky-900">New Document Upload</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          required
                          value={newDocName}
                          onChange={(e) => setNewDocName(e.target.value)}
                          placeholder="e.g. Deed_of_Sale.pdf"
                          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                        />
                        <select
                          value={newDocType}
                          onChange={(e) => setNewDocType(e.target.value)}
                          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 cursor-pointer"
                        >
                          <option value="Deed of Sale">Deed of Absolute Sale</option>
                          <option value="Title Copy">Title Copy (OCT / TCT / CCT)</option>
                          <option value="eCAR / CAR">BIR eCAR / CAR</option>
                          <option value="Transfer Tax">Transfer Tax Receipt</option>
                          <option value="Tax Clearance">Tax Clearance</option>
                          <option value="Survey Plan">Survey / Subdivision Plan</option>
                          <option value="Other">Other Legal Document</option>
                        </select>
                        <input
                          type="text"
                          value={newDocNotes}
                          onChange={(e) => setNewDocNotes(e.target.value)}
                          placeholder="Reference / Notarial notes..."
                          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowDocUpload(false)}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-200/60 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 cursor-pointer"
                        >
                          Confirm Upload
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Document List */}
                {(!property.documents || property.documents.length === 0) ? (
                  <div className="p-10 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                    <Paperclip className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p>No supporting documents uploaded yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {property.documents.map((doc) => (
                      <div key={doc.id} className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-sky-300 transition-all flex flex-col justify-between gap-3 text-xs shadow-2xs">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-800 truncate" title={doc.name}>{doc.name}</p>
                            <span className="inline-block mt-0.5 px-2 py-0.2 rounded-md bg-sky-50 text-sky-800 text-[10px] font-bold border border-sky-100">
                              {doc.type}
                            </span>
                            {doc.notes && (
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{doc.notes}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                          <span>{Math.round(doc.size / 1024)} KB • {doc.uploadDate}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setPreviewingDoc(doc)}
                              className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg cursor-pointer transition-colors"
                              title="View Document Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                deleteDocumentFromProperty(property.id, doc.id);
                                showToast('Document deleted.');
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                              title="Remove Document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 shrink-0">
            <div className="flex items-center gap-2">
              {isCurrent && (
                <button
                  onClick={handleCancelThisTD}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                >
                  Mark as Cancelled
                </button>
              )}
              <button
                onClick={() => onOpenSupersedeModal(property)}
                className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Supersede / Issue New TD</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline mr-1">Press <kbd className="px-1 py-0.5 bg-slate-200 text-slate-700 rounded font-mono text-[10px]">Esc</kbd> to close</span>
              <button
                onClick={() => onOpenEditModal(property)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit TD</span>
              </button>
              <button
                onClick={() => onOpenPrintView(property)}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Declaration</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Embedded Document Preview Modal */}
        <AnimatePresence>
          {previewingDoc && (
            <motion.div
              id="document-preview-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) setPreviewingDoc(null);
              }}
              className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 10 }}
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col"
              >
                <div className="bg-sky-900 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-300" />
                    <div>
                      <h3 className="font-bold text-sm truncate max-w-[280px]">{previewingDoc.name}</h3>
                      <p className="text-[11px] text-sky-200">{previewingDoc.type} • {Math.round(previewingDoc.size / 1024)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewingDoc(null)}
                    className="p-1 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 cursor-pointer"
                    title="Press Esc to close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4 text-xs text-slate-700 bg-slate-50">
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Document Type</span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                        {previewingDoc.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Referenced Property Tax Dec</span>
                      <span className="font-mono font-bold text-slate-800">{property.tdNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Declared Owner</span>
                      <span className="font-semibold text-slate-800">{property.lastName}, {property.firstName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Archival Notes / Notarial Ref</span>
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px]">
                        {previewingDoc.notes || 'No annotations recorded.'}
                      </p>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Archived: {previewingDoc.uploadDate}</span>
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Digital Copy
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px]">Esc</kbd> to return</span>
                  <button
                    onClick={() => {
                      showToast(`Downloaded a local copy of ${previewingDoc.name}`);
                      setPreviewingDoc(null);
                    }}
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Save, 
  Building2, 
  GitBranch, 
  MapPin, 
  FileText, 
  UploadCloud, 
  Plus, 
  Trash2, 
  Info, 
  Calculator, 
  CheckCircle,
  FileCheck,
  AlertCircle,
  Tag,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TaxDeclaration, DocumentAttachment, PropertyState } from '../../types';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProperty: TaxDeclaration | null;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  editingProperty,
}) => {
  const { 
    settings, 
    taxDeclarations, 
    createTaxDeclaration, 
    updateTaxDeclaration, 
    showToast 
  } = useApp();

  const isEditing = !!editingProperty;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Form State
  const [tdNumber, setTdNumber] = useState('');
  const [prevTdNumber, setPrevTdNumber] = useState('');
  const [pin, setPin] = useState('');
  const [propertyState, setPropertyState] = useState<PropertyState>('CURRENT');
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelledDate, setCancelledDate] = useState('');

  // Owner
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [adminBusinessName, setAdminBusinessName] = useState('');
  const [taxpayerTin, setTaxpayerTin] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Location
  const [address, setAddress] = useState('');
  const [barangayCode, setBarangayCode] = useState('');
  const [barangayName, setBarangayName] = useState('');

  // Title / Cadastral
  const [titleNumber, setTitleNumber] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [blockNumber, setBlockNumber] = useState('');

  // Valuation
  const [area, setArea] = useState<number>(300);
  const [areaUnit, setAreaUnit] = useState<'sqm' | 'ha'>('sqm');
  const [unitValue, setUnitValue] = useState<number>(5000);
  const [marketValue, setMarketValue] = useState<number>(1500000);
  const [assessmentLevel, setAssessmentLevel] = useState<number>(20);
  const [assessedValue, setAssessedValue] = useState<number>(300000);

  // Classification
  const [kindOfProperty, setKindOfProperty] = useState('Land');
  const [generalClass, setGeneralClass] = useState('Residential');
  const [actualUse, setActualUse] = useState('');

  // Effectivity & Date
  const [effectivityYear, setEffectivityYear] = useState<number>(new Date().getFullYear());
  const [effectivityQuarter, setEffectivityQuarter] = useState<1 | 2 | 3 | 4>(1);
  const [assessmentDate, setAssessmentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Memoranda & Legal Notes
  const [memoranda, setMemoranda] = useState('');

  // Documents
  const [documents, setDocuments] = useState<DocumentAttachment[]>([]);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('Deed of Sale');
  const [newDocNotes, setNewDocNotes] = useState('');

  // Active form section
  const [activeSection, setActiveSection] = useState<'basic' | 'valuation' | 'memoranda' | 'documents'>('basic');

  // Initialize or reset form
  useEffect(() => {
    if (editingProperty) {
      setTdNumber(editingProperty.tdNumber);
      setPrevTdNumber(editingProperty.prevTdNumber || '');
      setPin(editingProperty.pin);
      setPropertyState(editingProperty.propertyState);
      setCancellationReason(editingProperty.cancellationReason || '');
      setCancelledDate(editingProperty.cancelledDate || '');

      setFirstName(editingProperty.firstName);
      setLastName(editingProperty.lastName);
      setMiddleName(editingProperty.middleName || '');
      setAdminBusinessName(editingProperty.adminBusinessName || '');
      setTaxpayerTin(editingProperty.taxpayerTin || '');
      setContactNumber(editingProperty.contactNumber || '');

      setAddress(editingProperty.address);
      setBarangayCode(editingProperty.barangayCode);
      setBarangayName(editingProperty.barangayName);

      setTitleNumber(editingProperty.titleNumber);
      setLotNumber(editingProperty.lotNumber);
      setSurveyNumber(editingProperty.surveyNumber);
      setBlockNumber(editingProperty.blockNumber || '');

      setArea(editingProperty.area);
      setAreaUnit(editingProperty.areaUnit);
      setUnitValue(editingProperty.unitValue || 0);
      setMarketValue(editingProperty.marketValue);
      setAssessmentLevel(editingProperty.assessmentLevel);
      setAssessedValue(editingProperty.assessedValue);

      setKindOfProperty(editingProperty.kindOfProperty);
      setGeneralClass(editingProperty.generalClass);
      setActualUse(editingProperty.actualUse || '');

      setEffectivityYear(editingProperty.effectivityYear);
      setEffectivityQuarter(editingProperty.effectivityQuarter || 1);
      setAssessmentDate(editingProperty.assessmentDate);

      setMemoranda(editingProperty.memoranda);
      setDocuments(editingProperty.documents || []);
    } else {
      // Default new tax declaration
      const defaultBrgy = settings.availableBarangays[0] || { code: '001', name: 'Poblacion' };
      const defaultKind = settings.kindsOfProperty[0]?.name || 'Land';
      const defaultGC = settings.generalClasses[0] || { name: 'Residential', defaultAssessmentLevel: 20 };

      const year = new Date().getFullYear();
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      setTdNumber(`TD-${year}-04-001-${randomSeq}`);
      setPrevTdNumber('');
      setPin(`024-04-0001-001-${Math.floor(10 + Math.random() * 90)}`);
      setPropertyState('CURRENT');
      setCancellationReason('');
      setCancelledDate('');

      setFirstName('');
      setLastName('');
      setMiddleName('');
      setAdminBusinessName('');
      setTaxpayerTin('');
      setContactNumber('');

      setAddress('');
      setBarangayCode(defaultBrgy.code);
      setBarangayName(defaultBrgy.name);

      setTitleNumber('');
      setLotNumber('Lot 1');
      setSurveyNumber('Psd-04-000000');
      setBlockNumber('');

      setArea(250);
      setAreaUnit('sqm');
      setUnitValue(6000);
      setMarketValue(1500000);
      setAssessmentLevel(defaultGC.defaultAssessmentLevel || 20);
      setAssessedValue(300000);

      setKindOfProperty(defaultKind);
      setGeneralClass(defaultGC.name);
      setActualUse('Residential Single Family');

      setEffectivityYear(year);
      setEffectivityQuarter(1);
      setAssessmentDate(new Date().toISOString().split('T')[0]);

      setMemoranda('Standard assessment entry pursuant to the Local Government Code of 1991 (R.A. 7160). Real Property Tax subject to regular municipal payment schedules.');
      setDocuments([]);
    }
  }, [editingProperty, isOpen, settings]);

  if (!isOpen) return null;

  // Auto calculate market value & assessed value
  const handleAreaOrUnitChange = (newArea: number, newUnitVal: number, newLevel: number) => {
    const calcMarketVal = Math.round(newArea * newUnitVal);
    const calcAssessedVal = Math.round((calcMarketVal * newLevel) / 100);
    setArea(newArea);
    setUnitValue(newUnitVal);
    setMarketValue(calcMarketVal);
    setAssessmentLevel(newLevel);
    setAssessedValue(calcAssessedVal);
  };

  // Change general class -> auto update default assessment level
  const handleGeneralClassChange = (selectedClassName: string) => {
    setGeneralClass(selectedClassName);
    const foundClass = settings.generalClasses.find(
      (c) => c.name.toLowerCase() === selectedClassName.toLowerCase()
    );
    if (foundClass) {
      const newLevel = foundClass.defaultAssessmentLevel;
      setAssessmentLevel(newLevel);
      const calcAssessedVal = Math.round((marketValue * newLevel) / 100);
      setAssessedValue(calcAssessedVal);
    }
  };

  // Template insert into memoranda
  const handleInsertTemplate = (text: string) => {
    setMemoranda((prev) => (prev ? `${prev}\n\n${text}` : text));
    showToast('Memoranda stamp inserted.');
  };

  // Add document
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) {
      showToast('Please provide a document title or filename.', 'warning');
      return;
    }

    const doc: DocumentAttachment = {
      id: 'doc-' + Date.now(),
      name: newDocName.trim().endsWith('.pdf') ? newDocName.trim() : `${newDocName.trim()}.pdf`,
      type: newDocType,
      size: Math.floor(500000 + Math.random() * 2500000),
      uploadDate: new Date().toISOString().split('T')[0],
      notes: newDocNotes.trim(),
    };

    setDocuments((prev) => [...prev, doc]);
    setNewDocName('');
    setNewDocNotes('');
    showToast(`Attached ${doc.name}`);
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tdNumber.trim()) {
      showToast('Tax Declaration Number is required.', 'error');
      return;
    }
    if (!lastName.trim() && !adminBusinessName.trim()) {
      showToast('Please specify an Owner Last Name or Business/Entity Name.', 'error');
      return;
    }
    if (!pin.trim()) {
      showToast('Property Identification Number (PIN) is required.', 'error');
      return;
    }

    const propertyPayload = {
      tdNumber: tdNumber.trim(),
      prevTdNumber: prevTdNumber.trim(),
      pin: pin.trim(),
      propertyState,
      cancellationReason: propertyState === 'CANCELLED' ? cancellationReason : undefined,
      cancelledDate: propertyState === 'CANCELLED' ? cancelledDate : undefined,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      middleName: middleName.trim(),
      adminBusinessName: adminBusinessName.trim(),
      taxpayerTin: taxpayerTin.trim(),
      contactNumber: contactNumber.trim(),
      address: address.trim(),
      barangayCode,
      barangayName,
      municipalityCode: settings.psgcMunicipalityCode,
      municipalityName: settings.psgcMunicipalityName,
      provinceName: settings.provinceName,
      titleNumber: titleNumber.trim(),
      lotNumber: lotNumber.trim(),
      surveyNumber: surveyNumber.trim(),
      blockNumber: blockNumber.trim(),
      area,
      areaUnit,
      unitValue,
      marketValue,
      assessmentLevel,
      assessedValue,
      kindOfProperty,
      generalClass,
      actualUse: actualUse.trim(),
      effectivityYear,
      effectivityQuarter,
      assessmentDate,
      memoranda: memoranda.trim(),
      documents,
      approvedBy: settings.municipalAssessor,
      appraisedBy: settings.appraiserName,
      taxMapper: settings.taxMapperName,
    };

    setIsSubmitting(true);
    setTimeout(() => {
      if (isEditing && editingProperty) {
        updateTaxDeclaration(editingProperty.id, propertyPayload);
      } else {
        createTaxDeclaration(propertyPayload);
      }
      setIsSubmitting(false);
      onClose();
    }, 350);
  };

  // Previous TD options for auto-linking
  const availablePreviousTds = taxDeclarations.filter(
    (t) => (!editingProperty || t.id !== editingProperty.id)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="property-form-modal-overlay"
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
            id="property-form-modal-card" 
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="bg-white rounded-2xl shadow-2xl border border-sky-100 max-w-4xl w-full my-auto max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    {isEditing ? `Edit Tax Declaration: ${editingProperty.tdNumber}` : 'New Real Property Tax Declaration'}
                  </h2>
                  <p className="text-xs text-sky-100 font-medium">
                    {settings.lguName} &bull; Assessment & Lineage Archival
                  </p>
                </div>
              </div>

              <button
                id="close-property-form-btn"
                onClick={onClose}
                title="Press Esc to close"
                className="p-1.5 text-sky-200 hover:text-white rounded-xl hover:bg-sky-500/30 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-sky-100 bg-sky-50/50 px-6 pt-2 shrink-0 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSection('basic')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'basic'
                ? 'border-sky-600 text-sky-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Property & Owner Details
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('valuation')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'valuation'
                ? 'border-sky-600 text-sky-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Valuation & Assessment
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('memoranda')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeSection === 'memoranda'
                ? 'border-sky-600 text-sky-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Memoranda & Annotations
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('documents')}
            className={`pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'documents'
                ? 'border-sky-600 text-sky-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>4. Supporting Documents</span>
            {documents.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-600 text-white font-bold">
                {documents.length}
              </span>
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* SECTION 1: Basic & Location */}
          {activeSection === 'basic' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* TD Number & Predecessor Connection */}
              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-900 uppercase tracking-wider">
                  <GitBranch className="w-4 h-4 text-sky-600" />
                  <span>Tax Declaration Identification & Lineage Link</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tax Declaration No. <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-td-number"
                      type="text"
                      required
                      value={tdNumber}
                      onChange={(e) => setTdNumber(e.target.value)}
                      placeholder="e.g. TD-2024-04-001-00912"
                      className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-300 text-sky-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Previous Tax Declaration (Lineage Link)
                    </label>
                    <div className="relative">
                      <input
                        id="input-prev-td-number"
                        type="text"
                        list="previous-td-options"
                        value={prevTdNumber}
                        onChange={(e) => setPrevTdNumber(e.target.value)}
                        placeholder="Connect predecessor TD..."
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-300 text-slate-800"
                      />
                      <datalist id="previous-td-options">
                        {availablePreviousTds.map((t) => (
                          <option key={t.id} value={t.tdNumber}>
                            {t.lastName}, {t.firstName} &bull; PIN: {t.pin} &bull; {t.barangayName}
                          </option>
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Property State <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="input-property-state"
                      value={propertyState}
                      onChange={(e) => setPropertyState(e.target.value as PropertyState)}
                      className={`w-full px-3 py-2 text-xs font-bold rounded-xl border ${
                        propertyState === 'CURRENT'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <option value="CURRENT">CURRENT (Active Assessment)</option>
                      <option value="CANCELLED">CANCELLED (Superseded / Inactive)</option>
                    </select>
                  </div>
                </div>

                {prevTdNumber && propertyState === 'CURRENT' && (
                  <div className="flex items-start gap-2 p-3 bg-sky-100/70 rounded-lg text-xs text-sky-900 border border-sky-200">
                    <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                    <p>
                      <strong>Automatic Lineage Synchronization:</strong> Saving this will automatically mark the linked previous tax declaration (<strong>{prevTdNumber}</strong>) as <strong>CANCELLED</strong> and record this TD as its superseding successor.
                    </p>
                  </div>
                )}

                {propertyState === 'CANCELLED' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-sky-200/60">
                    <div>
                      <label className="block text-xs font-semibold text-rose-800 mb-1">
                        Cancellation Date
                      </label>
                      <input
                        type="date"
                        value={cancelledDate}
                        onChange={(e) => setCancelledDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-rose-200 rounded-lg text-rose-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-rose-800 mb-1">
                        Reason for Cancellation
                      </label>
                      <input
                        type="text"
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        placeholder="e.g. Sold and transferred under Deed of Absolute Sale"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-rose-200 rounded-lg text-rose-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PIN & Title Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Property PIN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-pin"
                    type="text"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="024-04-0001-001-01"
                    className="w-full px-3 py-2 text-xs font-mono font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Title Number (OCT/TCT/CCT)
                  </label>
                  <input
                    id="input-title-number"
                    type="text"
                    value={titleNumber}
                    onChange={(e) => setTitleNumber(e.target.value)}
                    placeholder="e.g. TCT No. 184920"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-300 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lot Number
                  </label>
                  <input
                    id="input-lot-number"
                    type="text"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    placeholder="e.g. Lot 10-A-1"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-300 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Survey / Cadastral No.
                  </label>
                  <input
                    id="input-survey-number"
                    type="text"
                    value={surveyNumber}
                    onChange={(e) => setSurveyNumber(e.target.value)}
                    placeholder="e.g. Psd-04-2024-001"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-300 text-slate-800"
                  />
                </div>
              </div>

              {/* Owner Information */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Owner / Administrator Information
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Last Name / Family Name
                    </label>
                    <input
                      id="input-last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Guerrero"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      First Name
                    </label>
                    <input
                      id="input-first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Mateo"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Middle Name / Initial
                    </label>
                    <input
                      id="input-middle-name"
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="e.g. Lim"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-300 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Administrator / Company / Business Name
                    </label>
                    <input
                      id="input-business-name"
                      type="text"
                      value={adminBusinessName}
                      onChange={(e) => setAdminBusinessName(e.target.value)}
                      placeholder="e.g. M. Lim & Associates Development Corp."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Taxpayer TIN
                    </label>
                    <input
                      id="input-taxpayer-tin"
                      type="text"
                      value={taxpayerTin}
                      onChange={(e) => setTaxpayerTin(e.target.value)}
                      placeholder="e.g. 441-209-883-000"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Contact / Phone Number
                    </label>
                    <input
                      id="input-contact-number"
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="e.g. 0917-882-9901"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-300 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Location (PSGC Integrated) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location / Barangay (PSGC Configured) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="input-barangay"
                    required
                    value={barangayCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setBarangayCode(code);
                      const found = settings.availableBarangays.find((b) => b.code === code);
                      if (found) setBarangayName(found.name);
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-300 text-slate-800"
                  >
                    {settings.availableBarangays.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Municipality of {settings.psgcMunicipalityName}, {settings.provinceName}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Street / Sitio / Number Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 142-A Rizal Avenue, corner San Mateo St."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-300 text-slate-800"
                  />
                </div>
              </div>

            </div>
          )}

          {/* SECTION 2: Valuation & Assessment */}
          {activeSection === 'valuation' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Classification */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kind of Property (from Settings)
                  </label>
                  <select
                    id="input-kind-property"
                    value={kindOfProperty}
                    onChange={(e) => setKindOfProperty(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-300 text-slate-800"
                  >
                    {settings.kindsOfProperty.map((k) => (
                      <option key={k.id} value={k.name}>
                        {k.name} ({k.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    General Classification (from Settings)
                  </label>
                  <select
                    id="input-general-class"
                    value={generalClass}
                    onChange={(e) => handleGeneralClassChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-300 text-slate-800"
                  >
                    {settings.generalClasses.map((gc) => (
                      <option key={gc.id} value={gc.name}>
                        {gc.name} ({gc.defaultAssessmentLevel}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Actual Use
                  </label>
                  <input
                    id="input-actual-use"
                    type="text"
                    value={actualUse}
                    onChange={(e) => setActualUse(e.target.value)}
                    placeholder="e.g. Residential Two-Storey Single Detached"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-300 text-slate-800"
                  />
                </div>
              </div>

              {/* Area & Valuation Calculator */}
              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-900 uppercase tracking-wider">
                    <Calculator className="w-4 h-4 text-sky-600" />
                    <span>Real Property Valuation Engine</span>
                  </div>
                  <span className="text-xs text-sky-700 font-semibold">Automatic Assessed Value Computation</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Area & Unit */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Area
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        id="input-area"
                        type="number"
                        min="0"
                        step="any"
                        value={area}
                        onChange={(e) => handleAreaOrUnitChange(parseFloat(e.target.value) || 0, unitValue, assessmentLevel)}
                        className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-800"
                      />
                      <select
                        id="input-area-unit"
                        value={areaUnit}
                        onChange={(e) => setAreaUnit(e.target.value as 'sqm' | 'ha')}
                        className="px-2 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl text-slate-800"
                      >
                        <option value="sqm">sq.m.</option>
                        <option value="ha">ha</option>
                      </select>
                    </div>
                  </div>

                  {/* Unit Value */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Base Unit Market Value ({settings.currencySymbol})
                    </label>
                    <input
                      id="input-unit-value"
                      type="number"
                      min="0"
                      step="any"
                      value={unitValue}
                      onChange={(e) => handleAreaOrUnitChange(area, parseFloat(e.target.value) || 0, assessmentLevel)}
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl text-slate-800"
                    />
                  </div>

                  {/* Market Value */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Total Market Value ({settings.currencySymbol})
                    </label>
                    <input
                      id="input-market-value"
                      type="number"
                      min="0"
                      value={marketValue}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setMarketValue(val);
                        setAssessedValue(Math.round((val * assessmentLevel) / 100));
                      }}
                      className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>

                  {/* Assessment Level */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assessment Level (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="input-assessment-level"
                        type="number"
                        min="1"
                        max="100"
                        value={assessmentLevel}
                        onChange={(e) => {
                          const lvl = parseFloat(e.target.value) || 0;
                          setAssessmentLevel(lvl);
                          setAssessedValue(Math.round((marketValue * lvl) / 100));
                        }}
                        className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl text-slate-900"
                      />
                      <span className="text-xs font-bold text-slate-600">%</span>
                    </div>
                  </div>
                </div>

                {/* Big Result Box */}
                <div className="p-4 bg-sky-600 rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-sky-100">
                      Total Taxable Assessed Value
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold font-mono mt-0.5">
                      {settings.currencySymbol}
                      {assessedValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-xs text-sky-100 text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-sky-400">
                    <p>Formula: Market Value &times; Assessment Level</p>
                    <p className="font-mono mt-0.5 font-bold">
                      {settings.currencySymbol}{marketValue.toLocaleString()} &times; {assessmentLevel}% = {settings.currencySymbol}{assessedValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assessment Dates & Effectivity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Effectivity Year
                  </label>
                  <input
                    id="input-effectivity-year"
                    type="number"
                    min="1980"
                    max="2050"
                    value={effectivityYear}
                    onChange={(e) => setEffectivityYear(parseInt(e.target.value) || new Date().getFullYear())}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Effectivity Quarter
                  </label>
                  <select
                    id="input-effectivity-quarter"
                    value={effectivityQuarter}
                    onChange={(e) => setEffectivityQuarter(parseInt(e.target.value) as 1 | 2 | 3 | 4)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value={1}>1st Quarter (Jan - Mar)</option>
                    <option value={2}>2nd Quarter (Apr - Jun)</option>
                    <option value={3}>3rd Quarter (Jul - Sep)</option>
                    <option value={4}>4th Quarter (Oct - Dec)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Assessment
                  </label>
                  <input
                    id="input-assessment-date"
                    type="date"
                    value={assessmentDate}
                    onChange={(e) => setAssessmentDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>
              </div>

            </div>
          )}

          {/* SECTION 3: Memoranda & Legal Annotations */}
          {activeSection === 'memoranda' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Memoranda & Legal Annotations (Long Text)
                  </label>
                  <p className="text-xs text-slate-500">
                    Legal transfers, liens, encumbrances, court decrees, and deed details
                  </p>
                </div>

                {/* Quick Templates */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-500">Insert Stamp:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertTemplate(`Issued pursuant to Deed of Absolute Sale dated ${assessmentDate}. BIR eCAR No. verified and recorded. Prior TD ${prevTdNumber || 'N/A'} cancelled.`)}
                    className="px-2 py-1 text-[11px] bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors"
                  >
                    + Sale Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTemplate(`Subject to Section 4, Rule 74 of the Rules of Court for a period of two (2) years from the date of extrajudicial settlement.`)}
                    className="px-2 py-1 text-[11px] bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors"
                  >
                    + Rule 74 Lien
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTemplate(`Assessment revised pursuant to Municipal Tax Ordinance and General Revision of Real Property Assessments.`)}
                    className="px-2 py-1 text-[11px] bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors"
                  >
                    + Gen. Revision
                  </button>
                </div>
              </div>

              <textarea
                id="input-memoranda"
                rows={8}
                value={memoranda}
                onChange={(e) => setMemoranda(e.target.value)}
                placeholder="Enter detailed memoranda notes, transfer descriptions, encumbrances, or cancellation clauses..."
                className="w-full p-3.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-300 focus:border-sky-500 text-slate-800 leading-relaxed"
              />

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-semibold text-slate-700">Official Assessor Signatories for this record:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-500">
                  <div>Appraised by: <span className="font-semibold text-slate-700">{settings.appraiserName}</span></div>
                  <div>Tax Mapped by: <span className="font-semibold text-slate-700">{settings.taxMapperName}</span></div>
                  <div>Approved by: <span className="font-semibold text-slate-700">{settings.municipalAssessor}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Supporting Documents */}
          {activeSection === 'documents' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Document Upload / Entry Box */}
              <div className="p-4 bg-sky-50/70 rounded-xl border border-sky-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-900 uppercase tracking-wider">
                  <UploadCloud className="w-4 h-4 text-sky-600" />
                  <span>Upload or Attach Supporting Legal Documents</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Document Title / File Name
                    </label>
                    <input
                      id="input-doc-name"
                      type="text"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      placeholder="e.g. Deed_of_Absolute_Sale_2024.pdf"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Document Classification
                    </label>
                    <select
                      id="input-doc-type"
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800"
                    >
                      <option value="Deed of Sale">Deed of Absolute Sale</option>
                      <option value="Title Copy">Title Copy (OCT / TCT / CCT)</option>
                      <option value="eCAR / CAR">BIR eCAR / CAR</option>
                      <option value="Transfer Tax">Transfer Tax Official Receipt</option>
                      <option value="Tax Clearance">Real Property Tax Clearance</option>
                      <option value="Survey Plan">Subdivision / Survey Plan</option>
                      <option value="Sworn Statement">Sworn Statement of Value</option>
                      <option value="Other">Other Supporting Affidavit / Decree</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Document Notes / Reference No.
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="input-doc-notes"
                        type="text"
                        value={newDocNotes}
                        onChange={(e) => setNewDocNotes(e.target.value)}
                        placeholder="e.g. Doc # 412, Book XII"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleAddDocument}
                        className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shrink-0 transition-colors"
                      >
                        Attach
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document List */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700">
                  Attached Documents ({documents.length})
                </p>

                {documents.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p>No supporting documents attached yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Attach deeds of sale, titles, CAR, or tax clearances using the form above.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{doc.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">
                              <span className="font-semibold text-sky-800">{doc.type}</span> &bull; {Math.round(doc.size / 1024)} KB &bull; {doc.uploadDate}
                              {doc.notes ? ` &bull; ${doc.notes}` : ''}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(doc.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Footer & Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              id="cancel-property-form-btn"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline mr-1">Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px]">Esc</kbd> to close</span>
              {activeSection !== 'documents' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeSection === 'basic') setActiveSection('valuation');
                    else if (activeSection === 'valuation') setActiveSection('memoranda');
                    else if (activeSection === 'memoranda') setActiveSection('documents');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors cursor-pointer"
                >
                  Next Section &rarr;
                </button>
              ) : null}

              <button
                type="submit"
                id="save-tax-declaration-btn"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl shadow-xs shadow-sky-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditing ? 'Save Changes' : 'Issue Tax Declaration'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

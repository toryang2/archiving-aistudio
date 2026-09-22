import React, { useState, useMemo } from 'react';
import { 
  X, 
  Receipt, 
  FileText, 
  User, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Tag, 
  Search, 
  CheckCircle2, 
  Printer, 
  HelpCircle,
  Building,
  ShieldCheck,
  FileSignature
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CertificationRequest, TaxDeclaration } from '../../types';

interface CertificationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxDeclaration?: TaxDeclaration | null;
  certificationToEdit?: CertificationRequest | null;
  onSuccessPrint?: (cert: CertificationRequest) => void;
}

const COMMON_PURPOSES = [
  'BIR eCAR / Capital Gains Tax',
  'Bank Loan Application / Collateral',
  'Transfer of Title / Registry of Deeds',
  'Bail Bond / Court Requirement',
  'Visa Application / Proof of Assets',
  'Building Permit / Municipal Engineering',
  'Pag-IBIG / Mortgage Clearance',
  'Scholarship / Financial Assistance',
  'Business Permit / BIR Registration',
  'General Legal Reference'
];

const FEE_PRESETS = [100, 150, 200, 250, 300, 500];

export const CertificationRequestModal: React.FC<CertificationRequestModalProps> = ({
  isOpen,
  onClose,
  taxDeclaration,
  certificationToEdit,
  onSuccessPrint,
}) => {
  const { taxDeclarations, settings, currentUser, createCertificationRequest, updateCertificationRequest } = useApp();

  // Selected TD for the certification
  const [selectedTdId, setSelectedTdId] = useState<string>(
    certificationToEdit?.taxDeclarationId || taxDeclaration?.id || ''
  );
  const [tdSearchQuery, setTdSearchQuery] = useState('');

  // Resolved Tax Declaration object
  const activeTd = useMemo(() => {
    if (selectedTdId) {
      return taxDeclarations.find((td) => td.id === selectedTdId) || null;
    }
    return taxDeclaration || null;
  }, [selectedTdId, taxDeclarations, taxDeclaration]);

  // Form State initialized with either edit data, selected TD data, or defaults
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultPlace = `Office of the Municipal Treasurer, ${settings.psgcMunicipalityName || settings.lguName}, ${settings.provinceName}`;

  const [receiptNumber, setReceiptNumber] = useState<string>(certificationToEdit?.receiptNumber || '');
  const [amount, setAmount] = useState<number>(certificationToEdit?.amount ?? 150);
  const [dateIssued, setDateIssued] = useState<string>(certificationToEdit?.dateIssued || todayStr);
  const [placeIssued, setPlaceIssued] = useState<string>(certificationToEdit?.placeIssued || defaultPlace);
  const [purpose, setPurpose] = useState<string>(certificationToEdit?.purpose || 'Bank Loan Application');

  // Signatory 1: Prepared by
  const [preparedBy, setPreparedBy] = useState<string>(
    certificationToEdit?.preparedBy || `${currentUser.fullName}${currentUser.role ? ` (${currentUser.role})` : ''}`
  );
  const [preparedByTitle, setPreparedByTitle] = useState<string>(
    certificationToEdit?.preparedByTitle || 'Assessment Records Officer I'
  );

  // Signatory 2: Verified and checked by:
  const [verifiedBy, setVerifiedBy] = useState<string>(
    certificationToEdit?.verifiedBy || settings.appraiserName || 'Mark Lester G. Reyes, REA'
  );
  const [verifiedByTitle, setVerifiedByTitle] = useState<string>(
    certificationToEdit?.verifiedByTitle || 'Local Assessment Operations Officer II / Appraiser'
  );

  // Signatory 3: Approved by or Certified correct as to available record/s:
  const [approvedBy, setApprovedBy] = useState<string>(
    certificationToEdit?.approvedBy || settings.municipalAssessor || 'Atty. Eduardo M. Santos, REA, REB'
  );
  const [approvedByTitle, setApprovedByTitle] = useState<string>(
    certificationToEdit?.approvedByTitle || 'Municipal Assessor'
  );
  const [approvalLabel, setApprovalLabel] = useState<'Approved by:' | 'Certified correct as to available record/s:'>(
    certificationToEdit?.approvalLabel || 'Approved by:'
  );

  // Requester details
  const [requesterName, setRequesterName] = useState<string>(
    certificationToEdit?.requesterName ||
    (activeTd ? `${activeTd.firstName} ${activeTd.lastName}`.trim() : '')
  );
  const [requesterRelation, setRequesterRelation] = useState<string>(
    certificationToEdit?.requesterRelation || 'Registered Owner'
  );
  const [requesterAddress, setRequesterAddress] = useState<string>(
    certificationToEdit?.requesterAddress || activeTd?.address || ''
  );
  const [requesterContact, setRequesterContact] = useState<string>(
    certificationToEdit?.requesterContact || activeTd?.contactNumber || ''
  );

  // Certification Type & Status
  const [certificationType, setCertificationType] = useState<CertificationRequest['certificationType']>(
    certificationToEdit?.certificationType || 'Certified True Copy of Tax Declaration'
  );
  const [status, setStatus] = useState<CertificationRequest['status']>(certificationToEdit?.status || 'Issued');
  const [remarks, setRemarks] = useState<string>(certificationToEdit?.remarks || '');

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-sync requester name when a TD is selected if user hasn't typed a custom one
  const handleSelectTd = (td: TaxDeclaration) => {
    setSelectedTdId(td.id);
    if (!requesterName || requesterName === '') {
      setRequesterName(`${td.firstName} ${td.lastName}`.trim());
      setRequesterAddress(td.address || `${td.barangayName}, ${td.municipalityName}, ${td.provinceName}`);
      setRequesterContact(td.contactNumber || '');
    }
    setTdSearchQuery('');
  };

  // Filtered TDs for search
  const filteredTds = useMemo(() => {
    if (!tdSearchQuery.trim()) return [];
    const q = tdSearchQuery.toLowerCase();
    return taxDeclarations.filter(
      (td) =>
        td.tdNumber.toLowerCase().includes(q) ||
        td.pin.toLowerCase().includes(q) ||
        `${td.firstName} ${td.lastName}`.toLowerCase().includes(q) ||
        td.barangayName.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [tdSearchQuery, taxDeclarations]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!activeTd) {
      newErrors.td = 'Please select a Tax Declaration for this certification.';
    }
    if (!receiptNumber.trim()) {
      newErrors.receiptNumber = 'Receipt # (O.R. No.) is required.';
    }
    if (amount <= 0 || isNaN(amount)) {
      newErrors.amount = 'Valid amount is required.';
    }
    if (!dateIssued) {
      newErrors.dateIssued = 'Date issued is required.';
    }
    if (!placeIssued.trim()) {
      newErrors.placeIssued = 'Place issued is required.';
    }
    if (!purpose.trim()) {
      newErrors.purpose = 'Purpose is required.';
    }
    if (!preparedBy.trim()) {
      newErrors.preparedBy = 'Prepared by name is required.';
    }
    if (!verifiedBy.trim()) {
      newErrors.verifiedBy = 'Verified and checked by name is required.';
    }
    if (!approvedBy.trim()) {
      newErrors.approvedBy = 'Approving official name is required.';
    }
    if (!requesterName.trim()) {
      newErrors.requesterName = 'Requester name is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (andPrint: boolean = false) => {
    if (!validate()) return;
    if (!activeTd) return;

    const ownerFullName = `${activeTd.firstName} ${activeTd.middleName ? `${activeTd.middleName} ` : ''}${activeTd.lastName}`.trim();
    const locationStr = `${activeTd.barangayName}, ${activeTd.municipalityName}, ${activeTd.provinceName}`;

    if (certificationToEdit) {
      updateCertificationRequest(certificationToEdit.id, {
        receiptNumber: receiptNumber.trim(),
        amount: Number(amount),
        dateIssued,
        placeIssued: placeIssued.trim(),
        purpose: purpose.trim(),
        preparedBy: preparedBy.trim(),
        preparedByTitle: preparedByTitle.trim(),
        verifiedBy: verifiedBy.trim(),
        verifiedByTitle: verifiedByTitle.trim(),
        approvedBy: approvedBy.trim(),
        approvedByTitle: approvedByTitle.trim(),
        approvalLabel: approvalLabel,
        requesterName: requesterName.trim(),
        requesterRelation,
        requesterAddress: requesterAddress.trim(),
        requesterContact: requesterContact.trim(),
        certificationType,
        status,
        remarks: remarks.trim(),
      });
      if (andPrint && onSuccessPrint) {
        onSuccessPrint({
          ...certificationToEdit,
          receiptNumber: receiptNumber.trim(),
          amount: Number(amount),
          dateIssued,
          placeIssued: placeIssued.trim(),
          purpose: purpose.trim(),
          preparedBy: preparedBy.trim(),
          preparedByTitle: preparedByTitle.trim(),
          verifiedBy: verifiedBy.trim(),
          verifiedByTitle: verifiedByTitle.trim(),
          approvedBy: approvedBy.trim(),
          approvedByTitle: approvedByTitle.trim(),
          approvalLabel: approvalLabel,
          requesterName: requesterName.trim(),
          requesterRelation,
          requesterAddress: requesterAddress.trim(),
          requesterContact: requesterContact.trim(),
          certificationType,
          status,
          remarks: remarks.trim(),
        });
      }
      onClose();
    } else {
      const created = createCertificationRequest({
        certNumber: '',
        taxDeclarationId: activeTd.id,
        tdNumber: activeTd.tdNumber,
        pin: activeTd.pin,
        ownerName: ownerFullName,
        propertyLocation: locationStr,
        titleNumber: activeTd.titleNumber,
        lotNumber: activeTd.lotNumber,
        surveyNumber: activeTd.surveyNumber,
        area: activeTd.area,
        areaUnit: activeTd.areaUnit,
        assessedValue: activeTd.assessedValue,
        marketValue: activeTd.marketValue,
        kindOfProperty: activeTd.kindOfProperty,
        generalClass: activeTd.generalClass,
        propertyState: activeTd.propertyState,
        adminBusinessName: activeTd.adminBusinessName || '',
        assessmentDate: activeTd.assessmentDate || '',
        effectivityDate: `${activeTd.effectivityQuarter ? `Quarter ${activeTd.effectivityQuarter}, ` : ''}${activeTd.effectivityYear || ''}`.trim(),
        ownerAddress: activeTd.address || '',
        requesterName: requesterName.trim(),
        requesterRelation,
        requesterAddress: requesterAddress.trim(),
        requesterContact: requesterContact.trim(),
        receiptNumber: receiptNumber.trim(),
        amount: Number(amount),
        dateIssued,
        placeIssued: placeIssued.trim(),
        purpose: purpose.trim(),
        preparedBy: preparedBy.trim(),
        preparedByTitle: preparedByTitle.trim(),
        verifiedBy: verifiedBy.trim(),
        verifiedByTitle: verifiedByTitle.trim(),
        approvedBy: approvedBy.trim(),
        approvedByTitle: approvedByTitle.trim(),
        approvalLabel: approvalLabel,
        certificationType,
        status,
        remarks: remarks.trim(),
      });

      if (andPrint && onSuccessPrint) {
        onSuccessPrint(created);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-200 shadow-inner">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">
                  {certificationToEdit ? 'Edit Certification Request' : 'New Certification Request for Tax Declaration'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-400/20 text-blue-200 border border-blue-400/30">
                  Official Assessor Docket
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Capture official receipt details, applicant information, and generate official certification
              </p>
            </div>
          </div>
          <button
            id="close-certification-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">

          {/* Section 1: Target Tax Declaration */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-700" />
                <span>Target Tax Declaration</span>
                <span className="text-rose-500">*</span>
              </label>
              {activeTd && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeTd.propertyState === 'CURRENT'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {activeTd.propertyState} RECORD
                </span>
              )}
            </div>

            {activeTd ? (
              <div className="bg-white rounded-lg p-3.5 border border-blue-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-blue-900">{activeTd.tdNumber}</span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs font-mono text-slate-600">PIN: {activeTd.pin}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    Owner: {activeTd.firstName} {activeTd.middleName ? `${activeTd.middleName} ` : ''}{activeTd.lastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {activeTd.barangayName}, {activeTd.municipalityName} • {activeTd.kindOfProperty} ({activeTd.generalClass}) • Assessed Val: {settings.currencySymbol}{activeTd.assessedValue.toLocaleString()}
                  </p>
                </div>
                {!taxDeclaration && !certificationToEdit && (
                  <button
                    type="button"
                    onClick={() => setSelectedTdId('')}
                    className="self-start sm:self-center text-xs font-semibold text-blue-700 hover:text-blue-800 underline cursor-pointer"
                  >
                    Change Property
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="search-td-input"
                    type="text"
                    value={tdSearchQuery}
                    onChange={(e) => setTdSearchQuery(e.target.value)}
                    placeholder="Search by TD Number, PIN, Owner Name, or Barangay..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {errors.td && <p className="text-[11px] text-rose-600 font-medium">{errors.td}</p>}

                {/* Dropdown list of matches */}
                {filteredTds.length > 0 && (
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white shadow-md">
                    {filteredTds.map((td) => (
                      <div
                        key={td.id}
                        onClick={() => handleSelectTd(td)}
                        className="p-2.5 hover:bg-blue-50 transition-colors cursor-pointer text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-900">{td.tdNumber}</span>
                          <span className="text-[10px] text-slate-500">{td.barangayName}</span>
                        </div>
                        <p className="text-slate-700 font-medium">{td.lastName}, {td.firstName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Official Receipt & Financial Details (Mandatory Requested Fields) */}
          <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4.5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-blue-100">
              <Receipt className="w-4 h-4 text-blue-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-950">
                Official Receipt & Issuance Particulars
              </h3>
              <span className="ml-auto text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                Required for Audit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Receipt # */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Receipt # (O.R. No.) <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">e.g. OR-2026-08912</span>
                </label>
                <div className="relative">
                  <Receipt className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="cert-receipt-number"
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    placeholder="Enter Official Receipt Number"
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-white border rounded-lg font-mono font-bold text-slate-900 focus:outline-hidden ${
                      errors.receiptNumber ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {errors.receiptNumber && <p className="text-[11px] text-rose-600 mt-1">{errors.receiptNumber}</p>}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Amount Paid <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Certification Fee</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    {settings.currencySymbol}
                  </span>
                  <input
                    id="cert-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className={`w-full pl-7 pr-3 py-2 text-xs bg-white border rounded-lg font-mono font-bold text-slate-900 focus:outline-hidden ${
                      errors.amount ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {/* Fee quick select buttons */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Quick Fee:</span>
                  {FEE_PRESETS.map((fee) => (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => setAmount(fee)}
                      className={`text-[10px] px-1.5 py-0.5 rounded-md border font-mono transition-colors cursor-pointer ${
                        amount === fee
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {settings.currencySymbol}{fee}
                    </button>
                  ))}
                </div>
                {errors.amount && <p className="text-[11px] text-rose-600 mt-1">{errors.amount}</p>}
              </div>

              {/* Date Issued */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Date Issued <span className="text-rose-500">*</span></span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="cert-date-issued"
                    type="date"
                    value={dateIssued}
                    onChange={(e) => setDateIssued(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-white border rounded-lg font-medium text-slate-900 focus:outline-hidden ${
                      errors.dateIssued ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {errors.dateIssued && <p className="text-[11px] text-rose-600 mt-1">{errors.dateIssued}</p>}
              </div>

              {/* Place Issued */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Place Issued <span className="text-rose-500">*</span></span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="cert-place-issued"
                    type="text"
                    value={placeIssued}
                    onChange={(e) => setPlaceIssued(e.target.value)}
                    placeholder="e.g. Office of the Municipal Treasurer, Taytay, Rizal"
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-white border rounded-lg text-slate-900 focus:outline-hidden ${
                      errors.placeIssued ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {errors.placeIssued && <p className="text-[11px] text-rose-600 mt-1">{errors.placeIssued}</p>}
              </div>

              {/* Purpose */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Purpose <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">State legal or institutional purpose</span>
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="cert-purpose"
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Enter purpose (e.g. Bank Loan, BIR eCAR, Transfer of Title)"
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-white border rounded-lg text-slate-900 font-medium focus:outline-hidden ${
                      errors.purpose ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                </div>
                {/* Common purpose quick chips */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] text-slate-400">Common:</span>
                  {COMMON_PURPOSES.slice(0, 6).map((cp) => (
                    <button
                      key={cp}
                      type="button"
                      onClick={() => setPurpose(cp)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                        purpose === cp
                          ? 'bg-blue-100 text-blue-800 border-blue-300 font-semibold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cp}
                    </button>
                  ))}
                </div>
                {errors.purpose && <p className="text-[11px] text-rose-600 mt-1">{errors.purpose}</p>}
              </div>

            </div>
          </div>

          {/* Section 3: Requester & Applicant Particulars */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <User className="w-4 h-4 text-blue-600" />
              <span>Applicant / Requester Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Requester Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="cert-requester-name"
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="Full name of person requesting certificate"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
                {errors.requesterName && <p className="text-[11px] text-rose-600 mt-1">{errors.requesterName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Relationship to Declared Owner
                </label>
                <select
                  id="cert-requester-relation"
                  value={requesterRelation}
                  onChange={(e) => setRequesterRelation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Registered Owner">Registered Owner</option>
                  <option value="Authorized Representative">Authorized Representative (with SPA)</option>
                  <option value="Heir / Next of Kin">Heir / Next of Kin</option>
                  <option value="Prospective Buyer">Prospective Buyer / Broker</option>
                  <option value="Financial Institution / Bank">Financial Institution / Bank Officer</option>
                  <option value="Government Agency">Government Agency (BIR / DAR / DPWH)</option>
                  <option value="Other">Other / Interested Party</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Requester Address
                </label>
                <input
                  id="cert-requester-address"
                  type="text"
                  value={requesterAddress}
                  onChange={(e) => setRequesterAddress(e.target.value)}
                  placeholder="Residential or office address"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Contact Number / Mobile
                </label>
                <input
                  id="cert-requester-contact"
                  type="text"
                  value={requesterContact}
                  onChange={(e) => setRequesterContact(e.target.value)}
                  placeholder="09XX-XXX-XXXX"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Official Signatories (3 Required Signatories) */}
          <div className="bg-blue-50/40 border border-blue-200/80 rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-blue-200/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                <FileSignature className="w-4 h-4 text-blue-700" />
                <span>Official Signatories (3 Required Signatories)</span>
              </h3>
              <span className="text-[11px] text-blue-800 font-medium">Prepared by • Verified and checked by • Approved / Certified correct</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Signatory 1: Prepared by */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-bold">1</span>
                      Prepared by <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Records Staff</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Signatory Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="cert-prepared-by"
                        type="text"
                        value={preparedBy}
                        onChange={(e) => setPreparedBy(e.target.value)}
                        placeholder="Staff Name"
                        className={`w-full px-2.5 py-1.5 text-xs bg-slate-50/50 border rounded-lg font-semibold text-slate-900 focus:outline-hidden ${
                          errors.preparedBy ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-blue-500'
                        }`}
                      />
                      {errors.preparedBy && <p className="text-[10px] text-rose-600 mt-0.5">{errors.preparedBy}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Designation / Position
                      </label>
                      <input
                        id="cert-prepared-by-title"
                        type="text"
                        value={preparedByTitle}
                        onChange={(e) => setPreparedByTitle(e.target.value)}
                        placeholder="e.g. Assessment Records Officer I"
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50/50 border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">
                  Prepares the certification docket and retrieves physical roll.
                </p>
              </div>

              {/* Signatory 2: Verified and checked by: */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">2</span>
                      Verified and checked by: <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-amber-700 font-medium">Examiner / Appraiser</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Signatory Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="cert-verified-by"
                        type="text"
                        value={verifiedBy}
                        onChange={(e) => setVerifiedBy(e.target.value)}
                        placeholder="Examiner / Appraiser Name"
                        className={`w-full px-2.5 py-1.5 text-xs bg-slate-50/50 border rounded-lg font-semibold text-slate-900 focus:outline-hidden ${
                          errors.verifiedBy ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-blue-500'
                        }`}
                      />
                      {errors.verifiedBy && <p className="text-[10px] text-rose-600 mt-0.5">{errors.verifiedBy}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Designation / Position
                      </label>
                      <input
                        id="cert-verified-by-title"
                        type="text"
                        value={verifiedByTitle}
                        onChange={(e) => setVerifiedByTitle(e.target.value)}
                        placeholder="e.g. Local Assessment Operations Officer II / Appraiser"
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50/50 border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">
                  Verifies PIN, boundaries, classification, and assessed valuations.
                </p>
              </div>

              {/* Signatory 3: Approved by or Certified correct */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">3</span>
                      Approval Authority <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">Department Head</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Signatory Heading Clause
                      </label>
                      <select
                        id="cert-approval-label"
                        value={approvalLabel}
                        onChange={(e) => setApprovalLabel(e.target.value as 'Approved by:' | 'Certified correct as to available record/s:')}
                        className="w-full px-2.5 py-1.5 text-xs bg-emerald-50/50 border border-emerald-300 rounded-lg font-semibold text-emerald-900 focus:outline-hidden focus:border-emerald-500"
                      >
                        <option value="Approved by:">Approved by:</option>
                        <option value="Certified correct as to available record/s:">Certified correct as to available record/s:</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Signatory Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="cert-approved-by"
                        type="text"
                        value={approvedBy}
                        onChange={(e) => setApprovedBy(e.target.value)}
                        placeholder="Municipal Assessor Name"
                        className={`w-full px-2.5 py-1.5 text-xs bg-slate-50/50 border rounded-lg font-semibold text-slate-900 focus:outline-hidden ${
                          errors.approvedBy ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-blue-500'
                        }`}
                      />
                      {errors.approvedBy && <p className="text-[10px] text-rose-600 mt-0.5">{errors.approvedBy}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Designation / Position
                      </label>
                      <input
                        id="cert-approved-by-title"
                        type="text"
                        value={approvedByTitle}
                        onChange={(e) => setApprovedByTitle(e.target.value)}
                        placeholder="e.g. Municipal Assessor"
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50/50 border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">
                  Official certifying authority approving issuance to requester.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Certificate Form Type & Administrative Details */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Certificate Specification & Remarks</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Certificate Form Type
                </label>
                <select
                  id="cert-type-select"
                  value={certificationType}
                  onChange={(e) => setCertificationType(e.target.value as CertificationRequest['certificationType'])}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 font-medium"
                >
                  <option value="Certified True Copy of Tax Declaration">Certified True Copy of Tax Declaration</option>
                  <option value="Certificate of Tax Declaration">Certificate of Tax Declaration (Holding)</option>
                  <option value="Certificate of Property Assessment">Certificate of Property Assessment</option>
                  <option value="Certificate of Non-Improvement">Certificate of Non-Improvement</option>
                  <option value="Certificate of Total Property Holdings">Certificate of Total Property Holdings</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Issuance Standing / Status
                </label>
                <select
                  id="cert-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CertificationRequest['status'])}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500 font-medium"
                >
                  <option value="Issued">Issued (Ready for Official Signature & Release)</option>
                  <option value="Pending">Pending (Under Verification)</option>
                  <option value="Released">Released (Claimed by Requester)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Internal Remarks / Reference Notes (Optional)
                </label>
                <input
                  id="cert-remarks"
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Validated against Registry of Deeds TCT; Special Power of Attorney attached."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official audit log entry will be created automatically.</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              id="cancel-cert-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            
            <button
              id="save-cert-btn"
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-700" />
              <span>Save Record</span>
            </button>

            <button
              id="save-and-print-cert-btn"
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-4.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Save & Print Certificate</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

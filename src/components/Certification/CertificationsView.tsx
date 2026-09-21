import React, { useState, useMemo } from 'react';
import { 
  FileCheck, 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Edit2, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Tag, 
  MapPin, 
  User, 
  FileText,
  CheckCircle,
  Clock,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CertificationRequest } from '../../types';

interface CertificationsViewProps {
  onOpenNewModal: () => void;
  onEditCert: (cert: CertificationRequest) => void;
  onPrintCert: (cert: CertificationRequest) => void;
}

export const CertificationsView: React.FC<CertificationsViewProps> = ({
  onOpenNewModal,
  onEditCert,
  onPrintCert,
}) => {
  const { certifications, deleteCertificationRequest, settings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  // Stats calculation
  const totalCount = certifications.length;
  const totalRevenue = useMemo(() => {
    return certifications.reduce((sum, c) => sum + (c.amount || 0), 0);
  }, [certifications]);

  const uniquePurposes = useMemo(() => {
    const set = new Set<string>();
    certifications.forEach((c) => {
      if (c.purpose) set.add(c.purpose);
    });
    return Array.from(set);
  }, [certifications]);

  // Filtered certifications
  const filteredCertifications = useMemo(() => {
    return certifications.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.certNumber.toLowerCase().includes(q) ||
        c.receiptNumber.toLowerCase().includes(q) ||
        c.tdNumber.toLowerCase().includes(q) ||
        c.pin.toLowerCase().includes(q) ||
        c.ownerName.toLowerCase().includes(q) ||
        c.requesterName.toLowerCase().includes(q) ||
        c.purpose.toLowerCase().includes(q) ||
        c.preparedBy.toLowerCase().includes(q) ||
        (c.verifiedBy && c.verifiedBy.toLowerCase().includes(q)) ||
        (c.approvedBy && c.approvedBy.toLowerCase().includes(q)) ||
        c.placeIssued.toLowerCase().includes(q);

      const matchesPurpose = selectedPurpose === 'ALL' || c.purpose === selectedPurpose;
      const matchesType = selectedType === 'ALL' || c.certificationType === selectedType;

      return matchesSearch && matchesPurpose && matchesType;
    });
  }, [certifications, searchQuery, selectedPurpose, selectedType]);

  const handleDelete = (id: string, certNumber: string, receiptNumber: string) => {
    if (window.confirm(`Are you sure you want to delete certification request ${certNumber} (O.R. #${receiptNumber})?`)) {
      deleteCertificationRequest(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-blue-200">
              <FileCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Tax Declaration Certification Requests</h1>
          </div>
          <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl">
            Manage, issue, and audit official certifications for tax declarations with recorded official receipt numbers, fees, purpose, and preparing officer logs.
          </p>
        </div>

        <button
          id="new-certification-request-btn"
          onClick={onOpenNewModal}
          className="px-4.5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer self-stretch md:self-auto justify-center"
        >
          <Plus className="w-4 h-4 text-blue-700" />
          <span>Issue Certification Request</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Certifications */}
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Certifications</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800">{totalCount}</p>
          <p className="text-xs text-slate-500 mt-1">Official assessor requests recorded</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Fees Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-950">
            {settings.currencySymbol}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-700 mt-1">Backed by official receipts (O.R.)</p>
        </div>

        {/* Average Fee */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Average Fee</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-950">
            {settings.currencySymbol}{totalCount > 0 ? (totalRevenue / totalCount).toFixed(2) : '0.00'}
          </p>
          <p className="text-xs text-indigo-700 mt-1">Standard municipal rate</p>
        </div>

        {/* Active Purposes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purpose Categories</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800">{uniquePurposes.length}</p>
          <p className="text-xs text-slate-500 mt-1">Bank, BIR, Title, Courts</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search input */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-certifications-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Receipt # (O.R.), TD #, Declared Owner, Requester, Purpose, or Prepared By..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Purpose Filter */}
          <div className="w-full md:w-56">
            <select
              id="filter-cert-purpose"
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">All Purposes</option>
              {uniquePurposes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-64">
            <select
              id="filter-cert-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">All Certification Types</option>
              <option value="Certified True Copy of Tax Declaration">Certified True Copy</option>
              <option value="Certificate of Tax Declaration">Certificate of Tax Declaration</option>
              <option value="Certificate of Property Assessment">Certificate of Property Assessment</option>
              <option value="Certificate of Non-Improvement">Certificate of Non-Improvement</option>
              <option value="Certificate of Total Property Holdings">Total Property Holdings</option>
            </select>
          </div>

          {(searchQuery || selectedPurpose !== 'ALL' || selectedType !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPurpose('ALL');
                setSelectedType('ALL');
              }}
              className="text-xs text-blue-700 hover:text-blue-800 font-semibold px-2 py-1 cursor-pointer"
            >
              Reset
            </button>
          )}

        </div>
      </div>

      {/* Certifications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">Official Certification Logs</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
              {filteredCertifications.length} records
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-3 px-4">Control & Date</th>
                <th className="py-3 px-3">Tax Dec No. & PIN</th>
                <th className="py-3 px-3">Declared Owner / Requester</th>
                <th className="py-3 px-3 bg-blue-50/50 text-blue-900">Receipt # (O.R.)</th>
                <th className="py-3 px-3 bg-blue-50/50 text-blue-900 text-right">Amount</th>
                <th className="py-3 px-3">Date & Place Issued</th>
                <th className="py-3 px-3">Purpose</th>
                <th className="py-3 px-3">3 Signatories</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCertifications.length > 0 ? (
                filteredCertifications.map((cert) => (
                  <tr key={cert.id} className="hover:bg-blue-50/30 transition-colors">
                    
                    {/* Control No & Date */}
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-blue-950">{cert.certNumber}</p>
                      <span className="text-[10px] text-slate-400 block">{cert.certificationType}</span>
                    </td>

                    {/* Tax Dec No & PIN */}
                    <td className="py-3 px-3">
                      <p className="font-mono font-bold text-slate-800">{cert.tdNumber}</p>
                      <span className="font-mono text-[10px] text-slate-500 block">PIN: {cert.pin}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">{cert.propertyLocation}</span>
                    </td>

                    {/* Owner & Requester */}
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">{cert.ownerName}</p>
                      <p className="text-[10px] text-slate-500">
                        Req: <span className="font-semibold text-slate-700">{cert.requesterName}</span>
                        {cert.requesterRelation ? ` (${cert.requesterRelation})` : ''}
                      </p>
                    </td>

                    {/* Receipt # (O.R. No.) */}
                    <td className="py-3 px-3 bg-blue-50/30 font-mono font-black text-blue-900">
                      <div className="flex items-center gap-1">
                        <Receipt className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>{cert.receiptNumber}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 bg-blue-50/30 text-right font-mono font-bold text-slate-900">
                      {settings.currencySymbol}{cert.amount.toFixed(2)}
                    </td>

                    {/* Date & Place Issued */}
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{cert.dateIssued}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[160px] flex items-center gap-1 mt-0.5" title={cert.placeIssued}>
                        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span>{cert.placeIssued}</span>
                      </p>
                    </td>

                    {/* Purpose */}
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-medium text-[11px]">
                        {cert.purpose}
                      </span>
                      {cert.remarks && (
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[150px]" title={cert.remarks}>
                          {cert.remarks}
                        </span>
                      )}
                    </td>

                    {/* 3 Signatories */}
                    <td className="py-3 px-3">
                      <div className="space-y-1 text-[10px]">
                        <div className="flex items-center gap-1" title={`Prepared by: ${cert.preparedBy} (${cert.preparedByTitle || 'Records Staff'})`}>
                          <span className="w-3 h-3 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[8px] shrink-0">1</span>
                          <span className="text-slate-500 font-normal">Prep:</span>
                          <span className="font-medium text-slate-800 truncate max-w-[130px]">{cert.preparedBy}</span>
                        </div>
                        <div className="flex items-center gap-1" title={`Verified by: ${cert.verifiedBy || 'N/A'} (${cert.verifiedByTitle || 'Appraiser'})`}>
                          <span className="w-3 h-3 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[8px] shrink-0">2</span>
                          <span className="text-slate-500 font-normal">Ver:</span>
                          <span className="font-medium text-slate-800 truncate max-w-[130px]">{cert.verifiedBy || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1" title={`${cert.approvalLabel || 'Approved by'}: ${cert.approvedBy} (${cert.approvedByTitle || 'Municipal Assessor'})`}>
                          <span className="w-3 h-3 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[8px] shrink-0">3</span>
                          <span className="text-slate-500 font-normal">Appr:</span>
                          <span className="font-bold text-emerald-900 truncate max-w-[130px]">{cert.approvedBy}</span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Print Button */}
                        <button
                          id={`print-cert-${cert.id}`}
                          onClick={() => onPrintCert(cert)}
                          title="Print Official Certificate"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button */}
                        <button
                          id={`edit-cert-${cert.id}`}
                          onClick={() => onEditCert(cert)}
                          title="Edit Certification Request"
                          className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          id={`delete-cert-${cert.id}`}
                          onClick={() => handleDelete(cert.id, cert.certNumber, cert.receiptNumber)}
                          title="Delete Record"
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600 text-sm">No certification requests found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchQuery ? 'Try adjusting your search criteria' : 'Click "Issue Certification Request" to create the first entry.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

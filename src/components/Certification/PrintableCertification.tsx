import React from 'react';
import { Printer, ArrowLeft, ShieldCheck, CheckCircle, Download, FileText, Receipt } from 'lucide-react';
import { CertificationRequest } from '../../types';
import { useApp } from '../../context/AppContext';

interface PrintableCertificationProps {
  certification: CertificationRequest;
  onBack: () => void;
}

export const PrintableCertification: React.FC<PrintableCertificationProps> = ({
  certification,
  onBack,
}) => {
  const { settings } = useApp();

  const handlePrint = () => {
    window.print();
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Format day for "Given this X day of Y"
  const getDayWithSuffix = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString('en-PH', { month: 'long' });
      const year = date.getFullYear();

      const suffix = (d: number) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };

      return {
        dayWithSuffix: `${day}${suffix(day)}`,
        month,
        year,
      };
    } catch {
      return { dayWithSuffix: '20th', month: 'September', year: 2026 };
    }
  };

  const { dayWithSuffix, month, year } = getDayWithSuffix(certification.dateIssued);

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:p-0 print:bg-white">
      
      {/* Non-printable Action Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden bg-white p-4 rounded-xl shadow-xs border border-slate-200">
        <button
          id="back-from-cert-print-btn"
          onClick={onBack}
          className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Certifications Archive</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">
            Cert: <strong className="text-slate-800">{certification.certNumber}</strong>
          </span>
          <span className="text-xs text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-mono">
            O.R. #: <strong className="text-blue-900">{certification.receiptNumber}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="print-cert-action-btn"
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Certificate</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Government Certificate Layout) */}
      <div className="max-w-[850px] mx-auto bg-white shadow-2xl print:shadow-none p-10 sm:p-14 border border-slate-200 print:border-none print:m-0 print:w-full print:max-w-none text-slate-900 relative font-serif">
        
        {/* Decorative Watermark / Seal Background in Print */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <div className="w-[500px] h-[500px] rounded-full border-[20px] border-slate-900 flex items-center justify-center text-center p-8 font-sans font-black text-6xl">
            OFFICE OF THE MUNICIPAL ASSESSOR
          </div>
        </div>

        {/* Official Header */}
        <div className="text-center border-b-2 border-slate-900 pb-5 mb-8 relative">
          <p className="text-xs uppercase tracking-widest text-slate-600 font-sans font-semibold">
            Republic of the Philippines
          </p>
          <p className="text-xs uppercase tracking-widest text-slate-700 font-sans font-bold">
            Province of {settings.provinceName}
          </p>
          <p className="text-sm uppercase tracking-wider text-slate-800 font-sans font-bold">
            Municipality of {settings.psgcMunicipalityName || settings.lguName}
          </p>
          <h1 className="text-xl sm:text-2xl font-black uppercase text-blue-950 font-sans tracking-wide mt-2">
            {settings.officeName.toUpperCase()}
          </h1>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">
            Municipal Government Center, {settings.psgcMunicipalityName || settings.lguName}, {settings.provinceName} • Real Property Assessment & Tax Mapping Division
          </p>

          <div className="absolute right-0 top-0 text-right font-sans">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Control No.</span>
            <span className="font-mono font-bold text-sm text-blue-900">{certification.certNumber}</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-slate-900 underline decoration-2 underline-offset-8">
            CERTIFICATION
          </h2>
          <p className="text-xs font-sans text-slate-500 uppercase tracking-widest mt-3 font-semibold">
            ({certification.certificationType.toUpperCase()})
          </p>
        </div>

        {/* Salutation */}
        <div className="mb-6 font-sans font-bold text-sm tracking-wide text-slate-800">
          TO WHOM IT MAY CONCERN:
        </div>

        {/* Certification Opening Statement */}
        <p className="text-sm leading-relaxed text-justify mb-6 indent-8">
          <strong>THIS IS TO CERTIFY</strong> that according to the official Assessment Roll and real property records
          on file in this Office, the parcel of real property herein described is declared in the name of:
        </p>

        {/* Declared Owner Highlight Box */}
        <div className="bg-slate-50/80 border border-slate-300 rounded-lg p-4 mb-6 font-sans">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
              DECLARED OWNER / RECORDED TAXPAYER
            </span>
            <p className="text-lg font-black text-slate-950 uppercase tracking-wide mt-0.5">
              {certification.ownerName}
            </p>
          </div>
        </div>

        {/* Detailed Property Particulars Table */}
        <div className="mb-8 font-sans">
          <table className="w-full text-xs border-collapse border border-slate-300">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="w-1/3 py-2 px-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 uppercase text-[11px]">
                  Tax Declaration No.
                </td>
                <td className="py-2 px-3 font-mono font-bold text-sm text-blue-950">
                  {certification.tdNumber}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="py-2 px-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 uppercase text-[11px]">
                  Property Identification No. (PIN)
                </td>
                <td className="py-2 px-3 font-mono font-bold text-slate-800">
                  {certification.pin}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="py-2 px-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 uppercase text-[11px]">
                  Location of Property
                </td>
                <td className="py-2 px-3 font-medium text-slate-900">
                  {certification.propertyLocation}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="py-2 px-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 uppercase text-[11px]">
                  Cadastral Lot & Survey No.
                </td>
                <td className="py-2 px-3 text-slate-900">
                  {certification.lotNumber || 'Lot Specified'} • {certification.surveyNumber || 'Cadastral Survey'}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="py-2 px-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 uppercase text-[11px]">
                  Certificate of Title No.
                </td>
                <td className="py-2 px-3 font-semibold text-slate-900">
                  {certification.titleNumber || 'None / Tax Declaration Record'}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="py-2 px-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 uppercase text-[11px]">
                  Kind of Property & General Class
                </td>
                <td className="py-2 px-3 text-slate-900 font-medium">
                  {certification.kindOfProperty} — {certification.generalClass}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="py-2 px-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 uppercase text-[11px]">
                  Total Land / Floor Area
                </td>
                <td className="py-2 px-3 font-mono font-semibold text-slate-900">
                  {certification.area ? `${certification.area.toLocaleString()} ${certification.areaUnit || 'sqm'}` : '—'}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="py-2 px-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 uppercase text-[11px]">
                  Market Valuation
                </td>
                <td className="py-2 px-3 font-mono font-bold text-slate-800">
                  {settings.currencySymbol}{certification.marketValue.toLocaleString()}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="py-2 px-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 uppercase text-[11px]">
                  Assessed Valuation
                </td>
                <td className="py-2 px-3 font-mono font-extrabold text-blue-900 text-sm">
                  {settings.currencySymbol}{certification.assessedValue.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 uppercase text-[11px]">
                  Assessment Standing / State
                </td>
                <td className="py-2 px-3 font-bold text-xs">
                  <span className={certification.propertyState === 'CURRENT' ? 'text-emerald-700' : 'text-rose-700'}>
                    {certification.propertyState} — {certification.propertyState === 'CURRENT' ? 'Active Assessment Record on Roll' : 'Superseded / Transferred Record'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legal Purpose & Request Clause */}
        <p className="text-sm leading-relaxed text-justify mb-6 indent-8">
          This certification is issued upon the official request of <strong>{certification.requesterName}</strong>
          {certification.requesterRelation ? ` (${certification.requesterRelation})` : ''} for the purpose of{' '}
          <strong className="underline uppercase">{certification.purpose}</strong> and for whatever legal intent
          it may serve.
        </p>

        {/* Given Statement */}
        <p className="text-sm leading-relaxed text-justify mb-12 indent-8">
          Given this <strong>{dayWithSuffix}</strong> day of <strong>{month}</strong>, <strong>{year}</strong> at the
          Office of the Municipal Assessor, <strong>{certification.placeIssued}</strong>.
        </p>

        {/* 3 Official Signatories */}
        <div className="grid grid-cols-3 gap-6 mb-10 font-sans">
          {/* Signatory 1: Prepared by */}
          <div className="flex flex-col justify-end">
            <span className="text-[11px] text-slate-600 font-semibold block mb-8">
              Prepared by:
            </span>
            <div className="border-b border-slate-900 pb-1">
              <p className="font-bold text-xs sm:text-sm text-slate-900 uppercase">
                {certification.preparedBy}
              </p>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 leading-tight">
              {certification.preparedByTitle || 'Assessment Records Staff'}
            </p>
          </div>

          {/* Signatory 2: Verified and checked by: */}
          <div className="flex flex-col justify-end">
            <span className="text-[11px] text-slate-600 font-semibold block mb-8">
              Verified and checked by:
            </span>
            <div className="border-b border-slate-900 pb-1">
              <p className="font-bold text-xs sm:text-sm text-slate-900 uppercase">
                {certification.verifiedBy || 'ENGR. RAMON S. VALDEZ'}
              </p>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 leading-tight">
              {certification.verifiedByTitle || 'Local Assessment Operations Officer II / Appraiser'}
            </p>
          </div>

          {/* Signatory 3: Approved by or Certified correct */}
          <div className="flex flex-col justify-end">
            <span className="text-[11px] text-slate-600 font-semibold block mb-8">
              {certification.approvalLabel || 'Approved by:'}
            </span>
            <div className="border-b border-slate-900 pb-1">
              <p className="font-bold text-xs sm:text-sm text-slate-900 uppercase">
                {certification.approvedBy}
              </p>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 leading-tight">
              {certification.approvedByTitle || 'Municipal Assessor'}
            </p>
          </div>
        </div>

        {/* OFFICIAL RECEIPT DOCKET & AUDIT TRAIL BOX (User Requested Fields Prominently Boxed) */}
        <div className="border-2 border-slate-800 rounded-lg p-3.5 bg-slate-50/50 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-800 text-[10px]">
              <Receipt className="w-3.5 h-3.5 text-blue-800" />
              <span>OFFICIAL RECEIPT PARTICULARS (LOCAL GOVERNMENT AUDIT TRAIL)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Form No. RPT-CERT-2026</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Receipt # (O.R. No.):</span>
              <span className="font-mono font-bold text-blue-900 text-xs">{certification.receiptNumber}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Amount Paid:</span>
              <span className="font-mono font-bold text-slate-900 text-xs">
                {settings.currencySymbol}{certification.amount.toFixed(2)}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date Issued:</span>
              <span className="font-semibold text-slate-800">{formatDate(certification.dateIssued)}</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Place Issued:</span>
              <span className="font-medium text-slate-800">{certification.placeIssued}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Prepared By:</span>
              <span className="font-semibold text-slate-800">{certification.preparedBy}</span>
            </div>

            <div className="col-span-2 sm:col-span-3 border-t border-dashed border-slate-300 pt-1.5 mt-1">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Purpose:</span>
              <span className="font-semibold text-slate-900">{certification.purpose}</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-500 font-mono">
            <span>Doc. Stamp Tax: PAID & AFFIXED</span>
            <span className="font-bold text-slate-700">★ VALID ONLY WITH OFFICIAL RAISED DRY SEAL ★</span>
            <span>Ref ID: {certification.id}</span>
          </div>
        </div>

        {/* Bottom security notice */}
        <p className="text-[9px] font-sans text-center text-slate-400 mt-4 tracking-wider uppercase">
          This document is generated by the Assessor Real Property Archive System. Any alteration or erasure invalidates this certificate.
        </p>

      </div>
    </div>
  );
};

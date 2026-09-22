import React, { useState } from 'react';
import { Printer, ArrowLeft, Receipt, GitCommit, Layers, FileCheck, Maximize2 } from 'lucide-react';
import { CertificationRequest, TaxDeclaration } from '../../types';
import { useApp } from '../../context/AppContext';

interface PrintableCertificationProps {
  certification: CertificationRequest;
  onBack: () => void;
}

export const PrintableCertification: React.FC<PrintableCertificationProps> = ({
  certification,
  onBack,
}) => {
  const { settings, taxDeclarations, getPropertyLineage } = useApp();
  const [paperSize, setPaperSize] = useState<'auto' | 'letter' | 'a4' | 'legal'>('auto');

  const handlePrint = () => {
    window.print();
  };

  // Format date nicely
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
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

  // Retrieve the target property
  const targetProperty = taxDeclarations.find(
    (t) => t.id === certification.taxDeclarationId || t.tdNumber.toLowerCase().trim() === certification.tdNumber.toLowerCase().trim()
  ) || null;

  // Retrieve complete lineage (ancestors -> current -> descendants)
  const lineage = getPropertyLineage(
    targetProperty ? targetProperty.id : certification.tdNumber
  );

  // Form continuous chronological chain:
  // ancestors list is ordered from direct parent to oldest, so we reverse it
  const ancestorsChronological = lineage.ancestors ? [...lineage.ancestors].reverse() : [];
  const currentItem = lineage.current || targetProperty;
  const descendantsChronological = lineage.descendants || [];

  // Continuous chain until last superseded
  const continuousChain: TaxDeclaration[] = [
    ...ancestorsChronological,
    ...(currentItem ? [currentItem] : []),
    ...descendantsChronological,
  ];

  // If no matching tax declarations are found in state, synthesize target row from certification
  const displayChain: (TaxDeclaration | (Partial<TaxDeclaration> & { tdNumber: string }))[] = 
    continuousChain.length > 0
      ? continuousChain
      : [
          {
            id: certification.taxDeclarationId || 'td-ref',
            tdNumber: certification.tdNumber,
            pin: certification.pin,
            firstName: certification.ownerName,
            lastName: '',
            adminBusinessName: certification.adminBusinessName || '',
            address: certification.ownerAddress || certification.propertyLocation,
            barangayName: certification.propertyLocation,
            municipalityName: settings.psgcMunicipalityName || settings.lguName,
            provinceName: settings.provinceName,
            titleNumber: certification.titleNumber || '—',
            lotNumber: certification.lotNumber || '—',
            surveyNumber: certification.surveyNumber || '—',
            area: certification.area || 0,
            areaUnit: certification.areaUnit || 'sqm',
            marketValue: certification.marketValue,
            assessedValue: certification.assessedValue,
            kindOfProperty: certification.kindOfProperty,
            generalClass: certification.generalClass,
            propertyState: certification.propertyState,
            assessmentDate: certification.assessmentDate || certification.dateIssued,
            effectivityYear: 2024,
            memoranda: certification.remarks || 'Declared in active assessment standing.',
          } as TaxDeclaration,
        ];

  // Derive top header card details
  const headerTdNumber = targetProperty?.tdNumber || certification.tdNumber;
  const headerPin = targetProperty?.pin || certification.pin;
  const headerOwner = targetProperty
    ? `${targetProperty.lastName ? `${targetProperty.lastName}, ` : ''}${targetProperty.firstName} ${targetProperty.middleName || ''}`.trim()
    : certification.ownerName;
  const headerAddress = targetProperty?.address
    ? `${targetProperty.address}, ${targetProperty.barangayName}, ${targetProperty.municipalityName || settings.psgcMunicipalityName || settings.lguName}`
    : certification.ownerAddress || certification.propertyLocation || '—';
  const headerAdminBusiness = targetProperty?.adminBusinessName || certification.adminBusinessName || 'NONE / N/A';
  const headerAssessmentDate = targetProperty?.assessmentDate
    ? formatDate(targetProperty.assessmentDate)
    : certification.assessmentDate
    ? formatDate(certification.assessmentDate)
    : '—';
  const headerLocation = targetProperty
    ? `${targetProperty.barangayName}, ${targetProperty.municipalityName || settings.psgcMunicipalityName || settings.lguName}, ${targetProperty.provinceName || settings.provinceName}`
    : certification.propertyLocation;
  const headerKindOfProperty = targetProperty?.kindOfProperty || certification.kindOfProperty;
  const headerEffectivityDate = targetProperty
    ? `${targetProperty.effectivityQuarter ? `Quarter ${targetProperty.effectivityQuarter}, ` : ''}${targetProperty.effectivityYear}`
    : certification.effectivityDate || '—';
  const headerGeneralClass = targetProperty?.generalClass || certification.generalClass;

  // Paper width styles for preview mode
  const getPaperWidthClass = () => {
    switch (paperSize) {
      case 'letter': return 'max-w-[8.5in]';
      case 'a4': return 'max-w-[8.27in]';
      case 'legal': return 'max-w-[8.5in]';
      default: return 'max-w-4xl';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-2 sm:px-4 print:p-0 print:bg-white print:m-0 w-full">
      
      {/* Non-printable Action Bar */}
      <div className="max-w-4xl mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden bg-white p-3.5 rounded-xl shadow-xs border border-slate-200">
        <button
          id="back-from-cert-print-btn"
          onClick={onBack}
          className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Archive</span>
        </button>

        {/* Paper Size Preview Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 px-1.5">Paper Fit:</span>
          <button
            type="button"
            onClick={() => setPaperSize('auto')}
            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
              paperSize === 'auto' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Auto Fit
          </button>
          <button
            type="button"
            onClick={() => setPaperSize('letter')}
            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
              paperSize === 'letter' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Letter
          </button>
          <button
            type="button"
            onClick={() => setPaperSize('a4')}
            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
              paperSize === 'a4' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            A4
          </button>
          <button
            type="button"
            onClick={() => setPaperSize('legal')}
            className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
              paperSize === 'legal' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Legal
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-700 font-medium hidden sm:flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <GitCommit className="w-3.5 h-3.5" />
            <span>Chain: {displayChain.length} Tax Dec(s)</span>
          </span>

          <button
            id="print-cert-action-btn"
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-md hover:shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Form</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Government Certificate Layout - Full Page Width Fit on All Paper Sizes) */}
      <div className={`w-full ${getPaperWidthClass()} mx-auto bg-white shadow-xl print:shadow-none p-6 sm:p-9 print:p-0 border border-slate-300 print:border-none print:m-0 print:w-full print:max-w-none text-slate-950 relative font-serif`}>
        
        {/* Decorative Watermark / Seal Background in Print */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
          <div className="w-[450px] h-[450px] rounded-full border-[16px] border-slate-900 flex items-center justify-center text-center p-6 font-sans font-black text-5xl">
            OFFICE OF THE MUNICIPAL ASSESSOR
          </div>
        </div>

        {/* Official Header */}
        <div className="text-center border-b-2 border-slate-900 pb-3 mb-4 relative">
          <p className="text-[11px] uppercase tracking-widest text-slate-600 font-sans font-semibold leading-tight">
            Republic of the Philippines
          </p>
          <p className="text-[11px] uppercase tracking-widest text-slate-700 font-sans font-bold leading-tight">
            Province of {settings.provinceName}
          </p>
          <p className="text-xs uppercase tracking-wider text-slate-800 font-sans font-bold leading-tight">
            Municipality of {settings.psgcMunicipalityName || settings.lguName}
          </p>
          <h1 className="text-lg sm:text-xl font-black uppercase text-blue-950 font-sans tracking-wide mt-1">
            {settings.officeName.toUpperCase()}
          </h1>
          <p className="text-[9.5px] text-slate-500 font-sans mt-0.5">
            Municipal Government Center, {settings.psgcMunicipalityName || settings.lguName}, {settings.provinceName} • Real Property Assessment & Tax Mapping Division
          </p>

          <div className="absolute right-0 top-0 text-right font-sans">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Control No.</span>
            <span className="font-mono font-bold text-xs sm:text-sm text-blue-900">{certification.certNumber}</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-slate-950 underline decoration-2 underline-offset-4">
            RECORD VERIFICATION DATA FORM
          </h2>
          {certification.certificationType && (
            <p className="text-[11px] font-sans text-slate-600 uppercase tracking-widest mt-1 font-semibold">
              ({certification.certificationType.toUpperCase()})
            </p>
          )}
        </div>

        {/* Exact User-Requested Header Information Card */}
        {/* 
          Tax Declaration Number: | PIN:
          OWNER:                  | ADDRESS:
          ADMINISTRATOR/BUSINESS NAME: | ASSESSMENT DATE:
          LOCATION:               | KIND OF PROPERTY:
          EFFECTIVITY DATE:       | GEN. CLASS:
        */}
        <div className="w-full border-2 border-slate-900 mb-5 font-sans text-xs bg-white">
          {/* Row 1 */}
          <div className="grid grid-cols-2 border-b border-slate-900">
            <div className="p-2 sm:p-2.5 border-r border-slate-900 flex flex-col justify-center min-w-0 overflow-hidden">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[9.5px] sm:text-[10px] leading-tight block">
                Tax Declaration Number:
              </span>
              <span className="font-mono font-extrabold text-blue-950 text-xs sm:text-[13px] break-words leading-tight mt-0.5 block">
                {headerTdNumber}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 flex flex-col justify-center min-w-0 overflow-hidden">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[9.5px] sm:text-[10px] leading-tight block">
                PIN:
              </span>
              <span className="font-mono font-bold text-slate-900 text-xs sm:text-[13px] break-words leading-tight mt-0.5 block">
                {headerPin}
              </span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 border-b border-slate-900">
            <div className="p-2 sm:p-2.5 border-r border-slate-900 flex flex-col justify-center min-w-0 overflow-hidden">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[9.5px] sm:text-[10px] leading-tight block">
                OWNER:
              </span>
              <span className="font-extrabold text-slate-950 text-xs sm:text-[13px] uppercase tracking-wide break-words leading-tight mt-0.5 block">
                {headerOwner}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 flex flex-col justify-center min-w-0 overflow-hidden">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[9.5px] sm:text-[10px] leading-tight block">
                ADDRESS:
              </span>
              <span className="font-medium text-slate-900 text-xs sm:text-[12.5px] break-words leading-tight mt-0.5 block">
                {headerAddress}
              </span>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 border-b border-slate-900">
            <div className="p-2 sm:p-2.5 border-r border-slate-900 flex flex-col justify-center min-w-0 overflow-hidden">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[9.5px] sm:text-[10px] leading-tight block">
                ADMINISTRATOR/BUSINESS NAME:
              </span>
              <span className="font-semibold text-slate-900 text-xs sm:text-[12.5px] uppercase break-words leading-tight mt-0.5 block">
                {headerAdminBusiness}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 flex flex-col justify-center min-w-0 overflow-hidden">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[9.5px] sm:text-[10px] leading-tight block">
                ASSESSMENT DATE:
              </span>
              <span className="font-semibold text-slate-900 text-xs sm:text-[12.5px] break-words leading-tight mt-0.5 block">
                {headerAssessmentDate}
              </span>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-2 border-b border-slate-900">
            <div className="p-2 sm:p-2.5 border-r border-slate-900 flex flex-col justify-center min-w-0 overflow-hidden">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[9.5px] sm:text-[10px] leading-tight block">
                LOCATION:
              </span>
              <span className="font-medium text-slate-900 text-xs sm:text-[12.5px] break-words leading-tight mt-0.5 block">
                {headerLocation}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 flex flex-col justify-center min-w-0 overflow-hidden">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[9.5px] sm:text-[10px] leading-tight block">
                KIND OF PROPERTY:
              </span>
              <span className="font-semibold text-slate-900 text-xs sm:text-[12.5px] break-words leading-tight mt-0.5 block">
                {headerKindOfProperty}
              </span>
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-2">
            <div className="p-2 sm:p-2.5 border-r border-slate-900 flex flex-col justify-center min-w-0 overflow-hidden">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[9.5px] sm:text-[10px] leading-tight block">
                EFFECTIVITY DATE:
              </span>
              <span className="font-bold text-slate-950 text-xs sm:text-[12.5px] break-words leading-tight mt-0.5 block">
                {headerEffectivityDate}
              </span>
            </div>
            <div className="p-2 sm:p-2.5 flex flex-col justify-center min-w-0 overflow-hidden">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[9.5px] sm:text-[10px] leading-tight block">
                GEN. CLASS:
              </span>
              <span className="font-bold text-slate-950 text-xs sm:text-[12.5px] break-words leading-tight mt-0.5 block">
                {headerGeneralClass}
              </span>
            </div>
          </div>
        </div>

        {/* Section Notice: Continuous Lineage Until Last Superseded */}
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-850 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-800 shrink-0" />
            <span>Continuous Chain of Tax Declarations (Until Last Superseded)</span>
          </p>
          <span className="text-[9.5px] font-sans text-slate-500 font-medium">
            {displayChain.length} Recorded Revision(s)
          </span>
        </div>

        {/* Fixed Width 100% Guaranteed 9-Column Continuous Table with Proportional Widths and Word Wrapping */}
        {/* Tax Declaration Number | Declarant | Lot Number | Survey Number | Area | Title Number | Assessed Value | Effectivity | Memoranda */}
        <div className="w-full mb-5 font-sans overflow-hidden">
          <table className="w-full table-fixed border-collapse border-2 border-slate-900 text-left text-[8px] sm:text-[9px] print:text-[7.5px] leading-tight">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-900 text-slate-950 font-bold uppercase tracking-wider text-[7.5px] sm:text-[8px] print:text-[7px]">
                <th className="w-[13%] py-2 px-1 border-r border-slate-900 text-left align-bottom overflow-hidden">
                  <span className="block leading-tight">Tax Dec.</span>
                  <span className="block leading-tight">Number</span>
                </th>
                <th className="w-[15%] py-2 px-1.5 border-r border-slate-900 text-left align-bottom overflow-hidden">
                  <span className="block leading-tight">Declarant</span>
                </th>
                <th className="w-[8%] py-2 px-1 border-r border-slate-900 text-center align-bottom overflow-hidden">
                  <span className="block leading-tight">Lot</span>
                  <span className="block leading-tight">Number</span>
                </th>
                <th className="w-[9%] py-2 px-1 border-r border-slate-900 text-center align-bottom overflow-hidden">
                  <span className="block leading-tight">Survey</span>
                  <span className="block leading-tight">Number</span>
                </th>
                <th className="w-[9%] py-2 px-1 border-r border-slate-900 text-right align-bottom overflow-hidden">
                  <span className="block leading-tight">Area</span>
                </th>
                <th className="w-[10%] py-2 px-1 border-r border-slate-900 text-left align-bottom overflow-hidden">
                  <span className="block leading-tight">Title</span>
                  <span className="block leading-tight">Number</span>
                </th>
                <th className="w-[11%] py-2 px-1 border-r border-slate-900 text-right align-bottom overflow-hidden">
                  <span className="block leading-tight">Assessed</span>
                  <span className="block leading-tight">Value</span>
                </th>
                <th className="w-[9%] py-2 px-1 border-r border-slate-900 text-center align-bottom overflow-hidden">
                  <span className="block leading-tight">Effectivity</span>
                </th>
                <th className="w-[16%] py-2 px-1.5 border-slate-900 text-left align-bottom overflow-hidden">
                  <span className="block leading-tight">Memoranda</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayChain.map((td, index) => {
                const isTarget = td.tdNumber.toLowerCase().trim() === certification.tdNumber.toLowerCase().trim();
                const declarantName = td.lastName && td.firstName
                  ? `${td.lastName}, ${td.firstName} ${td.middleName || ''}`.trim()
                  : td.firstName || certification.ownerName;

                return (
                  <tr
                    key={td.id || `chain-${index}`}
                    className={`border-b border-slate-800 ${
                      isTarget ? 'bg-blue-50/40 font-medium' : index % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                    }`}
                  >
                    {/* Tax Declaration Number */}
                    <td className="py-1.5 px-1 border-r border-slate-900 align-top overflow-hidden min-w-0">
                      <div className="font-mono font-bold text-slate-950 text-[8px] sm:text-[9px] print:text-[7.5px] break-words leading-tight">
                        {td.tdNumber}
                      </div>
                      <div className="mt-0.5">
                        <span className={`inline-block text-[6.5px] print:text-[6px] font-bold px-1 py-0.2 rounded-xs border uppercase leading-none ${
                          td.propertyState === 'CURRENT'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-rose-100 text-rose-900 border-rose-300'
                        }`}>
                          {td.propertyState === 'CURRENT' ? 'Active' : 'Superseded'}
                        </span>
                      </div>
                    </td>

                    {/* Declarant */}
                    <td className="py-1.5 px-1.5 border-r border-slate-900 align-top overflow-hidden min-w-0">
                      <div className="font-bold text-slate-900 uppercase text-[8px] sm:text-[9px] print:text-[7.5px] leading-tight break-words">
                        {declarantName}
                      </div>
                      {td.adminBusinessName && (
                        <div className="text-[7px] print:text-[6.5px] text-slate-600 font-normal italic break-words leading-tight mt-0.5">
                          ({td.adminBusinessName})
                        </div>
                      )}
                    </td>

                    {/* Lot Number */}
                    <td className="py-1.5 px-1 border-r border-slate-900 align-top text-center overflow-hidden min-w-0">
                      <div className="font-medium text-slate-900 text-[8px] sm:text-[9px] print:text-[7.5px] break-words leading-tight">
                        {td.lotNumber || '—'}
                      </div>
                      {td.blockNumber && (
                        <div className="text-slate-500 text-[7px] print:text-[6.5px] leading-none mt-0.5">
                          Blk {td.blockNumber}
                        </div>
                      )}
                    </td>

                    {/* Survey Number */}
                    <td className="py-1.5 px-1 border-r border-slate-900 align-top text-center overflow-hidden min-w-0">
                      <div className="font-mono text-slate-800 text-[7.5px] sm:text-[8.5px] print:text-[7px] break-words leading-tight">
                        {td.surveyNumber || '—'}
                      </div>
                    </td>

                    {/* Area */}
                    <td className="py-1.5 px-1 border-r border-slate-900 align-top text-right overflow-hidden min-w-0">
                      <div className="font-mono font-semibold text-slate-900 text-[8px] sm:text-[9px] print:text-[7.5px] leading-tight break-words">
                        {td.area ? td.area.toLocaleString() : '—'}
                      </div>
                      <div className="text-[7px] print:text-[6.5px] text-slate-500 font-sans leading-none mt-0.5">
                        {td.areaUnit || 'sqm'}
                      </div>
                    </td>

                    {/* Title Number */}
                    <td className="py-1.5 px-1 border-r border-slate-900 align-top overflow-hidden min-w-0">
                      <div className="font-medium text-slate-900 text-[7.5px] sm:text-[8.5px] print:text-[7px] break-words leading-tight">
                        {td.titleNumber || 'None / TD'}
                      </div>
                    </td>

                    {/* Assessed Value */}
                    <td className="py-1.5 px-1 border-r border-slate-900 align-top text-right overflow-hidden min-w-0">
                      <div className="font-mono font-bold text-slate-950 text-[8px] sm:text-[9px] print:text-[7.5px] leading-tight break-words">
                        {settings.currencySymbol}{td.assessedValue ? td.assessedValue.toLocaleString() : '0'}
                      </div>
                    </td>

                    {/* Effectivity */}
                    <td className="py-1.5 px-1 border-r border-slate-900 align-top text-center overflow-hidden min-w-0">
                      <div className="font-mono font-medium text-slate-900 text-[7.5px] sm:text-[8.5px] print:text-[7px] leading-tight break-words">
                        {td.effectivityQuarter ? `Q${td.effectivityQuarter} ` : ''}
                        {td.effectivityYear || '—'}
                      </div>
                    </td>

                    {/* Memoranda */}
                    <td className="py-1.5 px-1.5 align-top overflow-hidden min-w-0">
                      <div className="text-[7.5px] sm:text-[8.5px] print:text-[7px] leading-snug text-slate-800 font-serif break-words">
                        {td.memoranda || td.cancellationReason || 'No special encumbrances annotated.'}
                      </div>
                      {td.supersededByTdNumber && (
                        <div className="font-sans text-[7px] print:text-[6.5px] text-rose-700 font-semibold mt-0.5 break-words">
                          Superseded by {td.supersededByTdNumber}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 3 Official Signatories: Prepared by, Verified and checked by, Approved by / Certified correct */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 font-sans">
          {/* Signatory 1: Prepared by */}
          <div className="flex flex-col justify-end">
            <span className="text-[10px] sm:text-[11px] text-slate-700 font-semibold block mb-6 sm:mb-8">
              Prepared by:
            </span>
            <div className="border-b border-slate-900 pb-1">
              <p className="font-bold text-[11px] sm:text-xs text-slate-950 uppercase break-words">
                {certification.preparedBy}
              </p>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-600 mt-1 leading-tight break-words">
              {certification.preparedByTitle || 'Assessment Records Staff'}
            </p>
          </div>

          {/* Signatory 2: Verified and checked by: */}
          <div className="flex flex-col justify-end">
            <span className="text-[10px] sm:text-[11px] text-slate-700 font-semibold block mb-6 sm:mb-8">
              Verified and checked by:
            </span>
            <div className="border-b border-slate-900 pb-1">
              <p className="font-bold text-[11px] sm:text-xs text-slate-950 uppercase break-words">
                {certification.verifiedBy || 'ENGR. RAMON S. VALDEZ'}
              </p>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-600 mt-1 leading-tight break-words">
              {certification.verifiedByTitle || 'Local Assessment Operations Officer II / Appraiser'}
            </p>
          </div>

          {/* Signatory 3: Approved by or Certified correct */}
          <div className="flex flex-col justify-end">
            <span className="text-[10px] sm:text-[11px] text-slate-700 font-semibold block mb-6 sm:mb-8">
              {certification.approvalLabel || 'Approved by:'}
            </span>
            <div className="border-b border-slate-900 pb-1">
              <p className="font-bold text-[11px] sm:text-xs text-slate-950 uppercase break-words">
                {certification.approvedBy}
              </p>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-600 mt-1 leading-tight break-words">
              {certification.approvedByTitle || 'Municipal Assessor'}
            </p>
          </div>
        </div>

        {/* OFFICIAL RECEIPT PARTICULARS BOX (AUDIT TRAIL) */}
        <div className="w-full border-2 border-slate-900 rounded-xs p-2.5 bg-slate-50/50 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-slate-400 pb-1 mb-1.5">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-900 text-[9.5px]">
              <Receipt className="w-3 h-3 text-blue-900 shrink-0" />
              <span>OFFICIAL RECEIPT PARTICULARS (LOCAL GOVERNMENT AUDIT TRAIL)</span>
            </div>
            <span className="text-[9px] font-mono text-slate-600">Form No. RPT-CERT-2026</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1.5 gap-x-3 text-[10px] sm:text-[11px]">
            <div>
              <span className="text-slate-600 block text-[9px] uppercase font-semibold">Receipt # (O.R. No.):</span>
              <span className="font-mono font-bold text-blue-950 text-[11px]">{certification.receiptNumber}</span>
            </div>

            <div>
              <span className="text-slate-600 block text-[9px] uppercase font-semibold">Amount Paid:</span>
              <span className="font-mono font-bold text-slate-950 text-[11px]">
                {settings.currencySymbol}{certification.amount.toFixed(2)}
              </span>
            </div>

            <div>
              <span className="text-slate-600 block text-[9px] uppercase font-semibold">Date Issued:</span>
              <span className="font-semibold text-slate-900">{formatDate(certification.dateIssued)}</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-600 block text-[9px] uppercase font-semibold">Place Issued:</span>
              <span className="font-medium text-slate-900 break-words">{certification.placeIssued}</span>
            </div>

            <div>
              <span className="text-slate-600 block text-[9px] uppercase font-semibold">Prepared By:</span>
              <span className="font-semibold text-slate-900 break-words">{certification.preparedBy}</span>
            </div>

            <div className="col-span-2 sm:col-span-3 border-t border-dashed border-slate-300 pt-1 mt-0.5">
              <span className="text-slate-600 block text-[9px] uppercase font-semibold">Purpose:</span>
              <span className="font-semibold text-slate-950 break-words">{certification.purpose}</span>
            </div>
          </div>

          <div className="mt-1.5 pt-1 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[8px] sm:text-[8.5px] text-slate-600 font-mono">
            <span>Doc. Stamp Tax: PAID & AFFIXED</span>
            <span className="font-bold text-slate-800">★ VALID ONLY WITH OFFICIAL RAISED DRY SEAL ★</span>
            <span>Ref ID: {certification.id}</span>
          </div>
        </div>

        {/* Bottom security notice */}
        <p className="text-[8.5px] font-sans text-center text-slate-400 mt-2.5 tracking-wider uppercase">
          This document is generated by the Assessor Real Property Archive System. Any alteration or erasure invalidates this certificate.
        </p>

      </div>
    </div>
  );
};

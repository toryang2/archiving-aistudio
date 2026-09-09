import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, ArrowLeft, Download, Building, ShieldCheck } from 'lucide-react';
import { TaxDeclaration } from '../../types';

interface PrintableTaxDeclarationProps {
  property: TaxDeclaration | null;
  onBack: () => void;
}

export const PrintableTaxDeclaration: React.FC<PrintableTaxDeclarationProps> = ({
  property,
  onBack,
}) => {
  const { settings } = useApp();

  // Handle ESC key to return back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  if (!property) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar for Screen Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-sky-100 shadow-xs no-print">
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Archive</span>
          <span className="text-[10px] text-slate-400 font-mono ml-1">(Esc)</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Official Tax Declaration Form (R.A. 7160 Compliant)
          </span>
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Declaration</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xl max-w-4xl mx-auto text-slate-900 font-sans print-container">
        
        {/* Official Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
          <p className="text-[11px] uppercase tracking-widest font-semibold text-slate-600">
            Republic of the Philippines
          </p>
          <h2 className="text-sm uppercase tracking-wider font-extrabold text-slate-900">
            {settings.provinceName}
          </h2>
          <h1 className="text-base uppercase tracking-wider font-extrabold text-sky-950">
            {settings.lguName}
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {settings.officeName}
          </p>
          
          <div className="pt-2">
            <h3 className="text-lg font-extrabold uppercase tracking-tight text-slate-950 underline underline-offset-4 decoration-2">
              Tax Declaration of Real Property
            </h3>
          </div>
        </div>

        {/* TD & PIN Strip */}
        <div className="grid grid-cols-2 border-b border-slate-900 text-xs py-2 px-1">
          <div>
            <span className="font-bold text-slate-700">TD No.: </span>
            <span className="font-mono font-extrabold text-slate-950 text-sm">{property.tdNumber}</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-700">PIN: </span>
            <span className="font-mono font-extrabold text-slate-950 text-sm">{property.pin}</span>
          </div>
        </div>

        {/* Owner & Administrator Section */}
        <div className="border-b border-slate-900 divide-y divide-slate-300 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 p-2 gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Owner / Declaree:</span>
              <p className="font-bold text-sm text-slate-900">
                {property.lastName}, {property.firstName} {property.middleName || ''}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Taxpayer TIN:</span>
              <p className="font-mono font-semibold text-slate-800">{property.taxpayerTin || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 p-2 gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Administrator / Beneficiary:</span>
              <p className="font-semibold text-slate-900">{property.adminBusinessName || 'N/A'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Contact:</span>
              <p className="text-slate-800">{property.contactNumber || 'N/A'}</p>
            </div>
          </div>

          <div className="p-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Owner Address:</span>
            <p className="font-medium text-slate-900">{property.address}</p>
          </div>
        </div>

        {/* Location of Property */}
        <div className="border-b border-slate-900 p-2 text-xs grid grid-cols-3 gap-2 bg-slate-50">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Barangay (PSGC):</span>
            <p className="font-bold text-slate-900">{property.barangayName}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Municipality / City:</span>
            <p className="font-bold text-slate-900">{settings.psgcMunicipalityName}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Province:</span>
            <p className="font-bold text-slate-900">{settings.provinceName}</p>
          </div>
        </div>

        {/* Property Description & Cadastral */}
        <div className="border-b border-slate-900 p-2 text-xs grid grid-cols-4 gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">OCT / TCT / CCT No.:</span>
            <p className="font-bold text-slate-900">{property.titleNumber || 'N/A'}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Lot No.:</span>
            <p className="font-semibold text-slate-900">{property.lotNumber || 'N/A'}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Survey / Cadastral No.:</span>
            <p className="font-semibold text-slate-900">{property.surveyNumber || 'N/A'}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Block No.:</span>
            <p className="font-semibold text-slate-900">{property.blockNumber || 'N/A'}</p>
          </div>
        </div>

        {/* Assessment Schedule Table */}
        <div className="border-b-2 border-slate-900 my-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
            Real Property Assessment Schedule
          </p>
          
          <table className="w-full text-xs text-left border-collapse border border-slate-900">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 font-bold text-slate-900">
                <th className="border border-slate-900 p-2">Kind & Classification</th>
                <th className="border border-slate-900 p-2">Actual Use</th>
                <th className="border border-slate-900 p-2 text-right">Area</th>
                <th className="border border-slate-900 p-2 text-right">Unit Value</th>
                <th className="border border-slate-900 p-2 text-right">Market Value</th>
                <th className="border border-slate-900 p-2 text-center">Assessment Level</th>
                <th className="border border-slate-900 p-2 text-right">Assessed Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-900 p-2 font-bold">
                  {property.kindOfProperty} ({property.generalClass})
                </td>
                <td className="border border-slate-900 p-2">
                  {property.actualUse || property.generalClass}
                </td>
                <td className="border border-slate-900 p-2 text-right font-mono">
                  {property.area?.toLocaleString()} {property.areaUnit}
                </td>
                <td className="border border-slate-900 p-2 text-right font-mono">
                  {settings.currencySymbol}{property.unitValue?.toLocaleString()}
                </td>
                <td className="border border-slate-900 p-2 text-right font-mono font-semibold">
                  {settings.currencySymbol}{property.marketValue?.toLocaleString()}
                </td>
                <td className="border border-slate-900 p-2 text-center font-bold">
                  {property.assessmentLevel}%
                </td>
                <td className="border border-slate-900 p-2 text-right font-mono font-extrabold text-sm bg-slate-50">
                  {settings.currencySymbol}{property.assessedValue?.toLocaleString()}
                </td>
              </tr>
              <tr className="bg-slate-100 font-bold">
                <td colSpan={4} className="border border-slate-900 p-2 text-right uppercase">
                  Total Valuation:
                </td>
                <td className="border border-slate-900 p-2 text-right font-mono">
                  {settings.currencySymbol}{property.marketValue?.toLocaleString()}
                </td>
                <td className="border border-slate-900 p-2 text-center">—</td>
                <td className="border border-slate-900 p-2 text-right font-mono font-extrabold text-sm text-sky-950">
                  {settings.currencySymbol}{property.assessedValue?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Effectivity & Previous TD Link */}
        <div className="grid grid-cols-2 border border-slate-900 p-3 text-xs gap-4 mb-4 bg-slate-50">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Effectivity of Assessment:</span>
            <p className="font-bold text-slate-900">
              Taxable Year {property.effectivityYear} &bull; Quarter {property.effectivityQuarter || 1}
            </p>
            <p className="text-[11px] text-slate-500">Date of Assessment: {property.assessmentDate}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Lineage / Previous Tax Dec:</span>
            <p className="font-mono font-bold text-slate-900">
              {property.prevTdNumber ? `TD No. ${property.prevTdNumber}` : 'Original Tax Declaration Record'}
            </p>
            {property.prevTdNumber && (
              <p className="text-[10px] text-rose-700 font-semibold">
                * Prior declaration superseded and cancelled upon approval of this record.
              </p>
            )}
          </div>
        </div>

        {/* Memoranda / Legal Annotations */}
        <div className="border border-slate-900 p-3 text-xs mb-6 space-y-1">
          <p className="font-bold uppercase tracking-wider text-[11px] text-slate-800">
            Memoranda & Encumbrances:
          </p>
          <p className="font-mono text-slate-700 leading-relaxed whitespace-pre-wrap">
            {property.memoranda || 'None annotated.'}
          </p>
        </div>

        {/* Official Signatures Grid */}
        <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs">
          <div className="space-y-8">
            <p className="text-[11px] text-slate-500 uppercase">Appraised by:</p>
            <div className="border-t border-slate-900 pt-1">
              <p className="font-bold text-slate-900">{property.appraisedBy || settings.appraiserName}</p>
              <p className="text-[10px] text-slate-500">Local Assessment Operations Officer</p>
            </div>
          </div>

          <div className="space-y-8">
            <p className="text-[11px] text-slate-500 uppercase">Tax Mapped by:</p>
            <div className="border-t border-slate-900 pt-1">
              <p className="font-bold text-slate-900">{property.taxMapper || settings.taxMapperName}</p>
              <p className="text-[10px] text-slate-500">Tax Mapping & Geodetic Division</p>
            </div>
          </div>

          <div className="space-y-8">
            <p className="text-[11px] text-slate-500 uppercase">Approved by:</p>
            <div className="border-t border-slate-900 pt-1">
              <p className="font-bold text-slate-900">{property.approvedBy || settings.municipalAssessor}</p>
              <p className="text-[10px] text-slate-500">Municipal Assessor</p>
            </div>
          </div>
        </div>

        {/* Official Stamp Footer */}
        <div className="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-400">
          <span>System Generated Official Copy &bull; {new Date().toLocaleString()}</span>
          <span>Property State: {property.propertyState}</span>
        </div>

      </div>
    </div>
  );
};

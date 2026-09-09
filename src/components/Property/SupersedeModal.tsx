import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Share2, 
  GitBranch, 
  ArrowRight, 
  CheckCircle, 
  Building2, 
  FileText,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TaxDeclaration } from '../../types';

interface SupersedeModalProps {
  property: TaxDeclaration | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SupersedeModal: React.FC<SupersedeModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const { supersedeTaxDeclaration, settings, showToast } = useApp();
  const [isExecuting, setIsExecuting] = useState(false);

  const currentYear = new Date().getFullYear();
  const [newTdNumber, setNewTdNumber] = useState('');
  const [newOwnerLastName, setNewOwnerLastName] = useState('');
  const [newOwnerFirstName, setNewOwnerFirstName] = useState('');
  const [newOwnerMiddleName, setNewOwnerMiddleName] = useState('');
  const [newAdminBusinessName, setNewAdminBusinessName] = useState('');
  const [newTitleNumber, setNewTitleNumber] = useState('');
  const [newLotNumber, setNewLotNumber] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newUnitValue, setNewUnitValue] = useState(6000);
  const [newMarketValue, setNewMarketValue] = useState(1500000);
  const [newAssessedValue, setNewAssessedValue] = useState(300000);
  const [transferType, setTransferType] = useState('Deed of Absolute Sale');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [carNumber, setCarNumber] = useState('');

  // Sync state on property change / modal open
  useEffect(() => {
    if (property) {
      setNewTdNumber(
        `TD-${currentYear}-04-${property.barangayCode ? property.barangayCode.slice(-3) : '001'}-${Math.floor(1000 + Math.random() * 9000)}`
      );
      setNewTitleNumber(property.titleNumber || '');
      setNewLotNumber(property.lotNumber || '');
      setNewPin(property.pin || '');
      setNewUnitValue(property.unitValue || 6000);
      setNewMarketValue(property.marketValue || 1500000);
      setNewAssessedValue(property.assessedValue || 300000);
      setTransferDate(new Date().toISOString().split('T')[0]);
    }
  }, [property, currentYear, isOpen]);

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

  if (!property) return null;

  const handleUnitValueChange = (val: number) => {
    setNewUnitValue(val);
    const mVal = Math.round((property.area || 1) * val);
    setNewMarketValue(mVal);
    setNewAssessedValue(Math.round((mVal * property.assessmentLevel) / 100));
  };

  const handleExecuteSupersede = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTdNumber.trim()) {
      showToast('New Tax Declaration Number is required.', 'error');
      return;
    }
    if (!newOwnerLastName.trim() && !newAdminBusinessName.trim()) {
      showToast('Please specify the new owner or administrator entity name.', 'error');
      return;
    }

    setIsExecuting(true);
    const customMemoranda = `TRANSFER OF REAL PROPERTY ASSESSMENT:\nIssued by virtue of ${transferType} dated ${transferDate}.\nNew Certificate of Title: ${newTitleNumber || 'In Process'}.\n${carNumber ? `BIR eCAR No.: ${carNumber}.\n` : ''}Prior Tax Declaration No. ${property.tdNumber} (in name of ${property.lastName}, ${property.firstName}) is hereby CANCELLED and superseded pursuant to R.A. 7160.`;

    setTimeout(() => {
      supersedeTaxDeclaration(property.id, {
        tdNumber: newTdNumber.trim(),
        pin: newPin.trim() || property.pin,
        lastName: newOwnerLastName.trim(),
        firstName: newOwnerFirstName.trim(),
        middleName: newOwnerMiddleName.trim(),
        adminBusinessName: newAdminBusinessName.trim(),
        titleNumber: newTitleNumber.trim(),
        lotNumber: newLotNumber.trim(),
        unitValue: newUnitValue,
        marketValue: newMarketValue,
        assessedValue: newAssessedValue,
        assessmentDate: transferDate,
        effectivityYear: currentYear,
        memoranda: customMemoranda,
      });

      setIsExecuting(false);
      onClose();
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="supersede-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print"
        >
          <motion.div 
            id="supersede-modal-card" 
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-white rounded-2xl shadow-2xl border border-sky-100 max-w-2xl w-full my-auto overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-800 text-white p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Press Esc to close"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Supersede Tax Declaration & Transfer</h2>
                  <p className="text-xs text-indigo-100 font-medium">
                    Automatic Predecessor Cancellation & Lineage Succession
                  </p>
                </div>
              </div>
            </div>

            {/* Transfer Visualizer */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                  Predecessor (Will be Cancelled)
                </span>
                <p className="font-mono font-bold text-slate-800 truncate">{property.tdNumber}</p>
                <p className="text-slate-600 truncate">{property.lastName}, {property.firstName}</p>
              </div>

              <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold shadow-2xs">
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                  Successor (New Active TD)
                </span>
                <p className="font-mono font-bold text-indigo-950 truncate">{newTdNumber}</p>
                <p className="text-indigo-800 font-semibold truncate">
                  {newOwnerLastName ? `${newOwnerLastName}, ${newOwnerFirstName}` : 'New Owner Name...'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleExecuteSupersede} className="p-6 space-y-4 text-xs">
              
              {/* New TD Number & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Tax Declaration Number</label>
                  <input
                    type="text"
                    required
                    value={newTdNumber}
                    onChange={(e) => setNewTdNumber(e.target.value)}
                    className="w-full px-3 py-2 font-mono font-bold bg-white border border-slate-300 rounded-xl text-indigo-950 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transfer Date</label>
                  <input
                    type="date"
                    required
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Transfer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Instrument / Mode of Transfer</label>
                  <select
                    value={transferType}
                    onChange={(e) => setTransferType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Deed of Absolute Sale">Deed of Absolute Sale</option>
                    <option value="Deed of Donation">Deed of Donation</option>
                    <option value="Extrajudicial Settlement of Estate">Extrajudicial Settlement of Estate</option>
                    <option value="Subdivision / Consolidation Plan">Subdivision / Consolidation Plan</option>
                    <option value="Court Order / Judicial Decree">Court Order / Judicial Decree</option>
                    <option value="General Revision">General Revision of Assessment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">BIR eCAR / Certificate Authorizing Registration</label>
                  <input
                    type="text"
                    value={carNumber}
                    onChange={(e) => setCarNumber(e.target.value)}
                    placeholder="e.g. eCAR-2026-0008492"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* New Owner Details */}
              <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2.5">
                <p className="font-bold text-indigo-900 uppercase tracking-wider text-[10px]">
                  New Transferee / Owner Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Owner Last Name</label>
                    <input
                      type="text"
                      value={newOwnerLastName}
                      onChange={(e) => setNewOwnerLastName(e.target.value)}
                      placeholder="e.g. Dela Cruz"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Owner First Name</label>
                    <input
                      type="text"
                      value={newOwnerFirstName}
                      onChange={(e) => setNewOwnerFirstName(e.target.value)}
                      placeholder="e.g. Maria Clara"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Middle Name</label>
                    <input
                      type="text"
                      value={newOwnerMiddleName}
                      onChange={(e) => setNewOwnerMiddleName(e.target.value)}
                      placeholder="e.g. Santos"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Or Corporation / Entity / Admin</label>
                  <input
                    type="text"
                    value={newAdminBusinessName}
                    onChange={(e) => setNewAdminBusinessName(e.target.value)}
                    placeholder="e.g. Ayala Land Inc. / Estate of Juan Santos"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Title & Cadastral Updates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">New Title Number (TCT/CCT)</label>
                  <input
                    type="text"
                    value={newTitleNumber}
                    onChange={(e) => setNewTitleNumber(e.target.value)}
                    placeholder="e.g. T-987654"
                    className="w-full px-3 py-1.5 font-mono bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Lot Number</label>
                  <input
                    type="text"
                    value={newLotNumber}
                    onChange={(e) => setNewLotNumber(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Property PIN</label>
                  <input
                    type="text"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3 py-1.5 font-mono bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Valuation Updates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Unit Value / sqm</label>
                  <input
                    type="number"
                    value={newUnitValue}
                    onChange={(e) => handleUnitValueChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Total Market Value ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    value={newMarketValue}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setNewMarketValue(val);
                      setNewAssessedValue(Math.round((val * property.assessmentLevel) / 100));
                    }}
                    className="w-full px-3 py-1.5 font-mono bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">New Assessed Value ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    value={newAssessedValue}
                    onChange={(e) => setNewAssessedValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono font-bold bg-white border border-slate-300 rounded-lg text-indigo-900"
                  />
                </div>
              </div>

              {/* Warning Banner */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Executing this will officially record <strong>{newTdNumber}</strong> as the current active Tax Declaration and automatically mark <strong>{property.tdNumber}</strong> as <strong>CANCELLED</strong> in the permanent archive. Press <kbd className="px-1 py-0.5 bg-amber-100 border border-amber-300 rounded font-mono text-[10px]">Esc</kbd> to exit without changes.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isExecuting}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Executing Succession...</span>
                    </>
                  ) : (
                    <>
                      <span>Issue New TD & Supersede</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

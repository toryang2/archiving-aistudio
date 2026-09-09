import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, UserCheck, Key, Lock, Building2, User, ChevronRight, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, switchUser, showToast } = useApp();
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [password, setPassword] = useState<string>('assessor2026');
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      switchUser(selectedUserId);
      showToast('Authenticated session successfully.');
      setIsSubmitting(false);
      onClose();
    }, 350);
  };

  const activeSelected = users.find((u) => u.id === selectedUserId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="login-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <motion.div
            id="login-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="bg-white rounded-2xl shadow-2xl border border-sky-100 max-w-md w-full overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-800 text-white p-6 relative">
              <button 
                id="close-login-modal-btn"
                onClick={onClose}
                className="absolute top-4 right-4 text-sky-200 hover:text-white p-1.5 rounded-lg hover:bg-sky-500/30 transition-colors cursor-pointer"
                title="Press Esc to close"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-sky-100">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Assessor Office Portal</h2>
                  <p className="text-xs text-sky-100 font-medium">Real Property Tax Declaration System</p>
                </div>
              </div>
              <p className="text-xs text-sky-100/90 mt-2 leading-relaxed">
                Select an authorized municipal staff account to sign in or test different operational roles.
              </p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleLogin} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Select Assessor Staff Profile
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {users.map((user) => {
                    const isSelected = user.id === selectedUserId;
                    return (
                      <button
                        type="button"
                        key={user.id}
                        id={`select-user-${user.id}`}
                        onClick={() => setSelectedUserId(user.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-200 shadow-xs'
                            : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50'
                        }`}
                      >
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-800 truncate">{user.fullName}</p>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                              {user.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Passcode / Security Credential
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-400 focus:border-sky-500 bg-slate-50"
                    placeholder="Enter password"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Pre-filled with demo credential. Press <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-100 border border-slate-300 rounded font-mono text-slate-600">Esc</kbd> to close.</p>
              </div>

              {activeSelected && (
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>Active Role Capabilities:</span>
                  </div>
                  <p className="text-slate-600 pl-5">
                    {activeSelected.role === 'Municipal Assessor'
                      ? 'Full administrative approval, assessment overrides, user management & PSGC settings.'
                      : activeSelected.role === 'Appraiser'
                      ? 'Property appraisal, market value computation & tax declaration draft creation.'
                      : activeSelected.role === 'Tax Mapper'
                      ? 'PIN assignment, cadastral survey mapping & title verification.'
                      : 'Document archival, tax declaration history retrieval & certification generation.'}
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  id="cancel-login-btn"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-login-btn"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl shadow-xs shadow-sky-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In as {activeSelected?.fullName.split(' ')[0] || 'User'}</span>
                      <ChevronRight className="w-4 h-4" />
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


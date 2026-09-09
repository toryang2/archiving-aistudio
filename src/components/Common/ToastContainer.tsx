import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div 
      id="toast-container" 
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none no-print"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          let bg = 'bg-sky-900 text-white border-sky-700 shadow-sky-900/30';
          let Icon = Info;

          if (toast.type === 'success') {
            bg = 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-900/30';
            Icon = CheckCircle2;
          } else if (toast.type === 'error') {
            bg = 'bg-rose-900 text-white border-rose-700 shadow-rose-900/30';
            Icon = AlertCircle;
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-900 text-white border-amber-700 shadow-amber-900/30';
            Icon = AlertTriangle;
          }

          return (
            <motion.div
              key={toast.id}
              id={`toast-${toast.id}`}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border text-sm backdrop-blur-md ${bg}`}
            >
              <Icon className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="flex-1 font-medium leading-relaxed text-xs sm:text-sm">{toast.message}</p>
              <button
                id={`close-toast-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="text-white/70 hover:text-white transition-colors p-1 -mr-1 cursor-pointer rounded-lg hover:bg-white/10"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};


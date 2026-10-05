import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          info: <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />,
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
        };

        const borders = {
          info: 'border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]',
          success: 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
          warning: 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
          error: 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl bg-[#0D101A]/95 backdrop-blur-xl border ${borders[toast.type]} flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-3`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-white tracking-wide">{toast.title}</h4>
              {toast.description && (
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

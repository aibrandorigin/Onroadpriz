import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map(toast => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-[#087F5B] shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-[#77101F] shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-[#77101F] shrink-0" />
        };

        const bgColors = {
          success: 'bg-white border-[#087F5B]/30 text-[#101828] shadow-xl',
          error: 'bg-white border-[#77101F]/30 text-[#101828] shadow-xl',
          warning: 'bg-white border-amber-300 text-[#101828] shadow-xl',
          info: 'bg-white border-[#77101F]/30 text-[#101828] shadow-xl'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border ${bgColors[toast.type]} transition-all animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#101828] font-display">{toast.title}</h4>
              <p className="text-xs text-[#667085] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#98A2B3] hover:text-[#101828] p-1 -mr-1 -mt-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

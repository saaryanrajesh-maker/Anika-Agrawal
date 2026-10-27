import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const styles = {
    info: 'bg-blue-50/90 border-blue-200 text-blue-900',
    success: 'bg-emerald-50/90 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50/90 border-amber-200 text-amber-900',
    error: 'bg-rose-50/90 border-rose-200 text-rose-900',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
  };

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 p-4 rounded-xl border transition-all ${styles[type]} ${className}`}
    >
      {icons[type]}
      <div className="flex-1 text-sm leading-relaxed">
        {title && <h4 className="font-semibold mb-1 text-slate-900">{title}</h4>}
        <div className="opacity-95">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Dismiss alert"
          className="p-1 -mr-1 -mt-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-black/5 transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

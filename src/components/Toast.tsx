import { useEffect } from 'react';
import { ToastMessage } from '../types';
import { X, Check, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <Check className="w-4 h-4 text-[#3fb950] shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-[#d29922] shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-[#f85149] shrink-0" />,
    info: <Info className="w-4 h-4 text-[#58a6ff] shrink-0" />
  };

  return (
    <div className="pointer-events-auto flex items-start gap-2.5 p-3 rounded-lg border border-[#30363d] bg-[#161b22] shadow-lg text-xs">
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <h4 className="font-semibold text-[#f0f6fc]">{toast.title}</h4>
        {toast.message && (
          <p className="text-[#8b949e] leading-relaxed break-words">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#8b949e] hover:text-[#f0f6fc] p-0.5 rounded transition-colors"
        aria-label="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md p-5 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl text-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-[#f0f6fc]">
            {title}
          </h3>
          <button
            onClick={onCancel}
            className="p-1 text-[#8b949e] hover:text-[#f0f6fc] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[#8b949e] leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 font-medium text-[#c9d1d9] hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3 py-1.5 font-medium text-white rounded transition-colors ${
              isDestructive
                ? 'bg-[#da3633] hover:bg-[#f85149]'
                : 'bg-[#1f6feb] hover:bg-[#388bfd]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

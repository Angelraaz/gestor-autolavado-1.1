import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-zinc-900 border border-zinc-700 text-zinc-100 p-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-2">
            {t.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            ) : t.type === 'info' ? (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="font-medium">{t.text}</span>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-zinc-500 hover:text-zinc-200 text-sm font-bold px-1"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

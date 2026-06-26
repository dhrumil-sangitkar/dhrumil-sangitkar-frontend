import React from 'react';
import { useMedia } from '../context/MediaContext';
import { ToastMessage } from '../types';

const iconMap: Record<ToastMessage['type'], string> = {
  success: 'fa-check-circle text-gold-500',
  error: 'fa-times-circle text-rose-500',
  info: 'fa-info-circle text-sky-400',
};

const bgMap: Record<ToastMessage['type'], string> = {
  success: 'bg-slate-900 border-gold-500',
  error: 'bg-rose-950 border-rose-500',
  info: 'bg-royal-800 border-sky-400',
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useMedia();

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${bgMap[toast.type]} border text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 pointer-events-auto animate-slide-in`}
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <i className={`fas ${iconMap[toast.type]} text-lg shrink-0`} />
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/50 hover:text-white transition shrink-0"
          >
            <i className="fas fa-times text-xs" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

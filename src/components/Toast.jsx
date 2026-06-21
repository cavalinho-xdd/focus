import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Toast({ message, type = 'info', action = null, onDismiss }) {
  useEffect(() => {
    const timeout = (type === 'error' || action) ? 8000 : 3500;
    const timer = setTimeout(onDismiss, timeout);
    return () => clearTimeout(timer);
  }, [onDismiss, type, action]);

  const colorMap = {
    success: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300',
    error: 'bg-red-500/15 border-red-500/25 text-red-300',
    info: 'bg-focus-primary/15 border-focus-primary/25 text-focus-primary',
  };

  const actionColorMap = {
    success: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200',
    error: 'bg-red-500/20 hover:bg-red-500/30 text-red-200',
    info: 'bg-focus-primary/20 hover:bg-focus-primary/30 text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[var(--z-toast)] px-5 py-3 rounded-xl border backdrop-blur-md text-sm font-medium shadow-2xl flex items-center gap-4 ${colorMap[type]}`}
    >
      <span>{message}</span>
      {action && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
            onDismiss();
          }}
          className={`px-3 py-1.5 rounded-md text-xs font-bold btn-press ${actionColorMap[type]}`}
        >
          {action.label}
        </button>
      )}
      {!action && (
        <button onClick={onDismiss} aria-label="Dismiss message" className="opacity-50 hover:opacity-100 transition-opacity ml-2 text-xs">
          ✕
        </button>
      )}
    </motion.div>
  );
}

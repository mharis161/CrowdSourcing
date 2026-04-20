import React from 'react';
import { useToastStore } from '../store/useToastStore';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`pointer-events-auto min-w-[320px] max-w-md bg-white dark:bg-slate-900 border ${
              toast.type === 'error' ? 'border-red-100 dark:border-red-900/30' : 
              toast.type === 'warning' ? 'border-orange-100 dark:border-orange-900/30' : 
              'border-emerald-100 dark:border-emerald-900/30'
            } shadow-2xl rounded-2xl p-4 flex items-start gap-4 flex-nowrap group`}
          >
            <div className={`shrink-0 p-2 rounded-xl ${
              toast.type === 'error' ? 'bg-red-50 text-red-500' : 
              toast.type === 'warning' ? 'bg-orange-50 text-orange-500' : 
              'bg-emerald-50 text-emerald-500'
            }`}>
              {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : 
               toast.type === 'warning' ? <Info className="w-5 h-5" /> : 
               <CheckCircle className="w-5 h-5" />}
            </div>

            <div className="flex-1 pt-0.5 pr-2">
              <h4 className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                {toast.type === 'error' ? 'Error' : toast.type === 'warning' ? 'Warning' : 'Success'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button 
              onClick={() => removeToast(toast.id)}
              className="mt-0.5 p-1 rounded-lg text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;

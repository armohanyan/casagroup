"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

export type AdminToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  msg: string;
  type: AdminToastType;
}

interface AdminToastContextValue {
  toast: (msg: string, type?: AdminToastType) => void;
}

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) throw new Error("useAdminToast must be used within AdminToastProvider");
  return ctx;
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((msg: string, type: AdminToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[300] space-y-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, y: -8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className={`pointer-events-auto flex items-start gap-3 rounded-[5px] border bg-white px-4 py-3.5 text-sm shadow-[0_4px_20px_rgba(15,23,42,0.1)] ${
                t.type === "error"
                  ? "border-red-200 text-[#0c1428]"
                  : t.type === "info"
                    ? "border-[#E5E7EB] text-[#0c1428]"
                    : "border-[#c9a96e]/35 text-[#0c1428]"
              }`}
            >
              {t.type === "error" ? (
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
              ) : (
                <CheckCircle size={16} className="mt-0.5 shrink-0 text-[#c9a96e]" />
              )}
              <span className="flex-1 leading-snug">{t.msg}</span>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="shrink-0 text-[#9CA3AF] hover:text-[#0c1428] transition-colors"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AdminToastContext.Provider>
  );
}

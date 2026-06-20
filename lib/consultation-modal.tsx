"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface ConsultationModalContextValue {
  open: boolean;
  openConsultation: () => void;
  closeConsultation: () => void;
}

const ConsultationModalContext = createContext<ConsultationModalContextValue | null>(null);

export function ConsultationModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openConsultation = useCallback(() => setOpen(true), []);
  const closeConsultation = useCallback(() => setOpen(false), []);

  return (
    <ConsultationModalContext.Provider value={{ open, openConsultation, closeConsultation }}>
      {children}
    </ConsultationModalContext.Provider>
  );
}

export function useConsultationModal() {
  const ctx = useContext(ConsultationModalContext);
  if (!ctx) {
    throw new Error("useConsultationModal must be used within ConsultationModalProvider");
  }
  return ctx;
}

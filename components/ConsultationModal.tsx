"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useConsultationModal } from "@/lib/consultation-modal";

interface FormData {
  fullName: string;
  phone: string;
  note: string;
}

export function ConsultationModal() {
  const { t } = useI18n();
  const { open, closeConsultation } = useConsultationModal();
  const [form, setForm] = useState<FormData>({ fullName: "", phone: "", note: "" });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeConsultation();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeConsultation]);

  function resetForm() {
    setForm({ fullName: "", phone: "", note: "" });
    setErrors({});
    setSubmitError(null);
    setSubmitted(false);
  }

  function handleClose() {
    closeConsultation();
    window.setTimeout(resetForm, 300);
  }

  function validate() {
    const e: Partial<FormData> = {};
    if (!form.fullName.trim()) e.fullName = t.form.required;
    if (!form.phone.trim()) e.phone = t.form.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(null);
    setLoading(true);
    try {
      const { submitInquiry } = await import("@/lib/api-client");
      await submitInquiry({
        kind: "consultation",
        fullName: form.fullName,
        phone: form.phone,
        email: "",
        interestedProject: "",
        message: form.note.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t.form.submitError);
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "field-input-line font-sans w-full";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="consultation-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={handleClose}
            aria-label="Close"
          />

          <motion.div
            className="relative w-full max-w-md bg-white rounded-xl border border-[#E7E0D5] shadow-xl overflow-hidden"
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full border border-[#E7E0D5] bg-[#FAF8F5] flex items-center justify-center text-[#57534E] hover:text-[#c9a96e] hover:border-[#c9a96e] transition-colors z-10"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="p-6 sm:p-8">
              {submitted ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-8 gap-4 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <CheckCircle size={44} className="text-[#c9a96e]" />
                  <h3 className="font-sans font-semibold text-xl text-[#1C1917]">
                    {t.form.successTitle}
                  </h3>
                  <p className="text-sm text-[#57534E] max-w-xs">{t.form.successDesc}</p>
                  <Button type="button" onClick={handleClose} className="mt-2 h-10 px-6 type-button">
                    {t.consultation.close}
                  </Button>
                </motion.div>
              ) : (
                <>
                  <p className="type-label text-[#c9a96e]">{t.consultation.eyebrow}</p>
                  <h2 id="consultation-modal-title" className="type-section-heading text-[#1C1917] mt-2 pr-8">
                    {t.consultation.title}
                  </h2>
                  <p className="text-sm text-[#57534E] mt-2 mb-6">{t.consultation.subtitle}</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        className={inputCls}
                        placeholder={t.consultation.fullName}
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        autoFocus
                      />
                      {errors.fullName && (
                        <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <input
                        className={inputCls}
                        type="tel"
                        placeholder={t.consultation.phone}
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                      {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={3}
                        placeholder={t.consultation.note}
                        value={form.note}
                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                      />
                    </div>

                    {submitError && <p className="text-red-400 text-sm">{submitError}</p>}

                    <Button
                      type="submit"
                      disabled={loading}
                      size="lg"
                      variant="default"
                      className="w-full h-11 type-button"
                    >
                      {loading ? t.form.sending : t.consultation.submit}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

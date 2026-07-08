"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MortgageCalculator } from "@/components/MortgageCalculator";
import { useI18n } from "@/lib/i18n";

export type ApartmentInquiryModalType = "info" | "call" | "whatsapp" | "visit" | "calculator";

interface ApartmentInquiryContext {
  projectTitle: string;
  listingCode: number;
  whatsappHref: string;
  price: number;
}

interface Props {
  type: ApartmentInquiryModalType | null;
  onClose: () => void;
  context: ApartmentInquiryContext;
}

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  message: string;
}

const inputCls = "field-input-line font-sans w-full";

function apartmentRef(context: ApartmentInquiryContext) {
  return `#${context.listingCode} · ${context.projectTitle}`;
}

export function ApartmentInquiryModal({ type, onClose, context }: Props) {
  const { t } = useI18n();
  const open = type !== null;

  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    email: "",
    message: "",
  });
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
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open || !type) return;
    setForm({
      fullName: "",
      phone: "",
      email: "",
      message:
        type === "info"
          ? t.aptDetail.modalInfo.defaultMessage.replace("{ref}", apartmentRef(context))
          : "",
    });
    setErrors({});
    setSubmitError(null);
    setSubmitted(false);
  }, [open, type, context.listingCode, context.projectTitle, t]);

  function handleClose() {
    onClose();
  }

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.fullName.trim()) e.fullName = t.form.required;
    if (!form.phone.trim()) e.phone = t.form.required;
    if (type === "info") {
      if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email)) e.email = t.form.emailRequired;
      if (!form.message.trim()) e.message = t.form.required;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type || type === "whatsapp" || type === "calculator") return;
    if (!validate()) return;

    setSubmitError(null);
    setLoading(true);

    const kindMap = { info: "apartment-info", call: "callback", visit: "visit" } as const;
    const kind = kindMap[type as keyof typeof kindMap];
    const ref = apartmentRef(context);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          interestedProject: context.projectTitle,
          message:
            type === "call" || type === "visit"
              ? form.message.trim() || `${kind} request for ${ref}`
              : form.message,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? t.form.submitError);
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t.form.submitError);
    } finally {
      setLoading(false);
    }
  }

  const modalCopy = type
    ? {
        info: t.aptDetail.modalInfo,
        call: t.aptDetail.modalCall,
        whatsapp: t.aptDetail.modalWhatsApp,
        visit: t.aptDetail.modalVisit,
        calculator: {
          eyebrow: t.calculator.eyebrow,
          title: t.calculator.title,
          subtitle: t.calculator.subtitle,
        },
      }[type]
    : null;

  const isWide = type === "calculator";

  return (
    <AnimatePresence>
      {open && modalCopy && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-4 pt-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="apt-inquiry-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={handleClose}
            aria-label="Close"
          />

          <motion.div
            className={`relative w-full bg-white border border-[#E7E0D5] shadow-xl overflow-hidden rounded-xl ${
              isWide ? "max-w-3xl max-h-[92vh]" : "max-w-md"
            }`}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
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

            <div className={`px-5 py-6 sm:p-8 ${isWide ? "overflow-y-auto max-h-[92vh]" : ""}`}>
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
              ) : type === "calculator" ? (
                <>
                  <p className="type-label text-[#c9a96e]">{modalCopy.eyebrow}</p>
                  <h2 id="apt-inquiry-modal-title" className="type-section-heading text-[#1C1917] mt-2 pr-8">
                    {modalCopy.title}
                  </h2>
                  <p className="text-sm text-[#57534E] mt-2 mb-6">{modalCopy.subtitle}</p>
                  <MortgageCalculator initialPrice={context.price} compact />
                </>
              ) : type === "whatsapp" ? (
                <>
                  <p className="type-label text-[#c9a96e]">{modalCopy.eyebrow}</p>
                  <h2 id="apt-inquiry-modal-title" className="type-section-heading text-[#1C1917] mt-2 pr-8">
                    {modalCopy.title}
                  </h2>
                  <p className="text-sm text-[#57534E] mt-2 mb-2">{modalCopy.subtitle}</p>
                  <p className="text-sm font-medium text-[#1C1917] mb-6">{apartmentRef(context)}</p>
                  <a
                    href={context.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 py-3.5 text-sm font-semibold rounded-lg bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors type-button"
                  >
                    <MessageCircle size={18} />
                    {t.aptDetail.modalWhatsApp.openButton}
                  </a>
                </>
              ) : (
                <>
                  <p className="type-label text-[#c9a96e]">{modalCopy.eyebrow}</p>
                  <h2 id="apt-inquiry-modal-title" className="type-section-heading text-[#1C1917] mt-2 pr-8">
                    {modalCopy.title}
                  </h2>
                  <p className="text-sm text-[#57534E] mt-2 mb-1">{modalCopy.subtitle}</p>
                  <p className="text-xs font-medium text-[#A8A29E] mb-6">{apartmentRef(context)}</p>

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

                    {type === "info" && (
                      <>
                        <div>
                          <input
                            className={inputCls}
                            type="email"
                            placeholder={t.form.email.replace(" *", "")}
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                          />
                          {errors.email && (
                            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                          )}
                        </div>
                        <div>
                          <textarea
                            className={`${inputCls} resize-none`}
                            rows={3}
                            placeholder={t.form.message}
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                          />
                          {errors.message && (
                            <p className="text-red-400 text-xs mt-1">{errors.message}</p>
                          )}
                        </div>
                      </>
                    )}

                    {(type === "call" || type === "visit") && (
                      <div>
                        <input
                          className={inputCls}
                          placeholder={
                            type === "call"
                              ? t.aptDetail.modalCall.preferredTime
                              : t.aptDetail.modalVisit.preferredDate
                          }
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                        />
                      </div>
                    )}

                    {submitError && <p className="text-red-400 text-sm">{submitError}</p>}

                    <Button
                      type="submit"
                      disabled={loading}
                      size="lg"
                      variant="default"
                      className="w-full h-11 type-button"
                    >
                      {loading
                        ? t.form.sending
                        : type === "info"
                          ? t.aptDetail.modalInfo.submit
                          : type === "call"
                            ? t.aptDetail.modalCall.submit
                            : t.aptDetail.modalVisit.submit}
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

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { submitInquiry } from "@/lib/api-client";

interface FormData {
  fullName: string;
  phone: string;
  message: string;
}

interface Props {
  defaultProject?: string;
}

export function ContactForm({ defaultProject = "" }: Props) {
  const { t } = useI18n();
  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const inputCls = "field-input-line font-sans";

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
      await submitInquiry({
        fullName: form.fullName,
        phone: form.phone,
        email: "",
        interestedProject: defaultProject,
        message: form.message.trim(),
        kind: "callback",
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t.form.submitError);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <CheckCircle size={48} className="text-[#c9a96e]" />
        <h3 className="font-sans font-semibold text-2xl text-[#1C1917]">
          {t.form.successTitle}
        </h3>
        <p className="text-sm text-center max-w-sm text-[#57534E]">
          {t.form.successDesc}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <input
            className={inputCls}
            placeholder={t.form.fullName}
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <input
            className={inputCls}
            placeholder={t.form.phone}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <textarea
          className={`${inputCls} resize-none`}
          rows={4}
          placeholder={t.form.message.replace(/\s*\*$/, "")}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>

      {submitError && <p className="text-red-400 text-sm">{submitError}</p>}

      <Button type="submit" disabled={loading} size="lg" variant="default" className="w-full sm:w-auto h-11 px-8 type-button rounded-[5px]">
        {loading ? t.form.sending : t.form.send}
      </Button>
    </form>
  );
}


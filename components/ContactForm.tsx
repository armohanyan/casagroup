"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  interestedProject: string;
  message: string;
}

interface Props {
  defaultProject?: string;
  light?: boolean;
}

export function ContactForm({ defaultProject = "", light = false }: Props) {
  const { t } = useI18n();
  const { projects, loading: projectsLoading } = useProjects();
  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    email: "",
    interestedProject: defaultProject,
    message: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const inputCls = `w-full bg-transparent border-b ${
    light ? "border-[#ccc] text-[#0C1428] placeholder-[#aaa] focus:border-[#c9a96e]" : "border-[#2a2520] text-[#f0ece4] placeholder-[#5a554f] focus:border-[#c9a96e]"
  } outline-none py-3 text-sm transition-colors duration-200 font-['DM_Sans']`;

  function validate() {
    const e: Partial<FormData> = {};
    if (!form.fullName.trim()) e.fullName = t.form.required;
    if (!form.phone.trim()) e.phone = t.form.required;
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = t.form.emailRequired;
    if (!form.message.trim()) e.message = t.form.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  if (submitted) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <CheckCircle size={48} className="text-[#c9a96e]" />
        <h3 className={`font-['Cormorant_Garamond'] text-2xl font-light ${light ? "text-[#0C1428]" : "text-[#f0ece4]"}`}>
          {t.form.successTitle}
        </h3>
        <p className={`text-sm text-center max-w-sm ${light ? "text-[#5a554f]" : "text-[#9a9085]"}`}>
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
        <input
          className={inputCls}
          type="email"
          placeholder={t.form.email}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <select
          className={`${inputCls} appearance-none cursor-pointer`}
          value={form.interestedProject}
          onChange={(e) => setForm({ ...form, interestedProject: e.target.value })}
        >
          <option value="">{projectsLoading ? "…" : t.form.selectProject}</option>
          {projects.map((p) => (
            <option key={p.id} value={p.title}>{p.title}</option>
          ))}
        </select>
      </div>

      <div>
        <textarea
          className={`${inputCls} resize-none`}
          rows={4}
          placeholder={t.form.message}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
      </div>

      {submitError && <p className="text-red-400 text-sm">{submitError}</p>}

      <Button type="submit" disabled={loading} size="lg" variant="default">
        {loading ? t.form.sending : t.form.send}
      </Button>
    </form>
  );
}

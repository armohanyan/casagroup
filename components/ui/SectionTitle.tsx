import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

export function SectionTitle({ eyebrow, title, subtitle, centered = false, light = false }: SectionTitleProps) {
  const { lang } = useI18n();
  const fs = lang === "hy"
    ? "clamp(1.5rem, 2.3vw, 2.3rem)"
    : "clamp(1.75rem, 2.8vw, 2.8rem)";

  return (
    <motion.div
      className={`mb-16 ${centered ? "text-center" : ""}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {eyebrow && (
        <p className="text-xs tracking-[0.3em] uppercase font-medium text-[#c9a96e] mb-4">
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-['Cormorant_Garamond'] font-light leading-[1.15] break-words hyphens-auto ${
          light ? "text-[#0C1428]" : "text-[#f0ece4]"
        }`}
        style={{ fontSize: fs }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-5 font-light leading-relaxed max-w-xl text-sm sm:text-base ${centered ? "mx-auto" : ""} ${
            light ? "text-[#5a554f]" : "text-[#9a9085]"
          }`}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

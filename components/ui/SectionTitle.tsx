import { motion } from "framer-motion";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  centered?: boolean;
  className?: string;
}

export function SectionTitle({ eyebrow, title, centered = false, className = "" }: SectionTitleProps) {
  return (
    <motion.div
      className={`mb-8 ${centered ? "text-center" : ""} ${className}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {eyebrow && <p className="brand-eyebrow">{eyebrow}</p>}
      <h2
        className={`font-sans text-xl sm:text-2xl font-semibold leading-snug text-[#1C1917] ${
          centered ? "" : "section-heading"
        }`}
      >
        {title}
      </h2>
    </motion.div>
  );
}

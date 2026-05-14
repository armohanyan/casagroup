import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useI18n } from "@/lib/i18n";

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = value / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCurrent(value);
        clearInterval(timer);
      } else {
        setCurrent(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref} className="font-['Cormorant_Garamond'] text-[#c9a96e] font-light" style={{ fontSize: "clamp(2.5rem, 3.5vw, 3.2rem)" }}>
      {current}{suffix}
    </span>
  );
}

export function StatsSection() {
  const { t } = useI18n();
  return (
    <section className="py-24 bg-[#0C1428] border-y border-[#2a2520]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid min-w-0 grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {t.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="min-w-0 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              <p className="mt-3 text-xs tracking-[0.2em] uppercase text-[#9a9085] font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

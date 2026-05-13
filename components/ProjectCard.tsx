import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, Building2, ChevronRight } from "lucide-react";
import { StatusBadge } from "./ui/StatusBadge";
import { useI18n } from "@/lib/i18n";
import type { Project } from "@/types";

function formatPrice(p: number) {
  return p >= 1_000_000
    ? `$${(p / 1_000_000).toFixed(1)}M`
    : `$${(p / 1000).toFixed(0)}K`;
}

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 300, damping: 30 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="group bg-[#0f1e30] border border-[#2a2520] rounded-xl overflow-hidden hover:border-[#c9a96e]/40 transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <motion.div className="h-full w-full" whileHover={{ scale: 1.05 }} transition={{ duration: 0.5 }}>
          {project.images[0] ? (
            <Image
              src={project.images[0]}
              alt={`${project.title} — ${project.location} new construction preview`}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          ) : null}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1e30] via-transparent to-transparent" />
        <div className="absolute top-4 left-4">
          <StatusBadge status={project.status} />
        </div>
        {project.featured && (
          <div className="absolute top-4 right-4 px-2.5 py-1 bg-[#c9a96e] text-[#0C1428] text-xs font-semibold tracking-widest uppercase rounded-sm">
            {t.card.featured}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-['Cormorant_Garamond'] text-2xl font-light text-[#f0ece4] mb-2 group-hover:text-[#c9a96e] transition-colors">
          {project.title}
        </h3>

        <div className="flex items-center gap-1.5 text-[#9a9085] text-sm mb-4">
          <MapPin size={13} className="text-[#c9a96e]" />
          {project.location}
        </div>

        <p className="text-[#9a9085] text-sm leading-relaxed mb-6 line-clamp-2">
          {project.description}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-xs text-[#5a554f] uppercase tracking-wider mb-1">{t.card.from}</p>
            <p className="text-[#c9a96e] font-['DM_Mono'] font-medium">{formatPrice(project.startingPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-[#5a554f] uppercase tracking-wider mb-1">{t.card.available}</p>
            <p className="text-[#f0ece4] font-['DM_Mono'] font-medium">{project.availableApartmentsCount}</p>
          </div>
          <div>
            <p className="text-xs text-[#5a554f] uppercase tracking-wider mb-1">{t.card.completion}</p>
            <p className="text-[#f0ece4] text-sm font-medium">{project.completionDate}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[#2a2520]">
          <div className="flex items-center gap-3 text-xs text-[#9a9085]">
            <Building2 size={13} />
            <span>{project.floors} {t.card.floors}</span>
            <Calendar size={13} className="ml-2" />
            <span>{project.completionDate}</span>
          </div>
          <Link href={`/projects/${project.slug}`}>
            <span className="flex items-center gap-1 text-xs tracking-widest uppercase text-[#c9a96e] hover:gap-2 transition-all cursor-pointer">
              {t.card.view.replace(" →", "")} <ChevronRight size={13} />
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

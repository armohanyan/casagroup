import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Video } from "lucide-react";
import { SectionTitle } from "./ui/SectionTitle";
import { useI18n } from "@/lib/i18n";

interface DroneVideo {
  title: string;
  url: string;
  thumbnail?: string;
}

interface Props {
  videos: DroneVideo[];
  projectTitle: string;
}

export function DroneVideoSection({ videos, projectTitle }: Props) {
  const { t } = useI18n();
  const [active, setActive] = useState<DroneVideo | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  if (!videos || videos.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-24">
        <SectionTitle eyebrow={t.projectDetail.droneEyebrow} title={t.projectDetail.droneTitle} />
        <div className="h-52 rounded-2xl border border-[#1e2d45] bg-[#0d1829] flex items-center justify-center">
          <div className="text-center">
            <Video size={32} className="text-[#2a3d58] mx-auto mb-3" />
            <p className="text-[#5a554f] text-sm tracking-widest uppercase">{t.projectDetail.droneNoVideo}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-24">
        <SectionTitle
          eyebrow={t.projectDetail.droneEyebrow}
          title={t.projectDetail.droneTitle}
          subtitle={t.projectDetail.droneSubtitle}
        />

        <div className={`grid gap-4 ${videos.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
          {videos.map((video, i) => (
            <motion.div
              key={i}
              className="relative rounded-xl overflow-hidden cursor-pointer group border border-[#1e2d45] bg-[#0d1829]"
              style={{ height: videos.length === 1 ? "460px" : "300px" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              onClick={() => setActive(video)}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
            >
              {/* Thumbnail */}
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#0d1829] to-[#162035]" />
              )}

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-[#0C1428]/50 group-hover:bg-[#0C1428]/30 transition-colors duration-300" />

              {/* Drone badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#0C1428]/80 backdrop-blur-sm border border-[#1e2d45] rounded-full px-3 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] animate-pulse" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#9a9085] font-medium">Drone</span>
              </div>

              {/* Play button */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: hovered === i ? 1.1 : 1 }}
                transition={{ duration: 0.25 }}
              >
                <div className="w-16 h-16 rounded-full bg-[#c9a96e]/20 border border-[#c9a96e]/60 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#c9a96e]/30 transition-all duration-300">
                  <Play size={22} className="text-[#c9a96e] ml-1" fill="#c9a96e" />
                </div>
              </motion.div>

              {/* Title bar */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0C1428]/90 to-transparent">
                <p className="text-[#f0ece4] text-sm font-medium">{video.title}</p>
                <p className="text-[#9a9085] text-xs mt-0.5 tracking-wider">{projectTitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[200] bg-[#0C1428]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <button
              className="absolute top-6 right-6 w-10 h-10 rounded-full border border-[#1e2d45] bg-[#0d1829] flex items-center justify-center text-[#9a9085] hover:text-[#c9a96e] hover:border-[#c9a96e] transition-all z-10"
              onClick={() => setActive(null)}
            >
              <X size={18} />
            </button>

            <motion.div
              className="w-full max-w-5xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#c9a96e] animate-pulse" />
                <p className="text-xs tracking-[0.3em] uppercase text-[#c9a96e]">Drone · {active.title}</p>
              </div>

              {/* YouTube iframe */}
              <div className="relative w-full rounded-xl overflow-hidden border border-[#1e2d45]" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={`${active.url}?autoplay=1&rel=0&modestbranding=1&color=white`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={active.title}
                />
              </div>

              <p className="mt-4 text-[#5a554f] text-xs text-center tracking-widest">
                {projectTitle} — {active.title}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

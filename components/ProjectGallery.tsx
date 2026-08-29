import { useState } from "react";
import { useMediaQuery } from "@/lib/use-media-query";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
  title: string;
}

export function ProjectGallery({ images, title }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const canFineHover = useMediaQuery("(hover: hover) and (pointer: fine)");

  const prev = () => setLightbox((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  const next = () => setLightbox((i) => (i !== null ? (i + 1) % images.length : null));

  return (
    <>
      <div className="min-w-0 overflow-x-clip">
        <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-3">
          {images.map((img, i) => (
            <motion.div
              key={i}
              className={`relative cursor-pointer overflow-hidden rounded-lg ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              style={{
                height:
                  i === 0
                    ? "clamp(220px, min(55vw, 55dvh), 480px)"
                    : "clamp(120px, min(28vw, 28dvh), 230px)",
              }}
              onClick={() => setLightbox(i)}
              whileHover={canFineHover ? { scale: 1.02 } : undefined}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={img}
                alt={`${title} - interior photo ${i + 1}`}
                fill
                unoptimized
                sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 50vw, 33vw"}
                className="object-cover"
                priority={i === 0}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                <span className="text-sm tracking-widest text-white uppercase">View</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-6 right-6 text-white hover:text-[#c9a96e] transition-colors"
              onClick={() => setLightbox(null)}
            >
              <X size={28} />
            </button>
            <button
              className="absolute left-6 text-white hover:text-[#c9a96e] transition-colors p-2"
              onClick={(e) => { e.stopPropagation(); prev(); }}
            >
              <ChevronLeft size={36} />
            </button>
            <button
              className="absolute right-6 text-white hover:text-[#c9a96e] transition-colors p-2"
              onClick={(e) => { e.stopPropagation(); next(); }}
            >
              <ChevronRight size={36} />
            </button>
            <motion.div
              key={lightbox}
              className="relative mx-auto w-full max-w-5xl h-[min(85vh,900px)] max-h-[85vh]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightbox]}
                alt={`${title} - enlarged view ${lightbox + 1}`}
                fill
                unoptimized
                sizes="100vw"
                className="object-contain rounded-lg"
              />
            </motion.div>
            <div className="absolute bottom-6 text-white/50 text-sm">
              {lightbox + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

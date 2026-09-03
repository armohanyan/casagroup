"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "@/lib/utils";

type Props = {
  imageUrl: string;
  alt: string;
  children: ReactNode;
  className?: string;
  /** Full image width with no viewport height cap (lightbox). */
  unconstrained?: boolean;
  frameRef?: Ref<HTMLDivElement>;
  imageId?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

function readRatio(img: HTMLImageElement): number | null {
  if (img.naturalWidth > 0 && img.naturalHeight > 0) {
    return img.naturalWidth / img.naturalHeight;
  }
  return null;
}

/**
 * Sizes the plan image and percent overlays to the same rectangle.
 * Avoids object-contain / object-cover, which letterbox or crop the bitmap
 * while SVG/HTML overlays still fill the CSS box.
 */
export function PercentMapFrame({
  imageUrl,
  alt,
  children,
  className,
  unconstrained = false,
  frameRef,
  imageId,
  onClick,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [ratio, setRatio] = useState<number | null>(null);

  useLayoutEffect(() => {
    const img = imgRef.current;
    setRatio(img ? readRatio(img) : null);
  }, [imageUrl]);

  const fitted = !unconstrained && ratio != null;

  return (
    <div className={cn("relative flex w-full justify-center", className)}>
      <div
        ref={frameRef}
        className={cn(
          "relative max-w-full",
          unconstrained || !fitted ? "w-full" : "[--map-max-h:52vh] sm:[--map-max-h:60vh] md:[--map-max-h:100dvh]",
        )}
        style={
          fitted
            ? ({
                "--map-ratio": String(ratio),
                aspectRatio: String(ratio),
                width: "min(100%, calc(var(--map-max-h) * var(--map-ratio)))",
              } as CSSProperties)
            : undefined
        }
        onClick={onClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          id={imageId}
          src={imageUrl}
          alt={alt}
          className={
            fitted
              ? "pointer-events-none absolute inset-0 h-full w-full max-h-none select-none"
              : "pointer-events-none block h-auto w-full select-none"
          }
          draggable={false}
          decoding="async"
          onLoad={(e) => {
            const next = readRatio(e.currentTarget);
            if (next != null) setRatio(next);
          }}
        />
        {children}
      </div>
    </div>
  );
}

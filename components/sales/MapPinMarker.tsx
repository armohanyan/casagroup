import { cn } from "@/lib/utils";

/** HTML pin over a percent-based map (avoids SVG circle+text stacking). */
export function MapPinMarker({
  x,
  y,
  label,
  className,
}: {
  x: number;
  y: number;
  label: string;
  className?: string;
}) {
  const text = label.trim() || "·";
  const compact = text.length <= 2;

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-[11] flex -translate-x-1/2 -translate-y-1/2 items-center gap-1",
        className,
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {compact ? (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-[#c9a96e] text-[9px] font-bold leading-none text-white shadow-sm sm:h-6 sm:w-6 sm:border-2 sm:text-[10px] md:h-7 md:w-7 md:text-xs">
          {text}
        </span>
      ) : (
        <>
          <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-white bg-[#c9a96e] shadow-sm sm:h-3 sm:w-3 sm:border-2 md:h-3.5 md:w-3.5" />
          <span className="max-w-[6.5rem] truncate rounded bg-[#0c1428]/75 px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-white shadow-sm sm:max-w-[9rem] sm:px-2 sm:text-xs md:max-w-[11rem] md:text-sm">
            {text}
          </span>
        </>
      )}
    </div>
  );
}

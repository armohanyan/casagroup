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
        "pointer-events-none absolute z-[11] flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5",
        className,
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {compact ? (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#c9a96e] text-xs font-bold text-white shadow-sm">
          {text}
        </span>
      ) : (
        <>
          <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white bg-[#c9a96e] shadow-sm" />
          <span className="max-w-[11rem] truncate rounded bg-[#0c1428]/75 px-2 py-0.5 text-xs font-bold text-white shadow-sm sm:max-w-[14rem] sm:text-sm">
            {text}
          </span>
        </>
      )}
    </div>
  );
}

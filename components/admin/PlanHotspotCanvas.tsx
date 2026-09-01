"use client";

import { useEffect, useRef, useState } from "react";
import { Hand, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { planTextLabelStyle } from "@/lib/plan-text-labels";

export type PlanPoint = [number, number];

export type PlanPolygon = {
  id: string;
  points: PlanPoint[];
  active?: boolean;
  dimmed?: boolean;
};

export type PlanTextLabel = {
  id: string;
  text: string;
  color: string;
  backgroundColor?: string;
  fontSize?: number;
  x: number;
  y: number;
  active?: boolean;
};

type Props = {
  imageUrl: string;
  polygons: PlanPolygon[];
  draft: PlanPoint[];
  /** When true, existing polygons ignore pointer events so shared borders don't block drawing. */
  drawing: boolean;
  onAddPoint: (pt: PlanPoint) => void;
  /** Move an existing draft vertex (index in `draft`). */
  onMovePoint?: (index: number, pt: PlanPoint) => void;
  onSelectPolygon?: (id: string) => void;
  onFinishDraft?: () => void;
  /** Free-floating text labels on the plan image. */
  textLabels?: PlanTextLabel[];
  /** When true, clicks place/move text labels instead of polygon points. */
  labelPlacementMode?: boolean;
  selectedLabelId?: string | null;
  onPlaceLabel?: (pt: PlanPoint) => void;
  onMoveLabel?: (id: string, pt: PlanPoint) => void;
  onSelectLabel?: (id: string) => void;
  labels: {
    zoomIn: string;
    zoomOut: string;
    zoomReset: string;
    panMode: string;
    drawMode: string;
  };
};

function pointsToSvg(points: PlanPoint[]) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const ZOOM_STEP = 0.25;
/** Target handle radius on screen (px), independent of image aspect ratio. */
const HANDLE_PX = 5;
const HANDLE_HIT_PX = 12;

export function PlanHotspotCanvas({
  imageUrl,
  polygons,
  draft,
  drawing,
  onAddPoint,
  onMovePoint,
  onSelectPolygon,
  onFinishDraft,
  textLabels = [],
  labelPlacementMode = false,
  selectedLabelId = null,
  onPlaceLabel,
  onMoveLabel,
  onSelectLabel,
  labels,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panMode, setPanMode] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [svgSize, setSvgSize] = useState({ w: 1, h: 1 });
  const dragRef = useRef<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });
  const pointDragRef = useRef<{
    index: number;
    pointerId: number;
    moved: boolean;
  } | null>(null);
  const labelDragRef = useRef<{
    id: string;
    pointerId: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const panning = panMode || spaceHeld;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" && !e.repeat) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        e.preventDefault();
        setSpaceHeld(true);
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "Space") setSpaceHeld(false);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = el!.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((prev) => {
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round((prev + delta) * 100) / 100));
        if (next === prev) return prev;
        setPan((p) => {
          const contentX = (cx - p.x) / prev;
          const contentY = (cy - p.y) / prev;
          return {
            x: cx - contentX * next,
            y: cy - contentY * next,
          };
        });
        return next;
      });
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const sync = () => {
      const rect = svg.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSvgSize({ w: rect.width, h: rect.height });
      }
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(svg);
    return () => ro.disconnect();
  }, [imageUrl, zoom]);

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function bumpZoom(dir: 1 | -1) {
    const el = containerRef.current;
    if (!el) {
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + dir * ZOOM_STEP)));
      return;
    }
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setZoom((prev) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round((prev + dir * ZOOM_STEP) * 100) / 100));
      if (next === prev) return prev;
      setPan((p) => {
        const contentX = (cx - p.x) / prev;
        const contentY = (cy - p.y) / prev;
        return { x: cx - contentX * next, y: cy - contentY * next };
      });
      return next;
    });
  }

  function pointerToPercent(clientX: number, clientY: number): PlanPoint | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return [Math.min(100, Math.max(0, x)), Math.min(100, Math.max(0, y))];
  }

  /** Circular on screen despite preserveAspectRatio=none. */
  function handleRadii(px: number) {
    return {
      rx: (px / Math.max(svgSize.w, 1)) * 100,
      ry: (px / Math.max(svgSize.h, 1)) * 100,
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    if (pointDragRef.current || labelDragRef.current) return;
    if (e.button === 1 || (e.button === 0 && panning)) {
      e.preventDefault();
      dragRef.current = { active: true, x: e.clientX, y: e.clientY };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const labelDrag = labelDragRef.current;
    if (labelDrag && onMoveLabel) {
      const pt = pointerToPercent(e.clientX, e.clientY);
      if (!pt) return;
      labelDrag.moved = true;
      onMoveLabel(labelDrag.id, pt);
      return;
    }
    const pointDrag = pointDragRef.current;
    if (pointDrag && onMovePoint) {
      const pt = pointerToPercent(e.clientX, e.clientY);
      if (!pt) return;
      pointDrag.moved = true;
      onMovePoint(pointDrag.index, pt);
      return;
    }
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current.x = e.clientX;
    dragRef.current.y = e.clientY;
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }

  function onPointerUp(e: React.PointerEvent) {
    const labelDrag = labelDragRef.current;
    if (labelDrag && labelDrag.pointerId === e.pointerId) {
      if (labelDrag.moved) suppressClickRef.current = true;
      labelDragRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      return;
    }
    const pointDrag = pointDragRef.current;
    if (pointDrag && pointDrag.pointerId === e.pointerId) {
      if (pointDrag.moved) suppressClickRef.current = true;
      pointDragRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      return;
    }
    if (dragRef.current.active) {
      dragRef.current.active = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
  }

  function onSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    if (panning || dragRef.current.active || pointDragRef.current || labelDragRef.current) return;
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (e.detail > 1) return;
    const pt = pointerToPercent(e.clientX, e.clientY);
    if (!pt) return;
    if (labelPlacementMode && onPlaceLabel) {
      onPlaceLabel(pt);
      return;
    }
    onAddPoint(pt);
  }

  function onSvgDoubleClick(e: React.MouseEvent<SVGSVGElement>) {
    e.preventDefault();
    e.stopPropagation();
    onFinishDraft?.();
  }

  function startLabelDrag(id: string, e: React.PointerEvent) {
    if (panning || !onMoveLabel) return;
    e.preventDefault();
    e.stopPropagation();
    labelDragRef.current = { id, pointerId: e.pointerId, moved: false };
    onSelectLabel?.(id);
    (containerRef.current as HTMLElement | null)?.setPointerCapture(e.pointerId);
  }

  function startPointDrag(index: number, e: React.PointerEvent) {
    if (panning || !onMovePoint) return;
    e.preventDefault();
    e.stopPropagation();
    pointDragRef.current = { index, pointerId: e.pointerId, moved: false };
    (containerRef.current as HTMLElement | null)?.setPointerCapture(e.pointerId);
  }

  const visible = handleRadii(HANDLE_PX);
  const hit = handleRadii(HANDLE_HIT_PX);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex overflow-hidden rounded-[5px] border border-[#E5E7EB] bg-white">
          <button
            type="button"
            title={labels.zoomOut}
            aria-label={labels.zoomOut}
            onClick={() => bumpZoom(-1)}
            disabled={zoom <= MIN_ZOOM}
            className="inline-flex h-9 w-9 items-center justify-center text-[#0c1428] hover:bg-[#F8F6F1] disabled:opacity-40"
          >
            <ZoomOut size={16} />
          </button>
          <span className="flex h-9 min-w-[3.25rem] items-center justify-center border-x border-[#E5E7EB] text-xs font-semibold tabular-nums text-[#0c1428]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            title={labels.zoomIn}
            aria-label={labels.zoomIn}
            onClick={() => bumpZoom(1)}
            disabled={zoom >= MAX_ZOOM}
            className="inline-flex h-9 w-9 items-center justify-center text-[#0c1428] hover:bg-[#F8F6F1] disabled:opacity-40"
          >
            <ZoomIn size={16} />
          </button>
        </div>
        <button
          type="button"
          title={labels.zoomReset}
          onClick={resetView}
          className="inline-flex h-9 items-center gap-1.5 rounded-[5px] border border-[#E5E7EB] bg-white px-2.5 text-xs font-semibold text-[#0c1428] hover:bg-[#F8F6F1]"
        >
          <RotateCcw size={14} /> {labels.zoomReset}
        </button>
        <button
          type="button"
          title={labels.panMode}
          onClick={() => setPanMode((v) => !v)}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-[5px] border px-2.5 text-xs font-semibold",
            panMode
              ? "border-[#c9a96e] bg-[#F8F6F1] text-[#0c1428]"
              : "border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8F6F1]",
          )}
        >
          <Hand size={14} /> {labels.panMode}
        </button>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "relative h-[min(70vh,560px)] overflow-hidden rounded-[5px] border border-[#E5E7EB] bg-[#FAFAF8]",
          panning ? "cursor-grab active:cursor-grabbing" : labelPlacementMode ? "cursor-cell" : "cursor-crosshair",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="absolute left-0 top-0 origin-top-left will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: "100%",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="block h-auto w-full select-none" draggable={false} />
          <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            onClick={onSvgClick}
            onDoubleClick={onSvgDoubleClick}
          >
            {polygons.map((poly) => (
              <polygon
                key={poly.id}
                points={pointsToSvg(poly.points)}
                pointerEvents={drawing ? "none" : "auto"}
                className={cn(
                  "stroke-[#0c1428] transition-opacity",
                  poly.active || hoveredId === poly.id ? "fill-[#c9a96e]/40" : "fill-[#c9a96e]/22",
                  poly.dimmed && !poly.active ? "opacity-40" : "",
                )}
                strokeWidth={poly.active ? 0.45 : 0.3}
                onMouseEnter={() => {
                  if (!drawing) setHoveredId(poly.id);
                }}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => {
                  if (drawing || panning) return;
                  e.stopPropagation();
                  onSelectPolygon?.(poly.id);
                }}
              />
            ))}
            {draft.length > 0 && (
              <>
                <polyline
                  points={pointsToSvg(draft)}
                  fill="none"
                  stroke="#c9a96e"
                  strokeWidth={0.35}
                  strokeDasharray="1.2 0.8"
                  pointerEvents="none"
                />
                {draft.length >= 3 && (
                  <polygon
                    points={pointsToSvg(draft)}
                    className="fill-[#c9a96e]/20"
                    stroke="none"
                    pointerEvents="none"
                  />
                )}
                {draft.map(([x, y], i) => (
                  <g key={i}>
                    {/* Larger invisible hit target for easier dragging */}
                    <ellipse
                      cx={x}
                      cy={y}
                      rx={hit.rx}
                      ry={hit.ry}
                      fill="transparent"
                      className={onMovePoint && !panning ? "cursor-move" : undefined}
                      onPointerDown={(e) => startPointDrag(i, e)}
                    />
                    <ellipse
                      cx={x}
                      cy={y}
                      rx={visible.rx}
                      ry={visible.ry}
                      fill="#c9a96e"
                      stroke="#fff"
                      strokeWidth={0.15}
                      pointerEvents="none"
                    />
                  </g>
                ))}
              </>
            )}
          </svg>
          {textLabels.map((lbl) => (
            <div
              key={lbl.id}
              className={cn(
                "absolute z-[6] -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap rounded-sm px-1.5 py-0.5 font-semibold uppercase tracking-wide",
                onMoveLabel && !panning ? "cursor-move" : "pointer-events-none",
                lbl.active || selectedLabelId === lbl.id ? "ring-2 ring-[#c9a96e] ring-offset-1" : "",
              )}
              style={{
                left: `${lbl.x}%`,
                top: `${lbl.y}%`,
                ...planTextLabelStyle(lbl),
              }}
              onPointerDown={(e) => startLabelDrag(lbl.id, e)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectLabel?.(lbl.id);
              }}
            >
              {lbl.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

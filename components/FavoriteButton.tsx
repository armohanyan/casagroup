"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

interface FavoriteButtonProps {
  apartmentId: string;
  className?: string;
  size?: number;
}

export function FavoriteButton({ apartmentId, className, size = 18 }: FavoriteButtonProps) {
  const [saved, setSaved] = useState(() => isFavorite(apartmentId));

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from favorites" : "Save to favorites"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved(toggleFavorite(apartmentId));
      }}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm border border-[#E7E0D5]/80 transition-all hover:scale-105 hover:border-[#c9a96e]/50",
        saved && "text-[#c9a96e] border-[#c9a96e]/40",
        className,
      )}
    >
      <Heart size={size} className={cn("transition-colors", saved && "fill-current")} />
    </button>
  );
}

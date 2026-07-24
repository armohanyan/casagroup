"use client";

import { useEffect, useState } from "react";
import { Phone, MessageCircle, Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format-price";

interface StickyInquiryBarProps {
  price: number;
  whatsappHref: string;
  sold?: boolean;
  onRequestCall?: () => void;
  onWhatsApp?: () => void;
  onBookViewing?: () => void;
}

export function StickyInquiryBar({
  price,
  sold,
  onRequestCall,
  onWhatsApp,
  onBookViewing,
}: StickyInquiryBarProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (sold || !visible) return null;

  return (
    <div
      className="fixed bottom-[4.5rem] inset-x-0 z-30 lg:hidden px-4 pointer-events-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="pointer-events-auto max-w-lg mx-auto flex items-center gap-2 bg-white/95 backdrop-blur-md border border-[#E7E0D5] rounded-xl shadow-lg p-2.5">
        <div className="min-w-0 flex-1 pl-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#A8A29E]">
            {t.aptDetail.priceLabel}
          </p>
          <p className="text-base font-bold text-[#1C1917] tabular-nums truncate">
            {formatPrice(price)}
          </p>
        </div>
        <button
          type="button"
          onClick={onRequestCall}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-white"
          aria-label={t.aptDetail.requestCall}
        >
          <Phone size={16} />
        </button>
        <button
          type="button"
          onClick={onWhatsApp}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white"
          aria-label="WhatsApp"
        >
          <MessageCircle size={16} />
        </button>
        <button
          type="button"
          onClick={onBookViewing}
          className="btn-primary h-10 px-3 text-xs rounded-lg shrink-0 type-button"
        >
          <Calendar size={14} />
          <span className="hidden xs:inline">{t.aptDetail.bookViewing}</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, ExternalLink, Menu, User } from "lucide-react";
import { ADMIN_BASE } from "@/components/admin/admin-config";
import { logoutAdmin } from "@/lib/api-client";

interface Props {
  onMenuClick: () => void;
  title?: string;
}

export function AdminTopbar({ onMenuClick, title }: Props) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(t)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function handleLogout() {
    logoutAdmin();
    router.push(`${ADMIN_BASE}/login`);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E8EAED] bg-white/90 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-[5px] text-[#6B7280] hover:bg-[#F3F4F6] lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <div className="min-w-0 flex-1">
        {title ? (
          <h1 className="truncate text-base font-semibold text-[#0c1428] sm:text-lg">{title}</h1>
        ) : (
          <p className="text-sm font-medium text-[#6B7280]">CasaGroup Admin</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-[5px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#0c1428] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#c9a96e]" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-[5px] border border-[#E8EAED] bg-white shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
              <div className="border-b border-[#F0F1F3] px-4 py-3 text-sm font-semibold text-[#0c1428]">
                Ծանուցումներ
              </div>
              <div className="px-4 py-6 text-center text-sm text-[#9CA3AF]">Նոր ծանուցումներ չկան</div>
            </div>
          )}
        </div>

        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-[5px] px-2.5 text-xs font-semibold text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#0c1428] transition-colors"
        >
          <ExternalLink size={14} />
          Կայք
        </Link>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-[5px] py-1 pl-1 pr-2 hover:bg-[#F3F4F6] transition-colors"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[5px] bg-[#0c1428] text-[#c9a96e]">
              <User size={15} />
            </span>
            <span className="hidden md:block text-left">
              <span className="block text-xs font-semibold text-[#0c1428]">Admin</span>
              <span className="block text-[10px] text-[#9CA3AF]">CasaGroup</span>
            </span>
            <ChevronDown size={14} className="hidden md:block text-[#9CA3AF]" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-[5px] border border-[#E8EAED] bg-white py-1 shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
              <button
                type="button"
                className="block w-full px-4 py-2.5 text-left text-sm text-[#6B7280] hover:bg-[#F9FAFB]"
                onClick={handleLogout}
              >
                Ելք
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

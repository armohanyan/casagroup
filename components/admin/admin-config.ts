import {
  LayoutDashboard,
  Building2,
  Home,
  MessageSquare,
  Image as ImageIcon,
  LogOut,
  type LucideIcon,
} from "lucide-react";

export const ADMIN_BASE = "/admin-lx9k2m";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: ADMIN_BASE, label: "Վահանակ", icon: LayoutDashboard, exact: true },
  { href: `${ADMIN_BASE}/projects`, label: "Նախագծեր", icon: Building2 },
  { href: `${ADMIN_BASE}/apartments`, label: "Բնակարաններ", icon: Home },
  { href: `${ADMIN_BASE}/inquiries`, label: "Հարցումներ", icon: MessageSquare },
  { href: `${ADMIN_BASE}/hero`, label: "Գլխավոր սլայդեր", icon: ImageIcon },
];

export const ADMIN_LOGOUT: AdminNavItem = {
  href: `${ADMIN_BASE}/login`,
  label: "Ելք",
  icon: LogOut,
};

/** Shared light-theme field classes matching public site. */
export const adminInputCls =
  "w-full h-11 rounded-[5px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#0c1428] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#0c1428] focus:ring-2 focus:ring-[#0c1428]/10";

export const adminSelectCls = `${adminInputCls} appearance-none cursor-pointer`;

export const adminTextareaCls =
  "w-full rounded-[5px] border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#0c1428] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#0c1428] focus:ring-2 focus:ring-[#0c1428]/10 resize-y min-h-[96px]";

export const adminCardCls =
  "rounded-[5px] border border-[#E8EAED] bg-white shadow-[0_1px_3px_rgba(12,20,40,0.04),0_4px_16px_rgba(12,20,40,0.06)]";

export const adminBtnPrimary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[5px] bg-[#0c1428] px-4 text-sm font-semibold text-white transition-all hover:bg-[#1F2937] active:scale-[0.98] disabled:opacity-50";

export const adminBtnSecondary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#0c1428] transition-all hover:border-[#0c1428] active:scale-[0.98]";

export const adminBtnAccent =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[5px] bg-[#c9a96e] px-4 text-sm font-semibold text-[#0c1428] transition-all hover:bg-[#d4b87a] active:scale-[0.98]";

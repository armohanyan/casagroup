"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ADMIN_BASE, ADMIN_LOGOUT, ADMIN_NAV, type AdminNavItem } from "@/components/admin/admin-config";
import { logoutAdmin } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

function NavLink({
  item,
  collapsed,
  active,
  onClick,
}: {
  item: AdminNavItem;
  collapsed: boolean;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-[5px] px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-[#0c1428] text-white shadow-sm"
          : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#0c1428]",
        collapsed && "justify-center px-2",
      )}
    >
      <Icon
        size={18}
        strokeWidth={1.75}
        className={cn("shrink-0", active ? "text-[#c9a96e]" : "text-current")}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {active && !collapsed && (
        <motion.span
          layoutId="admin-nav-accent"
          className="absolute right-2 h-1.5 w-1.5 rounded-full bg-[#c9a96e]"
        />
      )}
    </Link>
  );
}

export function AdminSidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(item: AdminNavItem) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  function handleLogout() {
    logoutAdmin();
    router.push(`${ADMIN_BASE}/login`);
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#E8EAED] bg-white transition-[width] duration-300 ease-out",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-[#E8EAED] px-4", collapsed ? "justify-center" : "justify-between")}>
        <Link href={ADMIN_BASE} className="min-w-0">
          {collapsed ? (
            <span className="font-brand text-lg text-[#0c1428]">
              C<span className="text-[#c9a96e]">G</span>
            </span>
          ) : (
            <span className="font-brand text-xl tracking-tight text-[#0c1428]">
              Casa<span className="text-[#c9a96e]">Group</span>
              <span className="ml-2 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
                Admin
              </span>
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-[5px] text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#0c1428] transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={onToggle}
          className="mx-auto mt-3 hidden lg:flex h-8 w-8 items-center justify-center rounded-[5px] text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#0c1428] transition-colors"
          aria-label="Expand sidebar"
        >
          <ChevronRight size={16} />
        </button>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            active={isActive(item)}
          />
        ))}
      </nav>

      <div className="border-t border-[#E8EAED] p-3">
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? ADMIN_LOGOUT.label : undefined}
          className={cn(
            "group relative flex w-full items-center gap-3 rounded-[5px] px-3 py-2.5 text-sm font-medium text-[#6B7280] transition-all duration-200 hover:bg-[#F3F4F6] hover:text-[#0c1428]",
            collapsed && "justify-center px-2",
          )}
        >
          <ADMIN_LOGOUT.icon size={18} strokeWidth={1.75} className="shrink-0" />
          {!collapsed && <span className="truncate">{ADMIN_LOGOUT.label}</span>}
        </button>
      </div>
    </aside>
  );
}

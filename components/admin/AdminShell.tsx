"use client";

import { useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminToastProvider } from "@/components/admin/AdminToast";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  title?: string;
}

export function AdminShell({ children, title }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AdminToastProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-[#0c1428]">
        <div className="hidden lg:block">
          <AdminSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((v) => !v)}
          />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-[#0c1428]/40 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative h-full w-[260px]">
              <AdminSidebar
                collapsed={false}
                onToggle={() => setMobileOpen(false)}
              />
            </div>
          </div>
        )}

        <div
          className={cn(
            "flex min-h-screen flex-col transition-[padding] duration-300 ease-out",
            collapsed ? "lg:pl-[72px]" : "lg:pl-[260px]",
          )}
          style={{ ["--admin-sidebar-w" as string]: collapsed ? "72px" : "260px" }}
        >
          <AdminTopbar
            onMenuClick={() => setMobileOpen(true)}
            title={title}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminToastProvider>
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { Seo } from "@/components/seo/Seo";
import { ADMIN_BASE } from "@/components/admin/admin-config";
import { getAdminToken } from "@/lib/api-client";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === `${ADMIN_BASE}/login`;
  const [ready, setReady] = useState(isLogin);

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    const token = getAdminToken();
    if (!token) {
      router.replace(`${ADMIN_BASE}/login`);
      return;
    }
    setReady(true);
  }, [isLogin, router, pathname]);

  if (isLogin) {
    return (
      <>
        <Seo
          title="CasaGroup Admin Login"
          description="CasaGroup admin"
          path={`${ADMIN_BASE}/login`}
          lang="hy"
          noindex
        />
        {children}
      </>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-sm text-[#6B7280]">
        Բեռնվում է…
      </div>
    );
  }

  return (
    <>
      <Seo
        title="CasaGroup Admin"
        description="CasaGroup content management"
        path="/admin-lx9k2m"
        lang="hy"
        noindex
      />
      <AdminShell>{children}</AdminShell>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_BASE, adminBtnPrimary, adminInputCls } from "@/components/admin/admin-config";
import { getAdminToken, loginAdmin } from "@/lib/api-client";
import { useEffect } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAdminToken()) router.replace(ADMIN_BASE);
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginAdmin(username.trim(), password);
      router.replace(ADMIN_BASE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Մուտքը ձախողվեց");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-[5px] border border-[#E8EAED] bg-white p-8 shadow-[0_8px_30px_rgba(12,20,40,0.08)]"
      >
        <h1 className="font-display text-2xl text-[#0c1428]">
          Casa<span className="text-[#c9a96e]">Group</span>
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">Ադմին մուտք</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
              Օգտանուն
            </label>
            <input
              className={adminInputCls}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
              Գաղտնաբառ
            </label>
            <input
              type="password"
              className={adminInputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button type="submit" className={`${adminBtnPrimary} mt-6 w-full`} disabled={loading}>
          {loading ? "Մուտք…" : "Մուտք"}
        </button>
      </form>
    </div>
  );
}

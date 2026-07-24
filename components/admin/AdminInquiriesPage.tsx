"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminToast } from "@/components/admin/AdminToast";
import {
  adminCardCls,
  adminBtnSecondary,
  adminSelectCls,
} from "@/components/admin/admin-config";
import {
  adminListInquiries,
  adminUpdateInquiry,
  type AdminInquiry,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  new: "Նոր",
  read: "Կարդացված",
  archived: "Արխիվ",
};

export function AdminInquiriesPage() {
  const { toast } = useAdminToast();
  const [items, setItems] = useState<AdminInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminListInquiries(filter || undefined);
      setItems(data);
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: string) {
    try {
      const updated = await adminUpdateInquiry(id, { status });
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      toast("Կարգավիճակը թարմացվեց");
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Հարցումներ"
        description="Կապի ձևեր և բնակարանի հարցումներ"
      />

      <div className="mb-4 flex items-center gap-3">
        <select
          className={cn(adminSelectCls, "max-w-[200px]")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Բոլորը</option>
          <option value="new">Նոր</option>
          <option value="read">Կարդացված</option>
          <option value="archived">Արխիվ</option>
        </select>
        <button type="button" className={adminBtnSecondary} onClick={() => void load()}>
          Թարմացնել
        </button>
      </div>

      <div className={cn(adminCardCls, "overflow-hidden")}>
        {loading ? (
          <p className="p-8 text-center text-sm text-[#9CA3AF]">Բեռնվում է…</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#9CA3AF]">Հարցումներ չկան</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#F0F1F3] bg-[#F9FAFB] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                <tr>
                  <th className="px-4 py-3">Ամսաթիվ</th>
                  <th className="px-4 py-3">Անուն</th>
                  <th className="px-4 py-3">Հեռախոս</th>
                  <th className="px-4 py-3">Նախագիծ</th>
                  <th className="px-4 py-3">Տեսակ</th>
                  <th className="px-4 py-3">Կարգավիճակ</th>
                  <th className="px-4 py-3">Հաղորդագրություն</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[#F0F1F3] align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-[#6B7280]">
                      {new Date(item.createdAt).toLocaleString("hy-AM")}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#0c1428]">{item.fullName}</td>
                    <td className="px-4 py-3">
                      <a href={`tel:${item.phone}`} className="text-[#0c1428] hover:underline">
                        {item.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{item.interestedProject || "—"}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{item.kind || "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        className={cn(adminSelectCls, "h-9 min-w-[120px]")}
                        value={item.status}
                        onChange={(e) => void setStatus(item.id, e.target.value)}
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="max-w-[280px] px-4 py-3 text-[#6B7280]">
                      <p className="line-clamp-3 whitespace-pre-wrap">{item.message || "—"}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

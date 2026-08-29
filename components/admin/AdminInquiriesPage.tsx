"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Settings2, Trash2, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminToast } from "@/components/admin/AdminToast";
import {
  adminCardCls,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInputCls,
  adminSelectCls,
  adminTextareaCls,
} from "@/components/admin/admin-config";
import {
  adminCreateLeadStatus,
  adminDeleteLeadStatus,
  adminListInquiries,
  adminListLeadStatuses,
  adminUpdateInquiry,
  adminUpdateLeadStatus,
  type AdminInquiry,
  type AdminLeadStatus,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";

type LeadForm = {
  fullName: string;
  phone: string;
  email: string;
  interestedProject: string;
  kind: string;
  status: string;
  message: string;
};

function toForm(item: AdminInquiry): LeadForm {
  return {
    fullName: item.fullName,
    phone: item.phone,
    email: item.email || "",
    interestedProject: item.interestedProject || "",
    kind: item.kind || "",
    status: item.status,
    message: item.message || "",
  };
}

export function AdminInquiriesPage() {
  const { toast } = useAdminToast();
  const [items, setItems] = useState<AdminInquiry[]>([]);
  const [statuses, setStatuses] = useState<AdminLeadStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<AdminInquiry | null>(null);
  const [form, setForm] = useState<LeadForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [showStatuses, setShowStatuses] = useState(false);
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);

  const activeStatuses = useMemo(
    () => statuses.filter((s) => s.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [statuses]
  );

  const loadStatuses = useCallback(async () => {
    const data = await adminListLeadStatuses();
    setStatuses(data);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data] = await Promise.all([
        adminListInquiries(filter || undefined),
        loadStatuses(),
      ]);
      setItems(data);
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setLoading(false);
    }
  }, [filter, loadStatuses, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  function openDetails(item: AdminInquiry) {
    setSelected(item);
    setForm(toForm(item));
  }

  function closeDetails() {
    setSelected(null);
    setForm(null);
  }

  async function setStatus(id: string, status: string) {
    try {
      const updated = await adminUpdateInquiry(id, { status });
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      if (selected?.id === id) {
        setSelected(updated);
        setForm(toForm(updated));
      }
      toast("Կարգավիճակը թարմացվեց");
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    }
  }

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !form) return;
    setSaving(true);
    try {
      const updated = await adminUpdateInquiry(selected.id, {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        interestedProject: form.interestedProject,
        kind: form.kind || null,
        status: form.status,
        message: form.message,
      });
      setItems((prev) => prev.map((i) => (i.id === selected.id ? updated : i)));
      setSelected(updated);
      setForm(toForm(updated));
      toast("Լիդի տվյալները պահպանվեցին");
    } catch (err) {
      toast(err instanceof Error ? err.message : String(err), "error");
    } finally {
      setSaving(false);
    }
  }

  async function addStatus() {
    const label = newStatusLabel.trim();
    if (!label) return;
    setStatusBusy(true);
    try {
      await adminCreateLeadStatus({ label });
      setNewStatusLabel("");
      await loadStatuses();
      toast("Կարգավիճակը ավելացվեց");
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setStatusBusy(false);
    }
  }

  async function saveStatus(status: AdminLeadStatus, patch: Partial<AdminLeadStatus>) {
    setStatusBusy(true);
    try {
      await adminUpdateLeadStatus(status.id, {
        label: patch.label ?? status.label,
        value: patch.value ?? status.value,
        sortOrder: patch.sortOrder ?? status.sortOrder,
        active: patch.active ?? status.active,
      });
      await loadStatuses();
      toast("Կարգավիճակը թարմացվեց");
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setStatusBusy(false);
    }
  }

  async function removeStatus(status: AdminLeadStatus) {
    if (!window.confirm(`Ջնջե՞լ «${status.label}» կարգավիճակը։`)) return;
    setStatusBusy(true);
    try {
      await adminDeleteLeadStatus(status.id);
      await loadStatuses();
      toast("Կարգավիճակը ջնջվեց");
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setStatusBusy(false);
    }
  }

  function statusLabel(value: string) {
    return statuses.find((s) => s.value === value)?.label || value;
  }

  return (
    <div>
      <AdminPageHeader
        title="Հարցումներ"
        description="Լիդերի տվյալներ և կարգավիճակներ"
        actions={
          <button
            type="button"
            className={adminBtnSecondary}
            onClick={() => setShowStatuses((v) => !v)}
          >
            <Settings2 className="h-4 w-4" />
            Կարգավիճակներ
          </button>
        }
      />

      {showStatuses && (
        <div className={cn(adminCardCls, "mb-6 p-5")}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#0c1428]">Լիդի կարգավիճակների սխեմա</h3>
              <p className="mt-1 text-xs text-[#6B7280]">
                Ավելացրեք, խմբագրեք կամ ապաակտիվացրեք կարգավիճակների տարբերակները
              </p>
            </div>
            <button type="button" className={adminBtnSecondary} onClick={() => setShowStatuses(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <input
              className={adminInputCls}
              placeholder="Նոր կարգավիճակի անուն"
              value={newStatusLabel}
              onChange={(e) => setNewStatusLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void addStatus();
                }
              }}
            />
            <button
              type="button"
              className={adminBtnPrimary}
              disabled={statusBusy || !newStatusLabel.trim()}
              onClick={() => void addStatus()}
            >
              <Plus className="h-4 w-4" />
              Ավելացնել
            </button>
          </div>

          <div className="space-y-3">
            {statuses
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((status) => (
                <div
                  key={status.id}
                  className="grid gap-2 rounded-[5px] border border-[#E8EAED] p-3 sm:grid-cols-[1fr_1fr_90px_auto] sm:items-center"
                >
                  <input
                    className={adminInputCls}
                    value={status.label}
                    disabled={statusBusy}
                    onChange={(e) =>
                      setStatuses((prev) =>
                        prev.map((s) => (s.id === status.id ? { ...s, label: e.target.value } : s))
                      )
                    }
                    onBlur={(e) => {
                      const next = e.target.value.trim();
                      if (next) void saveStatus(status, { label: next });
                    }}
                  />
                  <input
                    className={adminInputCls}
                    value={status.value}
                    disabled={statusBusy}
                    onChange={(e) =>
                      setStatuses((prev) =>
                        prev.map((s) =>
                          s.id === status.id ? { ...s, value: e.target.value.toLowerCase() } : s
                        )
                      )
                    }
                    onBlur={(e) => {
                      const next = e.target.value.trim().toLowerCase();
                      if (next) void saveStatus(status, { value: next });
                    }}
                  />
                  <input
                    type="number"
                    className={adminInputCls}
                    value={status.sortOrder}
                    disabled={statusBusy}
                    onChange={(e) =>
                      setStatuses((prev) =>
                        prev.map((s) =>
                          s.id === status.id ? { ...s, sortOrder: Number(e.target.value) || 0 } : s
                        )
                      )
                    }
                    onBlur={(e) => {
                      void saveStatus(status, { sortOrder: Number(e.target.value) || 0 });
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-[#6B7280]">
                      <input
                        type="checkbox"
                        checked={status.active}
                        disabled={statusBusy}
                        onChange={(e) => void saveStatus(status, { active: e.target.checked })}
                      />
                      Ակտիվ
                    </label>
                    <button
                      type="button"
                      className={cn(adminBtnSecondary, "h-9 px-2 text-red-600")}
                      disabled={statusBusy}
                      onClick={() => void removeStatus(status)}
                      title="Ջնջել"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <select
          className={cn(adminSelectCls, "max-w-[200px]")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Բոլորը</option>
          {activeStatuses.map((s) => (
            <option key={s.id} value={s.value}>
              {s.label}
            </option>
          ))}
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
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-[#F0F1F3] bg-[#F9FAFB] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                <tr>
                  <th className="px-4 py-3">Ամսաթիվ</th>
                  <th className="px-4 py-3">Անուն</th>
                  <th className="px-4 py-3">Հեռախոս</th>
                  <th className="px-4 py-3">Նախագիծ</th>
                  <th className="px-4 py-3">Տեսակ</th>
                  <th className="px-4 py-3">Կարգավիճակ</th>
                  <th className="px-4 py-3">Հաղորդագրություն</th>
                  <th className="px-4 py-3" />
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
                    <td className="px-4 py-3 text-[#6B7280]">{item.interestedProject || "-"}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{item.kind || "-"}</td>
                    <td className="px-4 py-3">
                      <select
                        className={cn(adminSelectCls, "h-9 min-w-[120px]")}
                        value={item.status}
                        onChange={(e) => void setStatus(item.id, e.target.value)}
                      >
                        {!activeStatuses.some((s) => s.value === item.status) && (
                          <option value={item.status}>{statusLabel(item.status)}</option>
                        )}
                        {activeStatuses.map((s) => (
                          <option key={s.id} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="max-w-[280px] px-4 py-3 text-[#6B7280]">
                      <p className="line-clamp-3 whitespace-pre-wrap">{item.message || "-"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className={cn(adminBtnSecondary, "h-9 px-3")}
                        onClick={() => openDetails(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Խմբագրել
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={cn(adminCardCls, "max-h-[90vh] w-full max-w-xl overflow-y-auto p-5")}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[#0c1428]">Լիդի մանրամասներ</h3>
                <p className="mt-1 text-xs text-[#6B7280]">
                  Խմբագրեք կարգավիճակը և մյուս դաշտերը
                </p>
              </div>
              <button type="button" className={adminBtnSecondary} onClick={closeDetails}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="space-y-3" onSubmit={(e) => void saveDetails(e)}>
              <Field label="Անուն">
                <input
                  className={adminInputCls}
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </Field>
              <Field label="Հեռախոս">
                <input
                  className={adminInputCls}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </Field>
              <Field label="Էլ. փոստ">
                <input
                  className={adminInputCls}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Նախագիծ">
                <input
                  className={adminInputCls}
                  value={form.interestedProject}
                  onChange={(e) => setForm({ ...form, interestedProject: e.target.value })}
                />
              </Field>
              <Field label="Տեսակ">
                <input
                  className={adminInputCls}
                  value={form.kind}
                  onChange={(e) => setForm({ ...form, kind: e.target.value })}
                />
              </Field>
              <Field label="Կարգավիճակ">
                <select
                  className={adminSelectCls}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {!activeStatuses.some((s) => s.value === form.status) && (
                    <option value={form.status}>{statusLabel(form.status)}</option>
                  )}
                  {activeStatuses.map((s) => (
                    <option key={s.id} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Հաղորդագրություն">
                <textarea
                  className={adminTextareaCls}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className={adminBtnSecondary} onClick={closeDetails}>
                  Փակել
                </button>
                <button type="submit" className={adminBtnPrimary} disabled={saving}>
                  {saving ? "Պահպանվում է…" : "Պահպանել"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-[#6B7280]">{label}</span>
      {children}
    </label>
  );
}

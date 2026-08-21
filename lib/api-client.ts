import type { Apartment, InquiryFormData, Project } from "@/types";
import { apiFetch, getApiUrl } from "@/lib/api";

const TOKEN_KEY = "casagroup_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export async function loginAdmin(username: string, password: string) {
  const data = await apiFetch<{ token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setAdminToken(data.token);
  return data.token;
}

export function logoutAdmin() {
  setAdminToken(null);
}

export async function fetchProjects(params?: Record<string, string | number | boolean | undefined>) {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    }
  }
  const q = qs.toString();
  return apiFetch<Project[]>(`/api/projects${q ? `?${q}` : ""}`);
}

export async function fetchProjectBySlug(slug: string) {
  return apiFetch<Project>(`/api/projects/${encodeURIComponent(slug)}`);
}

export async function fetchApartment(slug: string, id: string) {
  return apiFetch<{ project: Project; apartment: Apartment }>(
    `/api/projects/${encodeURIComponent(slug)}/apartments/${encodeURIComponent(id)}`
  );
}

export async function submitInquiry(
  data: InquiryFormData & { kind?: string }
) {
  return apiFetch<{ ok: boolean; id: string }>("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

function authHeaders() {
  const token = getAdminToken();
  if (!token) throw new Error("Not authenticated");
  return { token };
}

export async function adminListProjects() {
  return apiFetch<Project[]>("/api/admin/projects", authHeaders());
}

export async function adminGetProject(id: string) {
  return apiFetch<Project>(`/api/admin/projects/${id}`, authHeaders());
}

export async function adminCreateProject(data: Partial<Project>) {
  return apiFetch<Project>("/api/admin/projects", {
    method: "POST",
    body: JSON.stringify(data),
    ...authHeaders(),
  });
}

export async function adminUpdateProject(id: string, data: Partial<Project>) {
  return apiFetch<Project>(`/api/admin/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    ...authHeaders(),
  });
}

export async function adminDeleteProject(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/admin/projects/${id}`, {
    method: "DELETE",
    ...authHeaders(),
  });
}

export async function adminCreateApartment(projectId: string, data: Partial<Apartment>) {
  return apiFetch<Apartment>(`/api/admin/projects/${projectId}/apartments`, {
    method: "POST",
    body: JSON.stringify(data),
    ...authHeaders(),
  });
}

export async function adminUpdateApartment(
  projectId: string,
  aptId: string,
  data: Partial<Apartment>
) {
  return apiFetch<Apartment>(`/api/admin/projects/${projectId}/apartments/${aptId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    ...authHeaders(),
  });
}

export async function adminDeleteApartment(projectId: string, aptId: string) {
  return apiFetch<{ ok: boolean }>(`/api/admin/projects/${projectId}/apartments/${aptId}`, {
    method: "DELETE",
    ...authHeaders(),
  });
}

export type AdminInquiry = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  interestedProject: string;
  message: string;
  kind: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminDashboardStats = {
  projects: number;
  available: number;
  sold: number;
  reserved: number;
  inquiries: number;
  views: number;
  recentInquiries: Array<{
    id: string;
    fullName: string;
    phone: string;
    message: string;
    interestedProject: string;
    status: string;
    createdAt: string;
  }>;
};

export type AdminLeadStatus = {
  id: string;
  value: string;
  label: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function adminGetStats() {
  return apiFetch<AdminDashboardStats>("/api/admin/stats", authHeaders());
}

export async function adminListInquiries(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<AdminInquiry[]>(`/api/admin/inquiries${q}`, authHeaders());
}

export async function adminUpdateInquiry(
  id: string,
  data: {
    status?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    interestedProject?: string;
    message?: string;
    kind?: string | null;
  }
) {
  return apiFetch<AdminInquiry>(`/api/admin/inquiries/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    ...authHeaders(),
  });
}

export async function adminListLeadStatuses() {
  return apiFetch<AdminLeadStatus[]>("/api/admin/lead-statuses", authHeaders());
}

export async function adminCreateLeadStatus(data: {
  label: string;
  value?: string;
  sortOrder?: number;
  active?: boolean;
}) {
  return apiFetch<AdminLeadStatus>("/api/admin/lead-statuses", {
    method: "POST",
    body: JSON.stringify(data),
    ...authHeaders(),
  });
}

export async function adminUpdateLeadStatus(
  id: string,
  data: { label?: string; value?: string; sortOrder?: number; active?: boolean }
) {
  return apiFetch<AdminLeadStatus>(`/api/admin/lead-statuses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    ...authHeaders(),
  });
}

export async function adminDeleteLeadStatus(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/admin/lead-statuses/${id}`, {
    method: "DELETE",
    ...authHeaders(),
  });
}

export type HeroSlide = {
  id: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export async function fetchHeroSlides() {
  // Prefer /api/projects/_hero-slides — production nginx already proxies /api/projects to Express.
  // /api/hero-slides often hits Next only and fails (loop / bogus admin checks).
  try {
    return await apiFetch<HeroSlide[]>("/api/projects/_hero-slides");
  } catch {
    return apiFetch<HeroSlide[]>("/api/hero-slides");
  }
}

export async function adminListHeroSlides() {
  return apiFetch<HeroSlide[]>("/api/admin/hero-slides", authHeaders());
}

export async function adminCreateHeroSlide(imageUrl: string) {
  return apiFetch<HeroSlide>("/api/admin/hero-slides", {
    method: "POST",
    body: JSON.stringify({ imageUrl }),
    ...authHeaders(),
  });
}

export async function adminDeleteHeroSlide(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/admin/hero-slides/${id}`, {
    method: "DELETE",
    ...authHeaders(),
  });
}

export async function adminReorderHeroSlides(ids: string[]) {
  return apiFetch<HeroSlide[]>("/api/admin/hero-slides/reorder", {
    method: "PATCH",
    body: JSON.stringify({ ids }),
    ...authHeaders(),
  });
}

export async function adminUploadFile(file: File, projectId?: string) {
  const token = getAdminToken();
  if (!token) throw new Error("Not authenticated");
  const form = new FormData();
  form.append("file", file);
  if (projectId) form.append("projectId", projectId);
  const res = await fetch(getApiUrl("/api/admin/uploads"), {
    method: "POST",
    credentials: "omit",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    url?: string;
    jpegUrl?: string;
    hasAlpha?: boolean;
    posterUrl?: string | null;
    kind?: string;
    id?: string;
  };
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data as {
    id: string;
    kind: string;
    url: string;
    jpegUrl?: string;
    hasAlpha?: boolean;
    posterUrl?: string | null;
  };
}

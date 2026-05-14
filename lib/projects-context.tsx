import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Project } from "@/types";

interface ProjectsContextValue {
  projects: Project[];
  loading: boolean;
  loadError: string | null;
  refreshProjects: () => Promise<void>;
  addProject: (p: Omit<Project, "id" | "slug">) => Promise<Project>;
  updateProject: (id: string, p: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  getBySlug: (slug: string) => Project | undefined;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

async function readProjectsResponse(res: Response): Promise<Project[]> {
  const raw: unknown = await res.json();
  if (!res.ok) {
    const msg =
      typeof raw === "object" && raw !== null && "error" in raw && typeof (raw as { error: unknown }).error === "string"
        ? (raw as { error: string }).error
        : res.statusText;
    throw new Error(msg);
  }
  if (!Array.isArray(raw)) throw new Error("Invalid projects response");
  return raw as Project[];
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await readProjectsResponse(res);
      setProjects(data);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProjects();
  }, [refreshProjects]);

  const addProject = useCallback(
    async (data: Omit<Project, "id" | "slug">) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const raw: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof raw === "object" && raw !== null && "error" in raw && typeof (raw as { error: unknown }).error === "string"
            ? (raw as { error: string }).error
            : res.statusText;
        throw new Error(msg);
      }
      const project = raw as Project;
      await refreshProjects();
      return project;
    },
    [refreshProjects]
  );

  const updateProject = useCallback(
    async (id: string, data: Partial<Project>) => {
      const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const raw: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof raw === "object" && raw !== null && "error" in raw && typeof (raw as { error: unknown }).error === "string"
            ? (raw as { error: string }).error
            : res.statusText;
        throw new Error(msg);
      }
      await refreshProjects();
      return raw as Project;
    },
    [refreshProjects]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
      const raw: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof raw === "object" && raw !== null && "error" in raw && typeof (raw as { error: unknown }).error === "string"
            ? (raw as { error: string }).error
            : res.statusText;
        throw new Error(msg);
      }
      await refreshProjects();
    },
    [refreshProjects]
  );

  const getBySlug = useCallback(
    (slug: string) => projects.find((p) => p.slug === slug),
    [projects]
  );

  const value = useMemo(
    () => ({
      projects,
      loading,
      loadError,
      refreshProjects,
      addProject,
      updateProject,
      deleteProject,
      getBySlug,
    }),
    [projects, loading, loadError, refreshProjects, addProject, updateProject, deleteProject, getBySlug]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
}

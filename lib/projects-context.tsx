"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Project } from "@/types";
import {
  adminCreateProject,
  adminDeleteProject,
  adminUpdateProject,
  fetchProjects,
  getAdminToken,
} from "@/lib/api-client";

interface ProjectsContextValue {
  projects: Project[];
  loading: boolean;
  loadError: string | null;
  refreshProjects: () => Promise<void>;
  upsertProject: (project: Project) => void;
  addProject: (p: Omit<Project, "id" | "slug"> & { slug?: string }) => Promise<Project>;
  updateProject: (id: string, p: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  getBySlug: (slug: string) => Project | undefined;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
      // Keep whatever we already have - never swap real projects for mock seed data.
      // Detail pages fetch by slug independently when the list fails.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProjects();
  }, [refreshProjects]);

  const upsertProject = useCallback((project: Project) => {
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === project.id);
      if (idx === -1) return [project, ...prev];
      const next = [...prev];
      next[idx] = project;
      return next;
    });
  }, []);

  const addProject = useCallback(
    async (data: Omit<Project, "id" | "slug"> & { slug?: string }) => {
      if (!getAdminToken()) throw new Error("Admin login required");
      const project = await adminCreateProject(data);
      setProjects((prev) => [project, ...prev.filter((p) => p.id !== project.id)]);
      return project;
    },
    []
  );

  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    if (!getAdminToken()) throw new Error("Admin login required");
    const updated = await adminUpdateProject(id, data);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    if (!getAdminToken()) throw new Error("Admin login required");
    await adminDeleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getBySlug = useCallback(
    (slug: string) => projects.find((p) => p.slug === slug),
    [projects]
  );

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        loading,
        loadError,
        refreshProjects,
        upsertProject,
        addProject,
        updateProject,
        deleteProject,
        getBySlug,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
}

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Project } from "../types";
import { MOCK_PROJECTS } from "../data/mock";
import { loadCustomProjects, saveCustomProjects, generateId, generateSlug } from "./store";

interface ProjectsContextValue {
  projects: Project[];
  customProjects: Project[];
  addProject: (p: Omit<Project, "id" | "slug">) => Project;
  updateProject: (id: string, p: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getBySlug: (slug: string) => Project | undefined;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [customProjects, setCustomProjects] = useState<Project[]>(() => loadCustomProjects());

  // Persist whenever custom projects change
  useEffect(() => {
    saveCustomProjects(customProjects);
  }, [customProjects]);

  const projects = [...MOCK_PROJECTS, ...customProjects];

  const addProject = useCallback((data: Omit<Project, "id" | "slug">): Project => {
    const id = generateId();
    const slug = generateSlug(data.title) || id;
    const project: Project = { ...data, id, slug };
    setCustomProjects((prev) => [...prev, project]);
    return project;
  }, []);

  const updateProject = useCallback((id: string, data: Partial<Project>) => {
    setCustomProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...data, slug: data.title ? generateSlug(data.title) || p.slug : p.slug }
          : p
      )
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    setCustomProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getBySlug = useCallback(
    (slug: string) => projects.find((p) => p.slug === slug),
    [projects]
  );

  return (
    <ProjectsContext.Provider value={{ projects, customProjects, addProject, updateProject, deleteProject, getBySlug }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
}

"use client";

import { I18nProvider } from "@/lib/i18n";
import { ProjectsProvider } from "@/lib/projects-context";

interface ProviderProps {
  children: React.ReactNode;
}

export function Provider({ children }: ProviderProps) {
  return (
    <ProjectsProvider>
      <I18nProvider>{children}</I18nProvider>
    </ProjectsProvider>
  );
}

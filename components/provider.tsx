"use client";

import { I18nProvider, type Lang } from "@/lib/i18n";
import { ProjectsProvider } from "@/lib/projects-context";

interface ProviderProps {
  children: React.ReactNode;
  initialLang?: Lang;
}

export function Provider({ children, initialLang }: ProviderProps) {
  return (
    <ProjectsProvider>
      <I18nProvider initialLang={initialLang}>{children}</I18nProvider>
    </ProjectsProvider>
  );
}

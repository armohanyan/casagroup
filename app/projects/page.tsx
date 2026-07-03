import { Suspense } from "react";
import ProjectsPage from "@/components/pages/projects-page";

export default function Page() {
  return (
    <Suspense fallback={<main className="bg-[#F9FAFB] min-h-screen pt-header" />}>
      <ProjectsPage />
    </Suspense>
  );
}

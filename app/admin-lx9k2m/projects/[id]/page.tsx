"use client";

import { useParams } from "next/navigation";
import { AdminProjectEditor } from "@/components/admin/AdminProjectEditor";

export default function AdminEditProjectPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : undefined;
  return <AdminProjectEditor projectId={id} />;
}

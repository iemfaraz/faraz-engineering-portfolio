import { createFileRoute } from "@tanstack/react-router";
import ProjectCoversManager from "@/components/admin/ProjectCoversManager";

export const Route = createFileRoute("/_authed/admin/covers")({
  head: () => ({ meta: [{ title: "Project covers" }] }),
  component: ProjectCoversManager,
});
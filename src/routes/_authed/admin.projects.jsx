import { createFileRoute } from "@tanstack/react-router";
import ProjectsManager from "@/components/admin/ProjectsManager";

export const Route = createFileRoute("/_authed/admin/projects")({
  head: () => ({ meta: [{ title: "Projects" }] }),
  component: ProjectsManager,
});
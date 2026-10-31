import { createFileRoute } from "@tanstack/react-router";
import ProjectVideosManager from "@/components/admin/ProjectVideosManager";

export const Route = createFileRoute("/_authed/admin/videos")({
  head: () => ({ meta: [{ title: "Project videos" }] }),
  component: ProjectVideosManager,
});
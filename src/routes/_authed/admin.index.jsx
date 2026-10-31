import { createFileRoute } from "@tanstack/react-router";
import VideoManager from "@/components/admin/VideoManager";

export const Route = createFileRoute("/_authed/admin/")({
  component: VideoManager,
});
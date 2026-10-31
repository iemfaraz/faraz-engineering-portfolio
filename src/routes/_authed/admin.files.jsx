import { createFileRoute } from "@tanstack/react-router";
import FilesManager from "@/components/admin/FilesManager";

export const Route = createFileRoute("/_authed/admin/files")({
  component: FilesManager,
});
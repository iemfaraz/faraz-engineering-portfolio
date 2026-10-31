import { createFileRoute } from "@tanstack/react-router";
import DrawingsManager from "@/components/admin/DrawingsManager";

export const Route = createFileRoute("/_authed/admin/drawings")({
  component: DrawingsManager,
});
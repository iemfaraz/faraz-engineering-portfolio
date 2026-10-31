import { createFileRoute } from "@tanstack/react-router";
import SectionEditor from "@/components/admin/SectionEditor";

export const Route = createFileRoute("/_authed/admin/sections")({
  component: SectionEditor,
});
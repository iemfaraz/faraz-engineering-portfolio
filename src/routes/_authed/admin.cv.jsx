import { createFileRoute } from "@tanstack/react-router";
import CvManager from "@/components/admin/CvManager";

export const Route = createFileRoute("/_authed/admin/cv")({
  head: () => ({ meta: [{ title: "CV" }] }),
  component: CvManager,
});
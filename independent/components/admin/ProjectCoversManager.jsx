import { useState } from "react";
import { toast } from "sonner";
import { portfolioApi as base44 } from "@/lib/portfolio-api";
import { useMedia } from "@/components/portfolio/MediaProvider";
import { useLang } from "@/components/portfolio/LanguageProvider";
import { useProjects } from "@/components/portfolio/ProjectsProvider";
import ProjectCoverRow from "@/components/admin/ProjectCoverRow";

export default function ProjectCoversManager() {
  const { c } = useLang();
  const { items } = useProjects();
  const { projectCovers, refreshMedia } = useMedia();
  const [busySlug, setBusySlug] = useState("");

  async function handleUpload(project, file, index) {
    setBusySlug(project.slug);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      const existing = projectCovers[project.slug];
      if (existing) {
        await base44.entities.MediaItem.update(existing.id, { url: file_url });
      } else {
        await base44.entities.MediaItem.create({
          kind: "project_cover",
          slug: project.slug,
          title: project.title,
          url: file_url,
          order: index,
        });
      }
      await refreshMedia();
      toast.success("Cover updated");
    } catch (error) {
      toast.error(error?.message ?? "That upload did not go through.");
    } finally {
      setBusySlug("");
    }
  }

  async function handleRemove(project) {
    const existing = projectCovers[project.slug];
    if (!existing) return;
    if (!window.confirm(`Remove the cover photo for “${project.title}”?`)) return;
    setBusySlug(project.slug);
    try {
      await base44.entities.MediaItem.delete(existing.id);
      await refreshMedia();
      toast.success("Cover removed");
    } catch (error) {
      toast.error(error?.message ?? "That did not go through.");
    } finally {
      setBusySlug("");
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="display text-[clamp(1.9rem,4vw,2.8rem)]">Project covers</h1>
      <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted-foreground">
        Upload a photo for a project and it replaces the drawing plate on its card and its page. Projects without a
        photo keep the plate.
      </p>

      <div className="mt-8 border border-border bg-card">
        {items.map((project, index) => (
          <ProjectCoverRow
            key={project.slug}
            project={project}
            cover={projectCovers[project.slug]}
            busy={busySlug === project.slug}
            onUpload={(file) => handleUpload(project, file, index)}
            onRemove={() => handleRemove(project)}
          />
        ))}
      </div>

      <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
        Uploaded photos are stored publicly — anyone with the link can open them.
      </p>
    </div>
  );
}
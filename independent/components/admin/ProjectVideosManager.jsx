import { useState } from "react";
import { toast } from "sonner";
import { portfolioApi as base44 } from "@/lib/portfolio-api";
import { useMedia } from "@/components/portfolio/MediaProvider";
import { useLang } from "@/components/portfolio/LanguageProvider";
import { useProjects } from "@/components/portfolio/ProjectsProvider";
import ProjectVideoRow from "@/components/admin/ProjectVideoRow";

export default function ProjectVideosManager() {
  const { c } = useLang();
  const { items } = useProjects();
  const { projectVideos, refreshMedia } = useMedia();
  const [busySlug, setBusySlug] = useState("");

  async function saveUrl(project, index, url) {
    setBusySlug(project.slug);
    try {
      const existing = projectVideos[project.slug];
      if (existing) {
        await base44.entities.MediaItem.update(existing.id, { url });
      } else {
        await base44.entities.MediaItem.create({
          kind: "project_video",
          slug: project.slug,
          title: project.title,
          url,
          order: index,
        });
      }
      await refreshMedia();
      toast.success("Project video saved");
    } catch (error) {
      toast.error(error?.message ?? "That did not go through.");
    } finally {
      setBusySlug("");
    }
  }

  async function uploadVideo(project, index, file) {
    setBusySlug(project.slug);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      const existing = projectVideos[project.slug];
      if (existing) {
        await base44.entities.MediaItem.update(existing.id, { url: file_url });
      } else {
        await base44.entities.MediaItem.create({
          kind: "project_video",
          slug: project.slug,
          title: project.title,
          url: file_url,
          order: index,
        });
      }
      await refreshMedia();
      toast.success("Project video uploaded");
    } catch (error) {
      toast.error(error?.message ?? "That upload did not go through.");
    } finally {
      setBusySlug("");
    }
  }

  async function removeVideo(project) {
    const existing = projectVideos[project.slug];
    if (!existing) return;
    if (!window.confirm(`Remove the video for “${project.title}”?`)) return;
    setBusySlug(project.slug);
    try {
      await base44.entities.MediaItem.delete(existing.id);
      await refreshMedia();
      toast.success("Video removed");
    } catch (error) {
      toast.error(error?.message ?? "That did not go through.");
    } finally {
      setBusySlug("");
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="display text-[clamp(1.9rem,4vw,2.8rem)]">Project videos</h1>
      <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-muted-foreground">
        Add one video to any project — upload a file or paste a YouTube, LinkedIn or direct .mp4 link. It plays on the
        project page and appears in the film section.
      </p>

      <div className="mt-8 border border-border bg-card">
        {items.map((project, index) => (
          <ProjectVideoRow
            key={project.slug}
            project={project}
            media={projectVideos[project.slug]}
            busy={busySlug === project.slug}
            onSave={(url) => saveUrl(project, index, url)}
            onUpload={(file) => uploadVideo(project, index, file)}
            onRemove={() => removeVideo(project)}
          />
        ))}
      </div>

      <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
        Uploaded files are stored publicly — anyone with the link can open them.
      </p>
    </div>
  );
}
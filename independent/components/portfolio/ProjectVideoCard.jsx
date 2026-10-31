import { Play } from "lucide-react";
import ProjectPlate from "@/components/portfolio/ProjectPlate";

const isFile = (url) => /\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i.test(url ?? "");

export default function ProjectVideoCard({ project, media, watchLabel, className = "" }) {
  if (!media?.url) return null;

  return (
    <article className={`flex flex-col border border-border bg-card ${className}`}>
      {isFile(media.url) ? (
        <video className="aspect-video w-full bg-black" src={media.url} controls playsInline preload="metadata" />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center border-b border-border bg-secondary p-6">
          <ProjectPlate category={project.cat} label={`NO. ${project.no}`} className="h-auto w-full max-w-[180px] text-foreground/60" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="micro">
          {project.no} — {project.catLabel}
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{project.title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{project.summary}</p>
        {!isFile(media.url) ? (
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center gap-2 pt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-primary"
          >
            <Play className="h-3 w-3" />
            {watchLabel}
          </a>
        ) : null}
      </div>
    </article>
  );
}
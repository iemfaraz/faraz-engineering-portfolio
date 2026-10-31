import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import ProjectPlate from "@/components/portfolio/ProjectPlate";
import { Image } from "@/components/ui/image";

export default function ProjectCard({ project, viewLabel, cover }) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="group flex w-[80vw] flex-none snap-start flex-col border border-border bg-card transition-colors duration-500 hover:border-foreground/40 sm:w-[320px] lg:w-[300px]"
    >
      <div className="relative aspect-[4/5] overflow-hidden border-b border-border bg-secondary text-foreground/70 transition-colors duration-500 group-hover:text-primary">
        {cover ? (
          <Image
            src={cover}
            alt={project.title}
            fittingType="fill"
            className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <ProjectPlate category={project.cat} label={`NO. ${project.no}`} className="h-full w-full p-4" />
        )}
        <span className="absolute end-4 top-4 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground">
          {project.no}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{project.catLabel}</div>
        <h3 className="mt-2 font-display text-base font-semibold leading-snug transition-colors group-hover:text-primary">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-muted-foreground">{project.summary}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-5">
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="tag !px-2 !py-0.5 !text-[9px]">
                {tag}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.14em] text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {viewLabel}
            <ArrowUpRight className="h-3 w-3 rtl:-scale-x-100" />
          </span>
        </div>
      </div>
    </Link>
  );
}
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";
import SectionHead from "@/components/portfolio/SectionHead";
import ProjectCard from "@/components/portfolio/ProjectCard";
import { useLang } from "@/components/portfolio/LanguageProvider";
import { useMedia } from "@/components/portfolio/MediaProvider";
import { useProjects } from "@/components/portfolio/ProjectsProvider";

export default function Projects() {
  const { c } = useLang();
  const { projectCovers } = useMedia();
  const { projects } = c;
  const { items } = useProjects();
  const [filter, setFilter] = useState("all");
  const stripRef = useRef(null);

  const shown = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.cat === filter)),
    [filter, items],
  );

  const scroll = (direction) => {
    const node = stripRef.current;
    if (!node) return;
    const amount = node.clientWidth * 0.8 * direction;
    node.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section id="projects" className="scroll-mt-28 border-t border-border bg-secondary/40 py-24 md:py-32">
      <div className="shell">
        <SectionHead
          kicker={projects.kicker}
          title={projects.title}
          sub={projects.sub}
          aside={
            <div className="flex items-center gap-2">
              <span className="micro">
                {String(shown.length).padStart(2, "0")} {c.ui.shown}
              </span>
            </div>
          }
        />

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {projects.filters.map((option) => {
              const active = filter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilter(option.id)}
                  className={`whitespace-nowrap border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/20 text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label={c.ui.prevProject}
              className="grid h-9 w-9 place-items-center border border-foreground/20 transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
            >
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label={c.ui.nextProject}
              className="grid h-9 w-9 place-items-center border border-foreground/20 transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
            >
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </button>
          </div>
        </div>

        <div
          ref={stripRef}
          className="no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:-mx-10 md:px-10"
        >
          {shown.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              viewLabel={c.ui.viewProject}
              cover={projectCovers[project.slug]?.url}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
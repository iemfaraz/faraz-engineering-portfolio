'use client';
import { Link } from "@/lib/router-compat";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Nav from "@/components/portfolio/Nav";
import Contact from "@/components/portfolio/Contact";
import Reveal from "@/components/portfolio/Reveal";
import ProjectPlate from "@/components/portfolio/ProjectPlate";
import ProjectVideoCard from "@/components/portfolio/ProjectVideoCard";
import { useLang } from "@/components/portfolio/LanguageProvider";
import { useMedia } from "@/components/portfolio/MediaProvider";
import { useProjects } from "@/components/portfolio/ProjectsProvider";
import { Image } from "@/components/ui/image";

export default function ProjectDetail({ slug }) {
  const { c, isRtl } = useLang();
  const { projectCovers, projectVideos, projectFiles = [] } = useMedia();
  const items = useProjects().items;
  const index = items.findIndex((item) => item.slug === slug);
  const project = items[index];
  const facts = c.detail.facts;

  if (!project) {
    return (
      <>
        <Nav />
        <main className="shell flex min-h-[60vh] flex-col justify-center py-32">
          <p className="micro">{c.projects.kicker}</p>
          <h1 className="display mt-6 text-4xl">{c.detail.ctaTitle}</h1>
          <Link to="/" className="btn-line mt-8 self-start">
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            {c.ui.allProjects}
          </Link>
        </main>
      </>
    );
  }

  const prev = items[(index - 1 + items.length) % items.length];
  const next = items[(index + 1) % items.length];
  const rows = [
    [facts.engagement, project.engagement],
    [facts.office, project.office],
    [facts.period, project.period],
    [facts.disciplines, project.disciplines.join(" · ")],
    [facts.standards, project.standards.join(" · ")],
  ];

  return (
    <>
      <Nav />
      <main>
        <section className="relative overflow-hidden pt-28 md:pt-36">
          <div className="pointer-events-none absolute inset-0 bp-grid opacity-50" aria-hidden="true" />
          <div className="shell relative">
            <Link to="/" className="ink-link font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              {c.ui.allProjects}
            </Link>

            <div className="mt-10 grid gap-10 md:grid-cols-12">
              <div className="md:col-span-7">
                <div className="micro">
                  {project.no} — {project.catLabel}
                </div>
                <h1 className="display mt-5 text-[clamp(2rem,5.6vw,3.8rem)] text-balance">{project.title}</h1>
                <p className="mt-6 max-w-[56ch] text-[17px] leading-relaxed text-muted-foreground">{project.summary}</p>
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-5">
                <div className="border border-border bg-card p-4">
                  {projectCovers[project.slug]?.url ? (
                    <Image
                      src={projectCovers[project.slug].url}
                      alt={project.title}
                      fittingType="fill"
                      className="aspect-[4/5] w-full"
                    />
                  ) : (
                    <ProjectPlate
                      category={project.cat}
                      label={`NO. ${project.no}`}
                      className="h-auto w-full text-foreground/70"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {projectVideos[project.slug]?.url ? (
          <section className="border-y border-border bg-secondary/40 py-12 md:py-16">
            <div className="shell">
              <div className="micro">{c.detail.film}</div>
              <div className="mt-5 max-w-3xl">
                <ProjectVideoCard
                  project={project}
                  media={projectVideos[project.slug]}
                  watchLabel={c.films.watch}
                />
              </div>
            </div>
          </section>
        ) : null}

        <section className="py-20 md:py-28">
          <div className="shell grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <Reveal>
                <div className="micro">—</div>
                <dl className="mt-5 border-t border-border">
                  {rows.map(([label, value]) => (
                    <div key={label} className="grid grid-cols-3 gap-4 border-b border-border py-3.5">
                      <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{label}</dt>
                      <dd className="col-span-2 text-[14px] leading-snug">{value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            <div className="md:col-span-7">
              <Reveal>
                <h2 className="font-display text-xl font-semibold uppercase tracking-[-0.02em]">{c.detail.scope}</h2>
                <ul className="mt-6 space-y-4">
                  {project.scope.map((line, i) => (
                    <li key={line} className="flex gap-4 border-t border-border pt-4 text-[15.5px] leading-relaxed">
                      <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/40">
          <div className="shell grid gap-px sm:grid-cols-2">
            <Link to="/projects/$slug" params={{ slug: prev.slug }} className="group flex items-center gap-4 bg-background py-8 pe-6 transition-colors hover:bg-card">
              <ArrowLeft className="h-4 w-4 flex-none text-muted-foreground transition-colors group-hover:text-primary rtl:rotate-180" />
              <span>
                <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  {c.ui.prevProject}
                </span>
                <span className="mt-1 block font-display text-[15px] font-semibold leading-snug">{prev.title}</span>
              </span>
            </Link>
            <Link
              to="/projects/$slug"
              params={{ slug: next.slug }}
              className="group flex items-center justify-end gap-4 border-t border-border bg-background py-8 ps-6 text-end transition-colors hover:bg-card sm:border-s sm:border-t-0"
            >
              <span>
                <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                  {c.ui.nextProject}
                </span>
                <span className="mt-1 block font-display text-[15px] font-semibold leading-snug">{next.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 flex-none text-muted-foreground transition-colors group-hover:text-primary rtl:rotate-180" />
            </Link>
          </div>
        </section>

        {projectFiles.some(f => f.slug === slug) && <section className="shell pb-16"><h2 className="font-display text-xl font-semibold">{isRtl ? 'ملفات المشروع' : 'Project files'}</h2><div className="mt-5 grid gap-3">{projectFiles.filter(f=>f.slug===slug).map(f=><a key={f.id} className="btn-line justify-start" href={f.url} target="_blank" rel="noopener noreferrer">{f.title || 'Download file'} ↗</a>)}</div></section>}
        <Contact />
      </main>
    </>
  );
}
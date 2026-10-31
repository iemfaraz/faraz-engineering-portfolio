import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/portfolio/Reveal";
import SectionHead from "@/components/portfolio/SectionHead";
import ProjectPlate from "@/components/portfolio/ProjectPlate";
import ProjectVideoCard from "@/components/portfolio/ProjectVideoCard";
import { useLang } from "@/components/portfolio/LanguageProvider";
import { useMedia } from "@/components/portfolio/MediaProvider";

export default function Films() {
  const { c } = useLang();
  const { introVideo, projectVideos } = useMedia();
  const { films } = c;
  const videos = c.projects.items.filter((project) => projectVideos[project.slug]?.url);
  const first = videos[0];

  return (
    <section id="films" className="scroll-mt-28 py-24 md:py-32">
      <div className="shell">
        <SectionHead kicker={films.kicker} title={films.title} sub={films.sub} />

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="border border-border bg-card">
              {introVideo ? (
                <video
                  className="aspect-video w-full bg-black"
                  src={introVideo.url}
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-secondary">
                  <span className="micro">{films.introLabel}</span>
                </div>
              )}
              <div className="border-t border-border p-6">
                <div className="micro">{films.introLabel}</div>
                <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{films.introTitle}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{films.introBody}</p>
              </div>
            </div>
          </Reveal>

          {first ? (
            <Reveal delay={120} className="lg:col-span-5">
              <ProjectVideoCard
                project={first}
                media={projectVideos[first.slug]}
                watchLabel={films.watch}
                className="h-full"
              />
            </Reveal>
          ) : (
            <Reveal delay={120} className="lg:col-span-5">
            <div className="flex h-full flex-col border border-border bg-card">
              <div className="flex items-center justify-center border-b border-border bg-background p-8">
                <ProjectPlate category="light" label="SIM · PADEL HALL" className="h-auto w-full max-w-[190px] text-foreground/70" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="micro">{films.clipLabel}</div>
                <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{films.clipTitle}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{films.clipBody}</p>
                <a
                  href="https://www.linkedin.com/in/faraz-nawaz-409294269/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-2 pt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-primary"
                >
                  {films.clipNote}
                  <ArrowUpRight className="h-3 w-3 rtl:-scale-x-100" />
                </a>
              </div>
            </div>
            </Reveal>
          )}
        </div>

        {videos.length > 1 ? (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {videos.slice(1).map((project) => (
              <Reveal key={project.slug}>
                <ProjectVideoCard
                  project={project}
                  media={projectVideos[project.slug]}
                  watchLabel={films.watch}
                  className="h-full"
                />
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
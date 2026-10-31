import Reveal from "@/components/portfolio/Reveal";
import SectionHead from "@/components/portfolio/SectionHead";
import { useLang } from "@/components/portfolio/LanguageProvider";

export default function Experience() {
  const { c } = useLang();
  const { experience } = c;

  return (
    <section id="experience" className="scroll-mt-28 border-t border-border bg-secondary/40 py-24 md:py-32">
      <div className="shell">
        <SectionHead kicker={experience.kicker} title={experience.title} sub={experience.sub} />

        <div className="mt-14">
          {experience.jobs.map((job, i) => (
            <Reveal key={job.title} delay={i * 80} className="grid gap-6 border-t border-border py-9 md:grid-cols-12 md:gap-10">
              <div className="md:col-span-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{job.period}</div>
                <div className="mt-2 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-primary">
                  <span className="h-1.5 w-1.5 bg-primary" />
                  {job.mode}
                </div>
              </div>

              <div className="md:col-span-9">
                <h3 className="font-display text-lg font-semibold leading-snug md:text-[22px]">{job.title}</h3>
                <div className="mt-1.5 text-[15px] text-muted-foreground">{job.company}</div>

                <ul className="mt-5 space-y-2.5">
                  {job.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-[15px] leading-relaxed">
                      <span className="mt-2 h-1 w-1 flex-none bg-foreground/40" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {job.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>

                {job.project ? (
                  <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    ▸ {job.project}
                  </div>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
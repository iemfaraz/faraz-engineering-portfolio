import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/portfolio/Reveal";
import SectionHead from "@/components/portfolio/SectionHead";
import { useLang } from "@/components/portfolio/LanguageProvider";

const PROFILE = "https://www.linkedin.com/in/faraz-nawaz-409294269/";

export default function LinkedIn() {
  const { c } = useLang();
  const { linkedin } = c;

  return (
    <section id="linkedin" className="scroll-mt-28 border-t border-border py-24 md:py-32">
      <div className="shell">
        <SectionHead
          kicker={linkedin.kicker}
          title={linkedin.title}
          sub={linkedin.sub}
          aside={
            <a href={PROFILE} target="_blank" rel="noopener noreferrer" className="ink-link">
              {linkedin.handle}
              <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
            </a>
          }
        />

        <div className="mt-14 grid gap-4 md:grid-cols-12">
          <Reveal className="flex flex-col justify-between border border-border bg-card p-7 md:col-span-5 md:p-9">
            <div className="flex items-start justify-between">
              <span className="font-display text-2xl font-bold tracking-tight text-primary">in</span>
              <span className="micro">{linkedin.updateLabel}</span>
            </div>
            <a
              href={PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 self-start border border-foreground px-5 py-3 font-display text-[12px] font-medium uppercase tracking-[0.12em] transition-colors hover:bg-foreground hover:text-background"
            >
              {linkedin.cta}
              <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
            </a>
          </Reveal>

          <Reveal delay={100} className="border border-border bg-card p-7 md:col-span-7 md:p-9">
            <div className="flex items-center justify-between gap-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {linkedin.update.date}
              </div>
              <span className="h-px flex-1 bg-border" />
            </div>
            <p className="mt-5 text-[16px] leading-relaxed">{linkedin.update.body}</p>
            <a
              href="https://lnkd.in/p/dtvMVs2h"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-primary"
            >
              {linkedin.update.link}
              <ArrowUpRight className="h-3 w-3 rtl:-scale-x-100" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
import Reveal from "@/components/portfolio/Reveal";
import SectionHead from "@/components/portfolio/SectionHead";
import { useLang } from "@/components/portfolio/LanguageProvider";
import { ArrowRight } from "lucide-react";

export default function Profile() {
  const { c } = useLang();
  const { profile } = c;

  return (
    <section id="profile" className="scroll-mt-28 py-24 md:py-32">
      <div className="shell">
        <SectionHead
          kicker={profile.kicker}
          title={profile.title}
          sub={profile.sub}
          aside={
            <ul className="space-y-0">
              {profile.registry.map((item) => (
                <li key={item} className="border-t border-border py-2.5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.1em] text-muted-foreground first:border-t-0">
                  {item}
                </li>
              ))}
            </ul>
          }
        >
          <div className="border-t border-border pt-6 text-[16.5px] leading-relaxed">
            <p>{profile.p1}</p>
            <p className="mt-5 text-muted-foreground">{profile.p2}</p>
          </div>
        </SectionHead>

        <div className="relative mt-14 grid border border-border bg-card md:mt-16 md:grid-cols-2">
          {[profile.dual.design, profile.dual.site].map((panel, i) => (
            <Reveal
              key={panel.code}
              delay={i * 120}
              className={`p-7 md:p-10 ${i === 1 ? "border-t border-border md:border-s md:border-t-0" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="micro">{panel.label}</div>
                  <h3 className="mt-4 font-display text-xl font-semibold leading-snug md:text-2xl">{panel.title}</h3>
                </div>
                <span className="font-display text-3xl font-bold text-border md:text-4xl">{panel.code}</span>
              </div>

              <p className="mt-5 text-[15.5px] leading-relaxed text-muted-foreground md:text-base">{panel.body}</p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {panel.steps.map((step, index) => (
                  <span key={step} className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em]">
                    {index > 0 ? <ArrowRight className="h-3 w-3 text-primary rtl:rotate-180" /> : null}
                    {step}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-1.5">
                {panel.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}

          <span className="absolute left-1/2 top-1/2 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center border border-border bg-background font-mono text-[11px] text-primary md:grid">
            ↔
          </span>
        </div>
      </div>
    </section>
  );
}
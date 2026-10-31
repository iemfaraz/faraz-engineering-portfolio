import SectionHead from "@/components/portfolio/SectionHead";
import Reveal from "@/components/portfolio/Reveal";
import RecommendationForm from "@/components/portfolio/RecommendationForm";
import { useLang } from "@/components/portfolio/LanguageProvider";

export default function Recommendations({ items = [], onSubmit }) {
  const { c } = useLang();
  const { recommendations } = c;

  return (
    <section id="recommendations" className="scroll-mt-28 border-t border-border bg-secondary/40 py-24 md:py-32">
      <div className="shell">
        <SectionHead kicker={recommendations.kicker} title={recommendations.title} sub={recommendations.sub} />

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {items.length === 0 ? (
              <div className="flex h-full min-h-[220px] flex-col justify-center border border-dashed border-foreground/25 p-8">
                <p className="font-display text-lg font-semibold">{recommendations.empty}</p>
                <p className="mt-2 max-w-[42ch] text-[14.5px] leading-relaxed text-muted-foreground">
                  {recommendations.emptyNote}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((item, i) => (
                  <Reveal key={item.id} delay={(i % 2) * 90} className="flex flex-col border border-border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary">
                        {recommendations.verified}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                        {item.relation}
                      </span>
                    </div>
                    <blockquote className="mt-4 text-[15px] leading-relaxed">“{item.message}”</blockquote>
                    <div className="mt-auto border-t border-border pt-4">
                      <div className="font-display text-sm font-semibold">{item.name}</div>
                      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                        {[item.job_title, item.company].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <RecommendationForm onSubmit={onSubmit} />
          </div>
        </div>
      </div>
    </section>
  );
}
import Reveal from "@/components/portfolio/Reveal";
import SectionHead from "@/components/portfolio/SectionHead";
import { useLang } from "@/components/portfolio/LanguageProvider";

export default function Expertise() {
  const { c } = useLang();
  const { expertise } = c;

  return (
    <section id="expertise" className="scroll-mt-28 py-24 md:py-32">
      <div className="shell">
        <SectionHead kicker={expertise.kicker} title={expertise.title} sub={expertise.sub} />

        <div className="mt-14 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {expertise.items.map((item, i) => (
            <Reveal
              key={item.code}
              delay={(i % 3) * 90}
              className="group relative bg-background p-7 transition-colors duration-500 hover:bg-card md:p-9"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl font-bold text-border transition-colors duration-500 group-hover:text-primary">
                  {item.code}
                </span>
                <span className="font-mono text-[9px] tracking-[0.18em] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-8 font-display text-lg font-semibold leading-snug md:text-xl">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{item.body}</p>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
import { Image } from "@/components/ui/image";
import Reveal from "@/components/portfolio/Reveal";
import { useLang } from "@/components/portfolio/LanguageProvider";

export default function Intent() {
  const { c } = useLang();

  return (
    <section className="bg-foreground text-background">
      <div className="grid md:grid-cols-12">
        <div className="relative md:col-span-5">
          <div className="h-56 md:h-full">
            <Image
              src="https://media.base44.com/images/public/6ae2465345d00d0f0fc3cc4a/b7dc01d69_generated_c759683a.png"
              alt="Macro view of copper busbars and precision connections inside switchgear"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="absolute bottom-3 start-3 font-mono text-[9px] uppercase tracking-[0.18em] text-background/70">
            FIG. 01 — SWITCHGEAR, MACRO
          </span>
        </div>
        <div className="md:col-span-7">
          <div className="px-5 py-16 md:px-14 md:py-24">
            <Reveal>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-background/55">{c.intent.kicker}</div>
              <blockquote className="mt-8 font-display text-[clamp(1.8rem,4.6vw,3.4rem)] font-medium leading-[1.1] tracking-[-0.03em]">
                <span className="text-primary">“</span>
                {c.intent.quote}
                <span className="text-primary">”</span>
              </blockquote>
              <p className="mt-8 max-w-[46ch] text-[15px] leading-relaxed text-background/60 md:text-base">{c.intent.note}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
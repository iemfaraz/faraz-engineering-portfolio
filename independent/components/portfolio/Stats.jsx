import { useLang } from "@/components/portfolio/LanguageProvider";

export default function Stats() {
  const { c } = useLang();

  return (
    <section className="mt-16 border-y border-border md:mt-20">
      <div className="shell grid grid-cols-2 gap-px bg-border md:grid-cols-5">
        {c.stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`bg-background px-4 py-7 md:px-5 md:py-9 ${i === 4 ? "col-span-2 md:col-span-1" : ""}`}
          >
            <div className="display text-[clamp(1.15rem,2.4vw,1.7rem)]">{stat.value}</div>
            <div className="mt-3 font-mono text-[9px] uppercase leading-relaxed tracking-[0.16em] text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
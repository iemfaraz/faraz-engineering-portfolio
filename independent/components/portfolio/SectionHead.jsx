import { cn } from "@/lib/utils";
import Reveal from "@/components/portfolio/Reveal";

export default function SectionHead({ kicker, title, sub, aside, children, className = "" }) {
  return (
    <div className={cn("grid gap-8 border-t border-border pt-8 md:grid-cols-12 md:gap-10", className)}>
      <Reveal className="md:col-span-4">
        <div className="micro">{kicker}</div>
        {aside ? <div className="mt-6">{aside}</div> : null}
      </Reveal>
      <Reveal className="md:col-span-8" delay={90}>
        <h2 className="display text-[clamp(1.9rem,4.4vw,3.3rem)] text-balance">{title}</h2>
        {sub ? <p className="mt-5 max-w-[54ch] text-[17px] text-muted-foreground">{sub}</p> : null}
        {children ? <div className="mt-7 max-w-[64ch]">{children}</div> : null}
      </Reveal>
    </div>
  );
}
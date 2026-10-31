import { Image } from "@/components/ui/image";
import Reveal from "@/components/portfolio/Reveal";
import SectionHead from "@/components/portfolio/SectionHead";
import { useLang } from "@/components/portfolio/LanguageProvider";

export default function Toolkit() {
  const { c } = useLang();
  const { toolkit } = c;

  return (
    <section id="toolkit" className="scroll-mt-28 py-24 md:py-32">
      <div className="shell">
        <SectionHead kicker={toolkit.kicker} title={toolkit.title} sub={toolkit.sub} />

        <div className="mt-14 grid gap-px bg-border md:grid-cols-12">
          <Reveal className="bg-background p-7 md:col-span-4 md:p-9">
            <div className="micro">{toolkit.softwareLabel}</div>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {toolkit.software.map((item) => (
                <span key={item} className="tag">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-9 micro">{toolkit.standardsLabel}</div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {toolkit.standards.map((item) => (
                <span key={item} className="border border-primary/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                  {item}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={90} className="bg-background p-7 md:col-span-5 md:p-9">
            <div className="micro">{toolkit.credentialsLabel}</div>
            <ul className="mt-4">
              {toolkit.credentials.map((credential) => (
                <li key={credential.no} className="border-t border-border py-4 first:border-t-0 first:pt-0">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[10px] text-muted-foreground">{credential.no}</span>
                    <div>
                      <div className="font-display text-[15px] font-semibold leading-snug">{credential.title}</div>
                      <div className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{credential.body}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={160} className="relative bg-background md:col-span-3">
            <div className="h-44 w-full md:h-56">
              <Image
                src="https://media.base44.com/images/public/6ae2465345d00d0f0fc3cc4a/32b4afd08_generated_faac24d0.png"
                alt="Electrical testing instruments arranged on a concrete surface"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="micro">{toolkit.fieldKit.label}</div>
              <div className="mt-2 font-display text-[15px] font-semibold leading-snug">{toolkit.fieldKit.title}</div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Reveal from "@/components/portfolio/Reveal";
import { useLang } from "@/components/portfolio/LanguageProvider";
import CvDownload from "@/components/portfolio/CvDownload";

const PROFILE = "https://www.linkedin.com/in/faraz-nawaz-409294269/";

export default function Contact() {
  const { c } = useLang();
  const { contact } = c;

  return (
    <section id="contact" className="scroll-mt-28 bg-foreground text-background">
      <div className="shell py-24 md:py-32">
        <Reveal>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-background/50">{contact.kicker}</span>
            <span className="h-px flex-1 bg-background/20" />
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-background/50">
              <span className="h-1.5 w-1.5 animate-pulse bg-primary" />
              {contact.availability}
            </span>
          </div>

          <h2 className="mt-10 max-w-[18ch] font-display text-[clamp(2.2rem,6.4vw,4.6rem)] font-bold uppercase leading-[0.95] tracking-[-0.035em]">
            {contact.title}
          </h2>
          <p className="mt-6 max-w-[52ch] text-[16px] leading-relaxed text-background/60">{contact.sub}</p>
        </Reveal>

        <Reveal delay={120} className="mt-14">
          <a
            href={`mailto:${contact.email}`}
            className="group flex items-center justify-between gap-4 border-y border-background/20 py-6 transition-colors hover:text-primary"
          >
            <span className="flex items-center gap-4">
              <Mail className="h-5 w-5 flex-none text-background/40 transition-colors group-hover:text-primary" strokeWidth={1.4} />
              <span className="font-display text-[clamp(1.05rem,3.4vw,2rem)] font-medium tracking-[-0.02em]">
                {contact.email}
              </span>
            </span>
            <ArrowUpRight className="h-5 w-5 flex-none text-background/40 transition-colors group-hover:text-primary rtl:-scale-x-100" />
          </a>
        </Reveal>

        <div className="mt-8 grid gap-px bg-background/15 sm:grid-cols-3">
          <a
            href="https://wa.me/966551679504"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-foreground px-5 py-6 transition-colors hover:bg-background/5"
          >
            <Phone className="h-4 w-4 flex-none text-background/40 transition-colors group-hover:text-primary" strokeWidth={1.4} />
            <span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-background/40">
                {c.ui.whatsapp}
              </span>
              <span className="mt-1 block font-mono text-[12px] tracking-[0.04em]" dir="ltr">
                {contact.whatsapp}
              </span>
            </span>
          </a>

          <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="group flex items-center gap-3 bg-foreground px-5 py-6 transition-colors hover:bg-background/5">
            <Phone className="h-4 w-4 flex-none text-background/40 transition-colors group-hover:text-primary" strokeWidth={1.4} />
            <span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-background/40">{c.ui.call}</span>
              <span className="mt-1 block font-mono text-[12px] tracking-[0.04em]" dir="ltr">
                {contact.phone}
              </span>
            </span>
          </a>

          <div className="flex items-center gap-3 bg-foreground px-5 py-6">
            <MapPin className="h-4 w-4 flex-none text-background/40" strokeWidth={1.4} />
            <span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-background/40">
                {contact.location}
              </span>
              <span className="mt-1 block font-mono text-[12px] tracking-[0.04em]">{contact.availability}</span>
            </span>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <CvDownload variant="inverse" />
          <a
            href={PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-background/30 px-6 py-3.5 font-display text-[12px] font-medium uppercase tracking-[0.12em] transition-colors hover:border-background"
          >
            {c.ui.linkedin}
            <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
          </a>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-background/40">{contact.cvNote}</span>
        </div>
      </div>

      <div className="border-t border-background/15">
        <div className="shell flex flex-col items-start justify-between gap-3 py-6 sm:flex-row sm:items-center">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-background/45">{c.footer}</span>
          <div className="flex items-center gap-5">
            <a href={PROFILE} target="_blank" rel="noopener noreferrer" className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-background/45 hover:text-background">
              {c.ui.linkedin}
            </a>
            <a href="#top" className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-background/45 hover:text-background">
              ↑
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
import { FileText } from "lucide-react";
import Reveal from "@/components/portfolio/Reveal";
import SectionHead from "@/components/portfolio/SectionHead";
import ProjectPlate from "@/components/portfolio/ProjectPlate";
import { useLang } from "@/components/portfolio/LanguageProvider";
import { useMedia } from "@/components/portfolio/MediaProvider";
import { Image } from "@/components/ui/image";

const WHATSAPP = "https://wa.me/966551679504";

export default function Sheets() {
  const { c } = useLang();
  const { drawings, sheetCover } = useMedia();
  const { sheets } = c;
  const request = `${WHATSAPP}?text=${encodeURIComponent("Drawing pack request — power / lighting / SLD sheets")}`;

  return (
    <section id="sheets" className="scroll-mt-28 py-24 md:py-32">
      <div className="shell">
        <SectionHead kicker={sheets.kicker} title={sheets.title} sub={sheets.sub} />

        <div className="mt-14 grid border border-border bg-card md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {sheets.empty}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">PDF · A1</span>
            </div>

            <ul>
              {drawings.length > 0
                ? drawings.map((item, i) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-5 border-b border-border px-6 py-5 last:border-b-0"
                    >
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-[15.5px] leading-snug">
                        {item.title}
                        {item.note ? (
                          <span className="mt-1 block text-[13px] text-muted-foreground">{item.note}</span>
                        ) : null}
                      </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary"
                      >
                        {c.ui.viewProject}
                        <FileText className="h-4 w-4 flex-none" strokeWidth={1.4} />
                      </a>
                    </li>
                  ))
                : sheets.includes.map((item, i) => (
                    <li
                      key={item}
                      className="flex items-center gap-5 border-b border-border px-6 py-5 last:border-b-0"
                    >
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-[15.5px] leading-snug">{item}</span>
                      <FileText className="h-4 w-4 flex-none text-muted-foreground" strokeWidth={1.4} />
                    </li>
                  ))}
            </ul>

            <div className="px-6 py-6">
              <p className="max-w-[46ch] text-[13.5px] leading-relaxed text-muted-foreground">{sheets.note}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={request} target="_blank" rel="noopener noreferrer" className="btn-solid">
                  {sheets.cta}
                </a>
                <a href={`mailto:${c.contact.email}?subject=Drawing%20pack%20request`} className="btn-line">
                  {c.ui.email}
                </a>
              </div>
            </div>
          </div>

          <Reveal className="relative flex items-center justify-center border-t border-border bg-background p-10 md:col-span-5 md:border-s md:border-t-0">
            {sheetCover ? (
              <Image
                src={sheetCover.url}
                alt={sheetCover.title || "Drawing sheet"}
                fittingType="fit"
                className="h-auto w-full max-w-[320px] border border-border bg-background"
              />
            ) : (
              <ProjectPlate
                category="light"
                label="SHEET 04 · LIGHTING"
                className="h-auto w-full max-w-[260px] text-foreground/70"
              />
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
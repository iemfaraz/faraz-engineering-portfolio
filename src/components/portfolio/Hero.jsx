import { useState } from "react";
import { Play } from "lucide-react";
import { Image } from "@/components/ui/image";
import FilmOverlay from "@/components/portfolio/FilmOverlay";
import { useLang } from "@/components/portfolio/LanguageProvider";
import { useMedia } from "@/components/portfolio/MediaProvider";
import CvDownload from "@/components/portfolio/CvDownload";

const WHATSAPP = "https://wa.me/966551679504";

export default function Hero() {
  const { c, isRtl } = useLang();
  const { introVideo } = useMedia();
  const [film, setFilm] = useState(false);

  return (
    <section id="top" className="relative overflow-hidden pt-28 md:pt-32">
      <div className="pointer-events-none absolute inset-0 bp-grid opacity-[0.55]" aria-hidden="true" />
      <div className="shell relative">
        <div className="flex items-center gap-4">
          <span className="micro">{c.hero.eyebrow}</span>
          <span className="h-px flex-1 bg-border" />
          <span className="micro hidden sm:block">24.7136° N · 46.6753° E</span>
        </div>

        <div className="mt-10 grid gap-12 md:mt-14 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <h1 className="display text-[clamp(3.2rem,10.5vw,7.4rem)]">
              <span className="block">{c.brand.first}</span>
              <span
                className={isRtl ? "block text-muted-foreground" : "block text-transparent"}
                style={isRtl ? undefined : { WebkitTextStroke: "1.4px hsl(var(--foreground))" }}
              >
                {c.brand.last}
              </span>
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
              {c.hero.stack.map((word, i) => (
                <span key={word} className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em]">
                  {i > 0 ? <span className="h-3 w-px bg-border" /> : null}
                  {word}
                </span>
              ))}
            </div>

            <p className="mt-7 max-w-[54ch] text-[17px] leading-relaxed text-muted-foreground md:text-[18px]">
              {c.hero.lead}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${c.contact.email}`} className="btn-solid">
                {c.ui.email}
              </a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-line">
                {c.ui.whatsapp}
              </a>
              <CvDownload variant="line" />
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2">
              {c.hero.badges.map((badge) => (
                <li key={badge} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <span className="h-1.5 w-1.5 bg-primary" />
                  {badge}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-5">
            <figure className="border border-border bg-card">
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                <Image src="/assets/photo.jpg" alt="Faraz Nawaz" className="h-full w-full object-cover" />
                {introVideo ? (
                  <button
                    type="button"
                    onClick={() => setFilm(true)}
                    className="group absolute bottom-4 start-4 flex items-center gap-3 bg-background/95 px-4 py-3 text-start transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <Play className="h-3.5 w-3.5" strokeWidth={2} />
                    <span className="font-mono text-[9px] uppercase leading-tight tracking-[0.16em]">
                      {c.ui.playFilm}
                    </span>
                  </button>
                ) : null}
              </div>
              <figcaption className="grid grid-cols-3 divide-x divide-border border-t border-border rtl:divide-x-reverse">
                {c.hero.photoMeta.map(([label, value]) => (
                  <div key={label} className="px-3 py-3">
                    <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em]">{value}</div>
                  </div>
                ))}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      {introVideo ? (
        <FilmOverlay
          open={film}
          onClose={() => setFilm(false)}
          src={introVideo.url}
          title={c.hero.filmTitle}
          closeLabel={c.ui.close}
        />
      ) : null}
    </section>
  );
}
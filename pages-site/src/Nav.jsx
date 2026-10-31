
import { useLang } from "@/components/portfolio/LanguageProvider";

import CvDownload from "@/components/portfolio/CvDownload";
import ThemeToggle from "@/components/portfolio/ThemeToggle";

export default function Nav() {
  const { c, lang, setLang } = useLang();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/92 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between gap-4 md:h-20">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="font-display text-[14px] font-bold uppercase tracking-[0.18em] md:text-[15px]">
            {c.brand.first}
          </span>
          <span className="font-display text-[14px] font-bold uppercase tracking-[0.18em] text-muted-foreground md:text-[15px]">
            {c.brand.last}
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {c.nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-none items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="border border-foreground/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
          >
            {c.ui.langButton}
          </button>
          <CvDownload className="hidden !px-4 !py-2.5 !text-[10px] sm:inline-flex" />
        </div>
      </div>

      <div className="border-t border-border lg:hidden">
        <div className="no-scrollbar shell flex gap-6 overflow-x-auto py-2.5">
          {c.nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
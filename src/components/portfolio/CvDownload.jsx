import { Link } from "@tanstack/react-router";
import { ChevronDown, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLang } from "@/components/portfolio/LanguageProvider";
import { useMedia } from "@/components/portfolio/MediaProvider";
import { DEFAULT_CV_URL } from "@/hooks/use-cv-url";
import { cn } from "@/lib/utils";

const TRIGGERS = {
  solid: "btn-solid",
  line: "btn-line",
  inverse:
    "inline-flex items-center gap-2 bg-background px-6 py-3.5 font-display text-[12px] font-medium uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-primary hover:text-primary-foreground",
};

const ITEM =
  "flex cursor-pointer items-center justify-between gap-6 rounded-none px-3 py-2.5 font-display text-[12px] uppercase tracking-[0.1em] focus:bg-secondary focus:text-foreground";

// One download button, two languages: the uploaded English PDF, and the
// Arabic version generated from it.
export default function CvDownload({ variant = "solid", className = "" }) {
  const { c } = useLang();
  const { cv, cvAr } = useMedia();
  const englishUrl = cv?.url || DEFAULT_CV_URL;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(TRIGGERS[variant], className)}>
        <Download className="h-3.5 w-3.5" />
        {c.ui.cv}
        <ChevronDown className="h-3 w-3 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[15rem] rounded-none border-border bg-card p-1">
        <DropdownMenuItem asChild>
          <a href={englishUrl} download rel="noopener noreferrer" className={ITEM}>
            {c.ui.cvEnglish}
            <span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground">EN</span>
          </a>
        </DropdownMenuItem>
        {cvAr?.content ? (
          <DropdownMenuItem asChild>
            <Link to="/cv/$lang" params={{ lang: "ar" }} className={ITEM}>
              {c.ui.cvArabic}
              <span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground">AR</span>
            </Link>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
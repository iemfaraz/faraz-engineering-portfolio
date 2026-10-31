import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/components/portfolio/LanguageProvider";
import { useMedia } from "@/components/portfolio/MediaProvider";
import ArabicCvSheet from "@/components/portfolio/ArabicCvSheet";
import { downloadElementAsPdf } from "@/lib/download-pdf";

export const Route = createFileRoute("/cv/$lang")({
  ssr: false,
  head: () => ({ meta: [{ title: "السيرة الذاتية — Faraz Nawaz" }] }),
  component: CvPage,
});

const parse = (record) => {
  if (!record?.content) return null;
  try {
    const parsed = JSON.parse(record.content);
    return {
      name: String(parsed?.name ?? ""),
      title: String(parsed?.title ?? ""),
      contact: String(parsed?.contact ?? ""),
      sections: Array.isArray(parsed?.sections)
        ? parsed.sections.map((section) => ({
            heading: String(section?.heading ?? ""),
            lines: Array.isArray(section?.lines) ? section.lines.map((line) => String(line)) : [],
          }))
        : [],
    };
  } catch {
    return null;
  }
};

function CvPage() {
  const { c } = useLang();
  const { cvAr } = useMedia();
  const sheet = useRef(null);
  const [busy, setBusy] = useState(false);
  const data = useMemo(() => parse(cvAr), [cvAr]);

  async function download() {
    if (!sheet.current) return;
    setBusy(true);
    try {
      await downloadElementAsPdf(sheet.current, "Faraz-Nawaz-CV-AR.pdf");
    } catch {
      toast.error(c.ui.cvPdfFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="shell flex flex-wrap items-center justify-between gap-3 py-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:-scale-x-100" />
          {c.ui.cvBack}
        </Link>
        {data ? (
          <button type="button" onClick={download} disabled={busy} className="btn-solid !py-2.5 disabled:opacity-60">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {busy ? c.ui.cvPreparing : c.ui.cvPdf}
          </button>
        ) : null}
      </div>

      <div className="shell pb-16">
        {data ? (
          <div className="overflow-x-auto border border-border bg-white shadow-sm">
            <ArabicCvSheet data={data} sheetRef={sheet} />
          </div>
        ) : (
          <p className="border border-border bg-card px-5 py-8 text-[15px] text-muted-foreground">{c.ui.cvMissing}</p>
        )}
      </div>
    </div>
  );
}
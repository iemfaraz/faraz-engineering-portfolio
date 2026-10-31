import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useMedia } from "@/components/portfolio/MediaProvider";
import { DEFAULT_CV_URL } from "@/hooks/use-cv-url";
import { buildArabicCv } from "@/lib/server-fns";

export default function CvManager() {
  const { cv, cvAr, refreshMedia } = useMedia();
  const buildArabic = useServerFn(buildArabicCv);
  const [busy, setBusy] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [link, setLink] = useState("");
  const inputRef = useRef(null);
  const current = cv?.url || DEFAULT_CV_URL;

  async function store(values) {
    if (cv) {
      await base44.entities.MediaItem.update(cv.id, values);
    } else {
      await base44.entities.MediaItem.create({ kind: "cv", ...values });
    }
    await refreshMedia();
  }

  async function translate(fileUrl, title) {
    setTranslating(true);
    try {
      await buildArabic({ data: { file_url: fileUrl, source_title: title ?? "" } });
      await refreshMedia();
      toast.success("Arabic version generated from this PDF");
    } catch (error) {
      toast.error(error?.message ?? "The Arabic version could not be generated.");
    } finally {
      setTranslating(false);
    }
  }

  async function upload(file) {
    setBusy(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      await store({ url: file_url, title: file.name });
      toast.success("CV updated");
      setBusy(false);
      await translate(file_url, file.name);
    } catch (error) {
      toast.error(error?.message ?? "That upload did not go through.");
      setBusy(false);
    }
  }

  function handleChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) upload(file);
  }

  async function handleLink(event) {
    event.preventDefault();
    if (!link.trim()) return;
    const url = link.trim();
    setBusy(true);
    try {
      await store({ url });
      setLink("");
      toast.success("CV updated");
    } catch (error) {
      toast.error(error?.message ?? "That did not go through.");
    } finally {
      setBusy(false);
    }
    await translate(url, "");
  }

  async function remove() {
    if (!cv) return;
    if (!window.confirm("Remove the CV and its Arabic version? The site goes back to the original file.")) return;
    setBusy(true);
    try {
      await base44.entities.MediaItem.delete(cv.id);
      if (cvAr?.id) await base44.entities.CvVersion.delete(cvAr.id);
      await refreshMedia();
      toast.success("CV removed");
    } catch (error) {
      toast.error(error?.message ?? "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  const working = busy || translating;

  return (
    <div className="max-w-3xl">
      <h1 className="display text-[clamp(1.9rem,4vw,2.8rem)]">CV</h1>
      <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted-foreground">
        Upload your English PDF. Every CV button on the site then offers two downloads — English and Arabic — and the
        Arabic version is written automatically from the PDF you upload. Files are stored publicly — anyone with the
        link can open them.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3 border border-border bg-card p-5">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">English — in use</div>
          <a
            href={current}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block truncate text-[15px] text-primary hover:underline"
          >
            {cv?.title || current.split("/").pop()}
          </a>
        </div>
        <input ref={inputRef} type="file" accept="application/pdf" onChange={handleChange} className="hidden" />
        <button
          type="button"
          disabled={working}
          onClick={() => inputRef.current?.click()}
          className="border border-foreground/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-50"
        >
          {busy ? "Uploading…" : cv ? "Replace PDF" : "Upload PDF"}
        </button>
        {cv ? (
          <button
            type="button"
            disabled={working}
            onClick={remove}
            className="border border-destructive/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-destructive transition-colors hover:border-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
          >
            Remove
          </button>
        ) : null}
      </div>

      <div className="mt-4 border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Arabic version</div>
            <div className="mt-1 text-[15px]">
              {translating
                ? "Writing the Arabic CV…"
                : cvAr?.content
                  ? "Ready — offered next to the English download"
                  : "Not written yet"}
            </div>
            {cvAr?.translated_at && !translating ? (
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                From {cvAr.source_title || "the uploaded PDF"}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {cvAr?.content ? (
              <Link
                to="/cv/$lang"
                params={{ lang: "ar" }}
                className="border border-foreground/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                Preview
              </Link>
            ) : null}
            <button
              type="button"
              disabled={working}
              onClick={() => translate(current, cv?.title ?? "")}
              className="border border-foreground/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-50"
            >
              {translating ? "Writing…" : cvAr?.content ? "Write Arabic again" : "Write Arabic version"}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleLink} className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={link}
          onChange={(event) => setLink(event.target.value)}
          placeholder="…or paste a CV link (Drive, Dropbox, any URL)"
          className="h-10 min-w-0 flex-1 border border-input bg-transparent px-3 text-sm"
        />
        <button type="submit" disabled={working || !link.trim()} className="btn-line !py-2.5 disabled:opacity-50">
          Use this link
        </button>
      </form>
    </div>
  );
}
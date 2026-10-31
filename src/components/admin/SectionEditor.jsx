import { useMemo, useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/components/portfolio/LanguageProvider";
import { DICTIONARIES, SECTIONS, fieldsFor, getAtPath } from "@/lib/content-fields";

const labelFor = (path) =>
  path
    .split(".")
    .slice(1)
    .map((part) => (/^\d+$/.test(part) ? `#${Number(part) + 1}` : part.replace(/_/g, " ")))
    .join(" · ");

export default function SectionEditor() {
  const { overrides, refreshContent } = useLang();
  const [editorLang, setEditorLang] = useState("en");
  const [section, setSection] = useState("hero");
  const [draft, setDraft] = useState({});
  const [busy, setBusy] = useState(false);

  const dictionary = DICTIONARIES[editorLang];
  const fields = useMemo(() => fieldsFor(section, dictionary), [section, dictionary]);
  const saved = useMemo(() => {
    const map = {};
    overrides
      .filter((row) => row.lang === editorLang)
      .forEach((row) => {
        map[row.path] = row;
      });
    return map;
  }, [overrides, editorLang]);

  const valueFor = (path, fallback) => draft[path] ?? saved[path]?.value ?? fallback ?? "";

  function pickSection(key) {
    setSection(key);
    setDraft({});
  }

  function pickLang(key) {
    setEditorLang(key);
    setDraft({});
  }

  async function save() {
    const work = [];
    fields.forEach(({ path, value: fallback }) => {
      const next = draft[path];
      if (next === undefined) return;
      const trimmed = next.trim();
      const existing = saved[path];
      if (!trimmed || trimmed === fallback) {
        if (existing) work.push(base44.entities.TextOverride.delete(existing.id));
        return;
      }
      if (existing) {
        if (existing.value !== trimmed) work.push(base44.entities.TextOverride.update(existing.id, { value: trimmed }));
        return;
      }
      work.push(base44.entities.TextOverride.create({ path, lang: editorLang, value: trimmed }));
    });

    if (work.length === 0) {
      toast("Nothing changed in this section.");
      return;
    }

    setBusy(true);
    try {
      await Promise.all(work);
      await refreshContent();
      setDraft({});
      toast.success("Section saved");
    } catch (error) {
      toast.error(error?.message ?? "That did not save.");
    } finally {
      setBusy(false);
    }
  }

  const dirty = Object.keys(draft).length > 0;

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[clamp(1.9rem,4vw,2.8rem)]">Section details</h1>
          <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-muted-foreground">
            Every line of text on the site, section by section. Clear a field and save to go back to the original
            wording.
          </p>
        </div>
        <div className="flex gap-1 border border-border p-1">
          {["en", "ar"].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => pickLang(key)}
              className={
                key === editorLang
                  ? "bg-foreground px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-background"
                  : "px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
              }
            >
              {key === "en" ? "English" : "Arabic"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="flex flex-wrap gap-1 lg:flex-col">
          {SECTIONS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => pickSection(item.key)}
              className={
                item.key === section
                  ? "border border-foreground bg-foreground px-3 py-2 text-start font-mono text-[10px] uppercase tracking-[0.14em] text-background"
                  : "border border-border px-3 py-2 text-start font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:border-foreground/40"
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          <div className="grid gap-4 border border-border bg-card p-5">
            {fields.map(({ path, value }) => {
              const current = valueFor(path, value);
              const overridden = Boolean(saved[path]) || draft[path] !== undefined;
              return (
                <label key={path} className="block">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
                      {labelFor(path) || path}
                    </span>
                    {overridden ? <span className="h-1.5 w-1.5 bg-primary" aria-hidden="true" /> : null}
                  </span>
                  <textarea
                    value={current}
                    rows={current.length > 90 ? 4 : current.length > 40 ? 2 : 1}
                    maxLength={2000}
                    dir={editorLang === "ar" ? "rtl" : "ltr"}
                    onChange={(event) => setDraft((prev) => ({ ...prev, [path]: event.target.value }))}
                    className="mt-1.5 w-full resize-y border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-foreground"
                  />
                </label>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={save} disabled={busy || !dirty} className="btn-solid disabled:opacity-50">
              {busy ? "Saving…" : "Save section"}
            </button>
            {dirty ? (
              <button
                type="button"
                onClick={() => setDraft({})}
                disabled={busy}
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
              >
                Discard edits
              </button>
            ) : null}
            <span className="micro">{fields.length} fields</span>
          </div>
        </div>
      </div>
    </div>
  );
}
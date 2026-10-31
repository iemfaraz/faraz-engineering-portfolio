import { useRef, useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useMedia } from "@/components/portfolio/MediaProvider";
import SheetCoverManager from "@/components/admin/SheetCoverManager";

const EMPTY = { title: "", note: "" };

export default function DrawingsManager() {
  const { drawings, refreshMedia } = useMedia();
  const inputRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!form.title.trim() || !file) {
      toast.error("Add a title and choose a file.");
      return;
    }
    setBusy(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      await base44.entities.MediaItem.create({
        kind: "drawing",
        title: form.title.trim(),
        note: form.note.trim(),
        url: file_url,
        order: Date.now(),
      });
      await refreshMedia();
      setForm(EMPTY);
      if (inputRef.current) inputRef.current.value = "";
      toast.success("Drawing added");
    } catch (error) {
      toast.error(error?.message ?? "That upload did not go through.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(item) {
    if (!window.confirm(`Remove “${item.title}” from the portfolio?`)) return;
    setBusy(true);
    try {
      await base44.entities.MediaItem.delete(item.id);
      await refreshMedia();
      toast.success("Drawing removed");
    } catch (error) {
      toast.error(error?.message ?? "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-foreground";

  return (
    <div className="max-w-4xl">
      <h1 className="display text-[clamp(1.9rem,4vw,2.8rem)]">Project drawings</h1>
      <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted-foreground">
        The sheets listed in the Drawing sheets section. Upload a PDF or image, add a title, and it appears on the
        site for visitors to open.
      </p>

      <SheetCoverManager />

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 border border-border bg-card p-5 md:grid-cols-2">
        <label className="block">
          <span className="micro">Title</span>
          <input
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            maxLength={90}
            placeholder="Power layout and panel schedule"
            className={`mt-2 ${field}`}
          />
        </label>
        <label className="block">
          <span className="micro">Note (optional)</span>
          <input
            value={form.note}
            onChange={(event) => update("note", event.target.value)}
            maxLength={140}
            placeholder="Issued for construction · SBC"
            className={`mt-2 ${field}`}
          />
        </label>
        <label className="block md:col-span-2">
          <span className="micro">File</span>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,image/*"
            className="mt-2 block w-full font-mono text-[11px] file:me-3 file:border-0 file:bg-foreground file:px-3 file:py-2 file:font-mono file:text-[10px] file:uppercase file:tracking-[0.14em] file:text-background"
          />
        </label>
        <div className="md:col-span-2">
          <button type="submit" disabled={busy} className="btn-solid disabled:opacity-60">
            {busy ? "Uploading…" : "Add drawing"}
          </button>
        </div>
      </form>

      <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
        Uploaded files are stored publicly — anyone with the link can open them.
      </p>

      <div className="mt-10 border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <span className="micro">On the site · {drawings.length}</span>
        </div>
        {drawings.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">
            No drawings uploaded yet — the section shows the standard sheet list instead.
          </p>
        ) : (
          <ul>
            {drawings.map((item) => (
              <li key={item.id} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0">
                <FileText className="h-4 w-4 flex-none text-muted-foreground" strokeWidth={1.4} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px]">{item.title}</div>
                  {item.note ? <div className="truncate text-[12.5px] text-muted-foreground">{item.note}</div> : null}
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
                >
                  Open
                </a>
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  disabled={busy}
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-destructive hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
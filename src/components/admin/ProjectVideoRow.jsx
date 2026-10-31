import { useEffect, useRef, useState } from "react";
import { Link2, Upload } from "lucide-react";

export default function ProjectVideoRow({ project, media, busy, onSave, onUpload, onRemove }) {
  const fileRef = useRef(null);
  const [value, setValue] = useState(media?.url ?? "");

  useEffect(() => {
    setValue(media?.url ?? "");
  }, [media?.url]);

  function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onUpload(file);
  }

  return (
    <div className="border-b border-border p-4 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[15px]">{project.title}</div>
          <div className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {project.no} — {project.catLabel}
          </div>
        </div>
        <span
          className={`flex-none font-mono text-[9px] uppercase tracking-[0.16em] ${media ? "text-primary" : "text-muted-foreground"}`}
        >
          {media ? "Video added" : "No video"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Paste a video link (YouTube, LinkedIn, .mp4)"
          className="min-w-0 flex-1 border border-input bg-background px-3 py-2 text-[13px] outline-none focus:border-foreground"
        />
        <button
          type="button"
          disabled={busy || !value.trim()}
          onClick={() => onSave(value.trim())}
          className="inline-flex items-center gap-1.5 border border-foreground/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40"
        >
          <Link2 className="h-3 w-3" />
          Save link
        </button>
        <input ref={fileRef} type="file" accept="video/*" onChange={handleFile} className="hidden" />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 border border-foreground/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40"
        >
          <Upload className="h-3 w-3" />
          {busy ? "Uploading…" : "Upload file"}
        </button>
        {media ? (
          <button
            type="button"
            disabled={busy}
            onClick={onRemove}
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-destructive hover:underline disabled:opacity-40"
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}
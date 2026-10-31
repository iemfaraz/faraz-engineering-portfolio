import { useRef } from "react";
import { Image } from "@/components/ui/image";
import ProjectPlate from "@/components/portfolio/ProjectPlate";

export default function ProjectCoverRow({ project, cover, busy, onUpload, onRemove }) {
  const inputRef = useRef(null);

  function handleChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onUpload(file);
  }

  return (
    <div className="flex items-center gap-4 border-b border-border p-4 last:border-b-0">
      <div className="h-16 w-16 flex-none overflow-hidden border border-border bg-secondary text-foreground/60">
        {cover ? (
          <Image src={cover.url} alt={project.title} fittingType="fill" className="h-full w-full" />
        ) : (
          <ProjectPlate category={project.cat} className="h-full w-full" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px]">{project.title}</div>
        <div className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {project.no} — {project.catLabel}
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} className="hidden" />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="flex-none border border-foreground/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-50"
      >
        {busy ? "Uploading…" : cover ? "Replace" : "Upload"}
      </button>
      {cover ? (
        <button
          type="button"
          disabled={busy}
          onClick={onRemove}
          className="flex-none font-mono text-[10px] uppercase tracking-[0.14em] text-destructive hover:underline disabled:opacity-50"
        >
          Remove
        </button>
      ) : null}
    </div>
  );
}
import { useRef, useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { useMedia } from "@/components/portfolio/MediaProvider";

export default function SheetCoverManager() {
  const { sheetCover, refreshMedia } = useMedia();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function upload(file) {
    if (!file) return;
    setBusy(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      if (sheetCover) await base44.entities.MediaItem.delete(sheetCover.id);
      await base44.entities.MediaItem.create({
        kind: "drawing_cover",
        title: file.name,
        url: file_url,
        order: 0,
      });
      await refreshMedia();
      toast.success("Section cover updated");
    } catch (error) {
      toast.error(error?.message ?? "That upload did not go through.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
      setBusy(false);
    }
  }

  async function remove() {
    if (!sheetCover || !window.confirm("Remove the cover from the Drawing sheets section?")) return;
    setBusy(true);
    try {
      await base44.entities.MediaItem.delete(sheetCover.id);
      await refreshMedia();
      toast.success("Cover removed");
    } catch (error) {
      toast.error(error?.message ?? "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="micro">Section cover</span>
          <p className="mt-2 max-w-[54ch] text-[13px] leading-relaxed text-muted-foreground">
            The sheet image shown beside the list in the Drawing sheets section. Upload a photo or a rendered sheet;
            until you do, the built-in sheet drawing is used.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="btn-line !px-4 !py-2.5 !text-[10px] disabled:opacity-60"
          >
            {busy ? "Working…" : sheetCover ? "Replace cover" : "Upload cover"}
          </button>
          {sheetCover ? (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-destructive hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(event) => upload(event.target.files?.[0])}
        className="hidden"
      />

      {sheetCover ? (
        <Image
          src={sheetCover.url}
          alt="Drawing sheets section cover"
          fittingType="fit"
          className="mt-4 h-auto w-full max-w-[280px] border border-border bg-background"
        />
      ) : null}
    </div>
  );
}
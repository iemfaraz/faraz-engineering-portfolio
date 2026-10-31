import { useRef, useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useMedia } from "@/components/portfolio/MediaProvider";

export default function VideoManager() {
  const { introVideo, refreshMedia } = useMedia();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      if (introVideo) {
        await base44.entities.MediaItem.update(introVideo.id, { url: file_url, title: file.name });
      } else {
        await base44.entities.MediaItem.create({ kind: "intro_video", title: file.name, url: file_url, order: 0 });
      }
      await refreshMedia();
      toast.success("Intro video updated");
    } catch (error) {
      toast.error(error?.message ?? "That upload did not go through.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    if (!introVideo) return;
    if (!window.confirm("Remove the intro video from the portfolio?")) return;
    setBusy(true);
    try {
      await base44.entities.MediaItem.delete(introVideo.id);
      await refreshMedia();
      toast.success("Intro video removed");
    } catch (error) {
      toast.error(error?.message ?? "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="display text-[clamp(1.9rem,4vw,2.8rem)]">Intro video</h1>
      <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-muted-foreground">
        The film behind “Play intro film” on the hero and in the Film section. Upload a new MP4 to replace it, or
        remove it to take the film off the site.
      </p>

      <div className="mt-8 border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <span className="micro">{introVideo ? "Published" : "No film published"}</span>
        </div>

        {introVideo ? (
          <video className="aspect-video w-full bg-black" src={introVideo.url} controls playsInline preload="metadata" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center border-b border-border bg-secondary">
            <span className="micro">Nothing here yet</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 p-5">
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={handleFile}
            disabled={busy}
            className="block w-full max-w-sm font-mono text-[11px] file:me-3 file:border-0 file:bg-foreground file:px-3 file:py-2 file:font-mono file:text-[10px] file:uppercase file:tracking-[0.14em] file:text-background"
          />
          {introVideo ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="border border-destructive/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
            >
              Remove video
            </button>
          ) : null}
          {busy ? <span className="micro">Working…</span> : null}
        </div>
      </div>

      <p className="mt-4 text-[12.5px] leading-relaxed text-muted-foreground">
        Uploaded files are stored publicly — anyone with the link can open them.
      </p>
    </div>
  );
}
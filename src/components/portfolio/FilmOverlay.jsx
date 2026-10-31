import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// Full-screen film player: the video fills the page as far as its aspect ratio
// allows, with a close control in the header and Escape as a second way out.
export default function FilmOverlay({ open, onClose, src, title, closeLabel = "Close" }) {
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (open) setPlaying(true);
  }, [open]);

  function close() {
    setPlaying(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setPlaying(true) : close())}>
      <DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col gap-0 rounded-none border-0 bg-black p-0 sm:rounded-none [&>button]:hidden">
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className="flex items-center justify-between gap-4 border-b border-white/15 px-4 py-3 md:px-6">
          <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">{title}</span>
          <button
            type="button"
            onClick={close}
            aria-label={closeLabel}
            className="flex shrink-0 items-center gap-2 border border-white/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/80 transition-colors hover:border-white hover:bg-white hover:text-black"
          >
            <X className="h-3.5 w-3.5" />
            {closeLabel}
          </button>
        </div>

        <div className="grid min-h-0 flex-1 place-items-center p-2 md:p-4">
          <video
            key={open ? "open" : "closed"}
            className="h-full w-full bg-black object-contain"
            src={src}
            controls
            autoPlay={playing}
            playsInline
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
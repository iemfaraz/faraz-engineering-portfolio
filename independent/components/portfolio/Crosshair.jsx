import { useEffect, useState } from "react";

export default function Crosshair() {
  const [pos, setPos] = useState(null);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setFine(true);
    const onMove = (event) => setPos({ x: event.clientX, y: event.clientY });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  if (!fine || !pos) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] hidden md:block" aria-hidden="true">
      <div
        className="absolute h-px w-8 bg-primary/40"
        style={{ transform: `translate3d(${pos.x - 40}px, ${pos.y}px, 0)` }}
      />
      <div
        className="absolute h-8 w-px bg-primary/40"
        style={{ transform: `translate3d(${pos.x}px, ${pos.y - 40}px, 0)` }}
      />
      <div className="absolute font-mono text-[9px] uppercase tracking-[0.18em] text-primary/70" style={{ transform: `translate3d(${pos.x + 12}px, ${pos.y + 10}px, 0)` }}>
        {String(Math.round(pos.x)).padStart(4, "0")} · {String(Math.round(pos.y)).padStart(4, "0")}
      </div>
    </div>
  );
}
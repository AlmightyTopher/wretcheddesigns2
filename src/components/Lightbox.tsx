import React, { useEffect } from "react";

export default function Lightbox({ src, alt, onClose }: { src: string; alt?: string; onClose: () => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-3xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 text-white text-3xl font-bold bg-black/60 rounded-full px-3 py-1 hover:bg-acid-magenta transition" aria-label="Close">×</button>
        <img src={src} alt={alt} className="max-h-[80vh] w-auto rounded-lg shadow-lg border-4 border-acid-magenta" />
        {alt && <div className="mt-4 text-white text-center text-lg">{alt}</div>}
      </div>
    </div>
  );
} 
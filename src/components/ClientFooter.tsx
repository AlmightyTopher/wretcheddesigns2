"use client";
import { useEffect, useState } from "react";

export function ClientFooter() {
  const [year, setYear] = useState(new Date().getFullYear());
  useEffect(() => {
    // This ensures the year is updated client-side if the component mounts after the initial SSR render.
    // For a purely static site, this might not be strictly necessary if build time is recent.
    setYear(new Date().getFullYear());
  }, []);
  return (
    <footer className="w-full text-center py-6 text-xs text-neon-magenta/80">
      <a href="https://TopherTek.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
        A TopherTek Product © {year} — Restarting your Computer for you since the Y2K!
      </a>
    </footer>
  );
}

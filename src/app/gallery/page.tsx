"use client";
import { useEffect, useState } from "react";
import Lightbox from "../../components/Lightbox";

export default function GalleryPage() {
  const [artImages, setArtImages] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/gallery");
        const data = await res.json();
        setArtImages(data.map((item: any) => item.filename)); // Firestore must store { filename: "..." }
      } catch (err) {
        console.error("Failed to load gallery images:", err);
      }
    };

    fetchImages();
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden p-4">
      <div className="text-center max-w-3xl mx-auto z-10 mb-10">
        <h1 className="glitch-header glitch font-header text-5xl md:text-7xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
          Gallery
        </h1>
      </div>
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {artImages.map((img) => (
          <button
            key={img}
            className="group block aspect-square rounded-xl bg-gradient-to-br from-matte-black to-electric-purple shadow-lg flex items-center justify-center relative overflow-hidden hover:scale-105 transition-transform focus:outline-none"
            onClick={() => setLightbox(`/Images/Art/${img}`)}
            aria-label="View artwork"
          >
            <img
              src={`/Images/Art/${img}`}
              alt="Art piece"
              className="object-cover w-full h-full group-hover:opacity-80 transition rounded-xl"
              loading="lazy"
            />
          </button>
        ))}
      </div>
      {lightbox && (
        <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}
    </section>
  );
}

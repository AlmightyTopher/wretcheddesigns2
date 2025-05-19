"use client";
import { useState } from "react";
import Lightbox from "../../components/Lightbox";

const artImages = [
  "ca028ff7-530d-4d1f-9599-a5121425a313.jpg",
  "4fb77fbe-3d28-40ce-9243-a683afc07b50.jpg",
  "c8805ead-8f45-4031-bdc8-ada903582fba.jpg",
  "0e24c8e1-ad42-4b6c-b538-672c737cec86.jpg",
  "87d3c5db-9cb0-4b1e-b039-af2a2bec69b1.jpg",
  "6d986137-e20f-4f93-b67b-a8daa5870786.jpg",
  "478cb881-8222-440c-9f67-e3e39fb24e5d.jpg",
  "97cf6413-a320-4ba1-9d79-657133be2631.jpg",
  "36f583e6-dae6-4858-a57e-b25c34e3b0da.jpg",
  "51eb4dbf-9652-4c3b-8c35-0934874ec938.jpg",
  "56961627-4033-4cb0-a2ac-e6bd5315788d.jpg",
  "212c84dc-0494-4fb2-950d-1a450d86abf6.jpg",
  "f121373f-f6f9-4c19-a8c2-a774c43fbb71.jpg",
  "f1e6e2ad-a738-4382-ab87-18e819284d2c.jpg",
];

export default function GalleryPage() {
  const [lightbox, setLightbox] = useState<string | null>(null);
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
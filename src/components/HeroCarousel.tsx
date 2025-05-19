"use client";
import React, { useEffect, useState } from "react";

export default function HeroCarousel({
  images,
  interval
}: {
  images: string[];
  interval: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const id = setInterval(() => {
      setIndex(i => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images, interval]);

  if (!images || images.length === 0) return null;
  if (images.length === 1)
    return (
      <img src={images[0]} alt="hero" className="object-cover w-full h-full rounded-lg" />
    );

  return (
    <div className="relative w-full h-[340px] md:h-[460px] rounded-lg overflow-hidden">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Hero ${i+1}`}
          className={
            `absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000`
            + (i === index ? " opacity-100 z-10" : " opacity-0 z-0")
          }
          style={{ transition: 'opacity 1s' }}
        />
      ))}
      {/* Dots */}
      <div className="absolute left-1/2 bottom-3 -translate-x-1/2 flex gap-3 z-20">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full border-2 ${i === index ? 'bg-acid-magenta border-acid-magenta drop-shadow-neon' : 'bg-[#1a0033] border-neon-blue opacity-70'} transition`}
            aria-label={`jump to slide ${i+1}`}
          />
        ))}
      </div>
      {/* Next/Prev TODOs -- for future upgrades */}
      {/* <button className="absolute left-2 top-1/2 ...">Prev</button><button className="absolute right-2 top-1/2 ...">Next</button> */}
    </div>
  );
}

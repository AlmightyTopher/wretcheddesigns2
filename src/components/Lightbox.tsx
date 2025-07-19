import React, { useEffect } from "react";
import Image from "next/image";

interface LightboxProps {
  src: string;
  alt?: string;
  title?: string;
  description?: string;
  onClose: () => void;
}

export default function Lightbox({ src, alt, title, description, onClose }: LightboxProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || alt || "Image lightbox"}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] w-full bg-gray-900 rounded-lg shadow-2xl flex flex-col items-center p-6 animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 text-white text-4xl font-bold bg-electric-purple hover:bg-acid-magenta rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white z-10"
          aria-label="Close lightbox"
        >
          ×
        </button>

        <div className="relative w-full h-[70vh] flex justify-center items-center">
          <Image
            src={src}
            alt={alt || title || "Gallery image"}
            fill
            className="object-contain rounded-md"
            unoptimized={true}
            priority={true}
          />
        </div>

        {(title || description) && (
          <div className="mt-4 text-center w-full max-w-2xl">
            {title && <h3 className="text-2xl font-semibold text-acid-magenta mb-2">{title}</h3>}
            {description && <p className="text-gray-300 text-base leading-relaxed">{description}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { getAllGalleryImages, GalleryImage } from "../../lib/supabaseGalleryService";
import NextImage from 'next/image';

// Dynamically import the Lightbox component
const Lightbox = dynamic(() => import("../../components/Lightbox"), {
  ssr: false,
});

export default function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const images = await getAllGalleryImages();
        setGalleryImages(images);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load gallery images:", err);
        setError(err.message || "Could not load gallery images. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const openLightbox = (image: GalleryImage) => {
    setLightboxImage(image);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  if (loading) {
    return (
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-acid-magenta border-b-4 border-electric-purple"></div>
        <p className="mt-4 text-white/80">Loading Gallery...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full p-4">
        <h1 className="glitch-header glitch font-header text-3xl md:text-5xl mb-4 text-red-500">Error</h1>
        <p className="text-white/80 text-center mb-6">{error}</p>
      </section>
    );
  }

  return (
    <section className="relative flex flex-col items-center min-h-[80vh] w-full overflow-hidden p-4 md:p-8">
      <div className="text-center max-w-3xl mx-auto z-10 mb-10 md:mb-16">
        <h1 className="glitch-header glitch font-header text-5xl md:text-7xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
          Gallery
        </h1>
        <p className="text-white/70 text-lg md:text-xl">
          Explore a collection of unique designs and artwork.
        </p>
      </div>

      {galleryImages.length === 0 && !loading && (
        <div className="text-center text-white/70 text-xl">
          <p>It&apos;s a bit empty here... No images have been uploaded to the gallery yet.</p>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {galleryImages.map((image) => (
          <button
            key={image.id || image.download_url}
            className="group block aspect-w-1 aspect-h-1 rounded-xl bg-gradient-to-br from-matte-black via-gray-900 to-electric-purple shadow-xl flex items-center justify-center relative overflow-hidden hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-acid-magenta focus:ring-opacity-50"
            onClick={() => openLightbox(image)}
            aria-label={image.title || "View artwork"}
          >
            <NextImage
              src={image.download_url}
              alt={image.title || image.filename}
              layout="fill"
              objectFit="cover"
              className="group-hover:opacity-80 transition-opacity duration-300 rounded-xl"
              unoptimized={true}
              priority={galleryImages.indexOf(image) < 4}
            />
            {(image.title || image.description) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                    {image.title && <h3 className="text-white font-semibold text-lg mb-1 truncate">{image.title}</h3>}
                    {image.description && <p className="text-gray-300 text-sm line-clamp-2">{image.description}</p>}
                </div>
            )}
          </button>
        ))}
      </div>

      {lightboxImage && (
        <Lightbox
          src={lightboxImage.download_url}
          alt={lightboxImage.title || lightboxImage.filename}
          title={lightboxImage.title}
          description={lightboxImage.description}
          onClose={closeLightbox}
        />
      )}
    </section>
  );
}

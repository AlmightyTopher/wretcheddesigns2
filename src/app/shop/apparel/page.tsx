"use client";
import { useCart } from '../../../components/CartContext';
import { useEffect, useState } from 'react';
import Lightbox from "../../../components/Lightbox";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  gradient: string;
  image?: string;
  available: boolean;
};

const shirtImages = [
  "6e6b35c8-59a0-4ac4-9489-b08e05475e87.jpg",
  "bdb0f322-71fe-47d4-a980-e9866a89c344.jpg",
  "f6dfff40-1017-4409-a45d-ff22c42d23f8.jpg",
];

const PLACEHOLDER_IMAGES = [
  "/placeholder-hoodie.png",
  "/placeholder-tee.png"
];

export default function ShopApparelPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products?category=apparel')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden p-4">
      <div className="text-center max-w-3xl mx-auto z-10 mb-10">
        <h1 className="glitch-header glitch font-header text-5xl md:text-7xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
          👕 Wear the Vibe
        </h1>
      </div>
      {lightbox && (
        <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}
      {loading ? (
        <div className="text-white/80 text-xl">Loading...</div>
      ) : (
      <div className="w-full max-w-6xl mx-auto grid gap-8 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        {[...new Map(products
          .filter(product => product.available && product.image && !PLACEHOLDER_IMAGES.includes(product.image))
          .map(product => [product.image, product])
        ).values()].map(product => (
          <div
            key={product.id}
            className="bg-matte-black rounded-xl shadow-lg p-6 flex flex-col items-center group transition"
          >
            <button
              type="button"
              className="focus:outline-none"
              onClick={() => setLightbox(product.image!)}
              style={{ marginBottom: '1rem' }}
              aria-label={`View ${product.name} larger`}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-32 h-32 object-cover rounded-lg border-2 border-acid-magenta shadow transition-transform duration-200 group-hover:scale-105 group-hover:shadow-[0_0_24px_4px_rgba(155,0,255,0.4)]"
                style={{ filter: !product.available ? 'grayscale(1)' : 'none' }}
              />
            </button>
            <h3 className="text-xl font-bold mb-2">{product.name}</h3>
            <p className="text-white/80 mb-2">{product.description}</p>
            <span className="text-acid-magenta font-bold mb-2">
              {product.available ? `$${product.price}` : 'Unavailable'}
            </span>
            <button
              className="mt-auto px-4 py-2 bg-acid-magenta text-white rounded shadow hover:bg-electric-purple transition"
              onClick={() => addItem({ id: product.id, name: product.name, price: product.price })}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      )}
    </section>
  );
} 
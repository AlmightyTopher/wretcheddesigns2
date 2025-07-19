"use client";
import { useCart } from '../../../components/CartContext';
import { useEffect, useState } from 'react';
import Lightbox from "../../../components/Lightbox";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  gradient: string;
  image?: string;
  available: boolean;
};

const PLACEHOLDER_IMAGES = [
  "/placeholder-cup.png",
  "/placeholder-mug.png"
];

export default function ShopCupsPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products?category=cups')
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
          🥤 Sip in Style
        </h1>
      </div>
      {/* Product grid */}
      {loading ? (
        <div className="text-white/80 text-xl">Loading...</div>
      ) : (
      <div className="w-full max-w-6xl mx-auto grid gap-8 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        {products
          .filter(product => product.available && product.image && !PLACEHOLDER_IMAGES.includes(product.image))
          .map(product => (
            <div
              key={product.id}
              className="bg-matte-black rounded-xl shadow-lg p-6 flex flex-col items-center group transition min-h-[400px]"
            >
              <button
                type="button"
                className="focus:outline-none mb-4"
                onClick={() => setLightbox(product.image!)}
                aria-label={`View ${product.name} larger`}
              >
                <div className="relative w-48 h-48">
                  <Image
                    src={product.image!}
                    alt={product.name}
                    fill
                    className="object-cover rounded-lg border-2 border-acid-magenta shadow transition-transform duration-200 group-hover:scale-105 group-hover:shadow-[0_0_24px_4px_rgba(155,0,255,0.4)]"
                    style={{ filter: !product.available ? 'grayscale(1)' : 'none' }}
                    unoptimized={true}
                  />
                </div>
              </button>
              <div className="flex-1 flex flex-col items-center text-center">
                <h3 className="text-xl font-bold mb-3 text-white">{product.name}</h3>
                <p className="text-white/80 mb-4 text-sm leading-relaxed">{product.description}</p>
                <span className="text-acid-magenta font-bold mb-4 text-lg">
                  {product.available ? `$${product.price}` : 'Unavailable'}
                </span>
                <button
                  className="mt-auto px-6 py-3 bg-acid-magenta text-white rounded-lg shadow hover:bg-electric-purple transition-colors font-semibold"
                  onClick={() => addItem({ id: product.id, name: product.name, price: product.price })}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
      </div>
      )}
      {lightbox && (
        <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}
    </section>
  );
}

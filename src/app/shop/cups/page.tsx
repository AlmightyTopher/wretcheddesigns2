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

const cupImages = [
  "0a7dd23f-61ba-4ba0-b6f5-9435def573f5.jpg",
  "efa6f8b2-c87b-427f-928a-45045bb118d9.jpg",
  "583e25a6-a5cc-4da1-9090-75b9e529c4b6.jpg",
  "dce9d1cf-a78e-4828-bcfa-4b3869462fbb.jpg",
  "547a2a4c-9753-4daf-953d-f5bf403e4ec2.jpg",
  "44f7c31a-6f07-49ba-8c3d-06a352ccc4cf.jpg",
  "160267fd-c59d-411d-97a0-625ab3637783.jpg",
  "d767a49f-a7ba-4311-bcf1-1f4ea6069288.jpg",
  "eab17e34-a0b4-4ef2-8883-7e58db70b0d1.jpg",
  "ef810e0a-fe60-4ebf-bbb1-fc6d026d15d6.jpg",
  "b773f260-89f6-4a3d-bd80-2662ae09a634.jpg",
  "0769b870-babf-40e7-8a82-0682dc5abcfb.jpg",
  "093a4006-4a4a-4e35-be30-6ef0a608f392.jpg",
  "b7020074-02b1-42be-9c82-98317c8b0f66.jpg",
  "2537f307-75de-408a-98be-99850e625e44.jpg",
  "c242d958-c0ad-4f95-a3ba-3dd61f40fcf2.jpg",
];

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
      {lightbox && (
        <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}
    </section>
  );
} 
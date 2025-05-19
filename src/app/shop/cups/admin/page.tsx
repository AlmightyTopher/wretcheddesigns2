"use client";
import { useEffect, useState } from "react";
import AdminOverlay from "../../../../components/AdminOverlay";
import EditableText from "../../../../components/EditableText";
import EditableImage from "../../../../components/EditableImage";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  available: boolean;
};

export default function ShopCupsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API on mount
  useEffect(() => {
    fetch("/api/products?category=cups")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  function updateProduct(idx: number, field: keyof Product, value: string | number | boolean) {
    const updated = products.map((p, i) => i === idx ? { ...p, [field]: value } : p);
    setProducts(updated);
    // Persist update to API
    fetch("/api/products?category=cups", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated[idx]),
    });
  }
  function addProduct() {
    const newProduct: Product = {
      id: `new${products.length + 1}-${Date.now()}`,
      name: "New Product",
      price: 0,
      description: "",
      image: "/placeholder-cup.png",
      available: true,
    };
    setProducts(ps => [...ps, newProduct]);
    fetch("/api/products?category=cups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
  }
  function removeProduct(idx: number) {
    const product = products[idx];
    setProducts(ps => ps.filter((_, i) => i !== idx));
    fetch("/api/products?category=cups", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id }),
    });
  }

  return (
    <AdminOverlay>
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden p-4">
        <div className="text-center max-w-3xl mx-auto z-10 mb-10">
          <h1 className="glitch-header glitch font-header text-5xl md:text-7xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
            Cups (Admin)
          </h1>
        </div>
        {loading ? (
          <div className="text-white/80 text-xl">Loading...</div>
        ) : (
        <div className="w-full max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
          {products.map((product, idx) => (
            <div key={product.id} className="bg-matte-black rounded-xl shadow-lg p-6 flex flex-col items-center relative">
              <EditableImage src={product.image} onSave={img => updateProduct(idx, "image", img)} alt={product.name} />
              <EditableText value={product.name} onSave={name => updateProduct(idx, "name", name)} className="text-xl font-bold mb-2" />
              <EditableText value={product.description} onSave={desc => updateProduct(idx, "description", desc)} className="text-white/80 mb-2" />
              <div className="flex items-center gap-2 mb-2">
                <span className="text-acid-magenta font-bold">$</span>
                <input
                  type="number"
                  value={product.price}
                  min={0}
                  onChange={e => updateProduct(idx, "price", Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded bg-[#222] text-white border border-acid-magenta focus:outline-none focus:ring-2 focus:ring-acid-magenta"
                />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-white/80">Available for Sale</label>
                <input
                  type="checkbox"
                  checked={product.available}
                  onChange={e => updateProduct(idx, "available", e.target.checked)}
                  className="accent-acid-magenta w-5 h-5"
                />
              </div>
              <button onClick={() => removeProduct(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold">✖️</button>
            </div>
          ))}
          <button onClick={addProduct} className="bg-acid-magenta/20 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-4xl text-acid-magenta hover:bg-acid-magenta/40 transition">
            ➕
            <span className="text-base mt-2">Add Item</span>
          </button>
        </div>
        )}
      </section>
    </AdminOverlay>
  );
} 
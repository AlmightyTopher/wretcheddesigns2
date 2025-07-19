"use client";
import { useState } from "react";
import AdminOverlay from "../../../components/AdminOverlay";
import EditableText from "../../../components/EditableText";

export default function ShopAdminPage() {
  const [categories, setCategories] = useState([
    { id: "cups", name: "Cups" },
    { id: "apparel", name: "Apparel" },
  ]);

  function updateCategoryName(idx: number, name: string) {
    setCategories(cats => cats.map((cat, i) => i === idx ? { ...cat, name } : cat));
  }

  function addCategory() {
    setCategories(cats => [...cats, { id: `cat${cats.length + 1}`, name: "New Category" }]);
  }

  return (
    <AdminOverlay>
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden p-4">
        <div className="text-center max-w-3xl mx-auto z-10 mb-10">
          <h1 className="glitch-header glitch font-header text-5xl md:text-7xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
            Shop (Admin)
          </h1>
          <p className="text-lg text-white/80 mb-8">Edit your shop categories below:</p>
        </div>
        <div className="w-full max-w-2xl mx-auto flex flex-col md:flex-row gap-8 justify-center items-center">
          {categories.map((cat, idx) => (
            <div key={cat.id} className="flex-1 bg-matte-black/80 rounded-xl shadow-lg p-10 flex flex-col items-center">
              <EditableText value={cat.name} onSave={name => updateCategoryName(idx, name)} className="text-2xl font-header mb-2 text-acid-magenta" />
            </div>
          ))}
          <button onClick={addCategory} className="flex-1 bg-acid-magenta/20 rounded-xl shadow-lg p-10 flex flex-col items-center justify-center text-4xl text-acid-magenta hover:bg-acid-magenta/40 transition">
            ➕
            <span className="text-base mt-2">Add Category</span>
          </button>
        </div>
      </section>
    </AdminOverlay>
  );
} 
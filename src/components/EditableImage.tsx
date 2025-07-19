"use client";
import { useState } from "react";
import Image from "next/image";

export default function EditableImage({ src, onSave, className = "", alt = "" }: { src: string; onSave: (v: string) => void; className?: string; alt?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(src);
  const [preview, setPreview] = useState(src);

  function startEdit() {
    setDraft(src);
    setPreview(src);
    setEditing(true);
  }
  function save() {
    onSave(preview);
    setEditing(false);
  }
  function cancel() {
    setPreview(src);
    setEditing(false);
  }
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  if (editing) {
    return (
      <span className={className + " flex flex-col items-center gap-2"}>
        <div className="relative w-24 h-24">
          <Image
            src={preview}
            alt={alt}
            fill
            className="object-cover rounded border-2 border-acid-magenta"
            unoptimized={true}
          />
        </div>
        <input type="file" accept="image/*" onChange={handleFile} />
        <div className="flex gap-2">
          <button onClick={save} className="text-green-400 font-bold px-2">✔️</button>
          <button onClick={cancel} className="text-red-400 font-bold px-2">✖️</button>
        </div>
      </span>
    );
  }
  return (
    <span className={className + " group relative cursor-pointer hover:opacity-80 transition"}>
      <div className="relative w-24 h-24">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover rounded border border-acid-magenta"
          unoptimized={true}
        />
      </div>
      <button
        className="absolute bottom-1 right-1 text-acid-magenta bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
        onClick={startEdit}
        aria-label="Edit image"
        tabIndex={0}
        style={{ fontSize: 18 }}
      >
        🖊️
      </button>
    </span>
  );
}

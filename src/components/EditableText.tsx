"use client";
import { useState } from "react";

export default function EditableText({ value, onSave, className = "" }: { value: string; onSave: (v: string) => void; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function startEdit() {
    setDraft(value);
    setEditing(true);
  }
  function save() {
    onSave(draft);
    setEditing(false);
  }
  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <span className={className + " flex items-center gap-2"}>
        <input
          className="px-2 py-1 rounded bg-[#222] text-white border border-acid-magenta focus:outline-none focus:ring-2 focus:ring-acid-magenta"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          autoFocus
        />
        <button onClick={save} className="text-green-400 font-bold px-2">✔️</button>
        <button onClick={cancel} className="text-red-400 font-bold px-2">✖️</button>
      </span>
    );
  }
  return (
    <span className={className + " group relative cursor-pointer hover:bg-acid-magenta/10 rounded px-1 transition"}>
      {value}
      <button
        className="ml-1 text-acid-magenta opacity-0 group-hover:opacity-100 transition absolute right-0 top-1/2 -translate-y-1/2"
        onClick={startEdit}
        aria-label="Edit text"
        tabIndex={0}
      >
        🖊️
      </button>
    </span>
  );
} 
"use client";
import { useState } from "react";

export default function EditableColor({ value, onSave, className = "" }: { value: string; onSave: (v: string) => void; className?: string }) {
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
          type="color"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          className="w-8 h-8 border-2 border-acid-magenta rounded"
        />
        <button onClick={save} className="text-green-400 font-bold px-2">✔️</button>
        <button onClick={cancel} className="text-red-400 font-bold px-2">✖️</button>
      </span>
    );
  }
  return (
    <span className={className + " group relative cursor-pointer hover:opacity-80 transition flex items-center gap-2"}>
      <span className="w-8 h-8 rounded border-2 border-acid-magenta inline-block" style={{ background: value }} />
      <button
        className="ml-1 text-acid-magenta opacity-0 group-hover:opacity-100 transition"
        onClick={startEdit}
        aria-label="Edit color"
        tabIndex={0}
      >
        🖊️
      </button>
    </span>
  );
} 
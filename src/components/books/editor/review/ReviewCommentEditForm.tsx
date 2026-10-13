"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";

interface Props {
  initialText: string;
  onSave: (newText: string) => Promise<void> | void;
  onCancel: () => void;
}

export function ReviewCommentEditForm({ initialText, onSave, onCancel }: Props) {
  const [text, setText] = useState(initialText);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await onSave(text.trim());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-1">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        className="w-full text-xs p-2 rounded-lg border border-control-border bg-background text-foreground focus:outline-hidden focus:border-primary resize-none"
        autoFocus
      />
      <div className="flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-2 py-1 rounded text-xs font-bold text-muted hover:text-foreground cursor-pointer flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          <span>Cancelar</span>
        </button>
        <button
          type="submit"
          disabled={!text.trim() || isSaving}
          className="px-2.5 py-1 rounded bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover disabled:opacity-40 cursor-pointer flex items-center gap-1"
        >
          <Check className="w-3 h-3" />
          <span>{isSaving ? "Salvando..." : "Salvar"}</span>
        </button>
      </div>
    </form>
  );
}


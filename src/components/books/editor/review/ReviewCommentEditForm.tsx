"use client";

import { useId } from "react";
import { Check, X } from "lucide-react";

interface Props {
  text: string;
  onChange: (text: string) => void;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function ReviewCommentEditForm({ text, onChange, isSaving, onSave, onCancel }: Props) {
  const id = useId();
  return (
    <form onSubmit={(event) => { event.preventDefault(); if (text.trim() && !isSaving) onSave(); }}
      className="flex flex-col gap-2 pt-1">
      <label htmlFor={id} className="text-xs font-bold text-foreground">Editar comentário</label>
      <textarea id={id} value={text} onChange={(event) => onChange(event.target.value)} rows={3} autoFocus readOnly={isSaving}
        className="w-full text-xs p-2 rounded-lg border border-control-border bg-background text-foreground focus:outline-hidden focus:border-primary resize-y" />
      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={isSaving}
          className="px-2 py-1 rounded text-xs font-bold text-muted hover:text-foreground flex items-center gap-1">
          <X aria-hidden="true" className="w-3 h-3" /> Cancelar
        </button>
        <button type="submit" disabled={!text.trim() || isSaving}
          className="px-3 py-1 rounded bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover disabled:opacity-50 flex items-center gap-1">
          <Check aria-hidden="true" className="w-3 h-3" /> {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}


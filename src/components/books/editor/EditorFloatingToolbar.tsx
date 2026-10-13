"use client";

import React from "react";
import { Bold, Italic, MessageSquarePlus, Quote, Underline } from "lucide-react";
import type { FormatAction } from "@/utils/textFormatting";
import type { SelectionPosition } from "@/hooks/useSelectionToolbar";

interface Props {
  position: SelectionPosition | null;
  onFormat: (action: FormatAction) => void;
  onComment: () => void;
}

export function EditorFloatingToolbar({ position, onFormat, onComment }: Props) {
  if (!position) return null;

  const btnClass =
    "p-1.5 rounded hover:bg-surface-hover text-foreground hover:text-primary transition-colors cursor-pointer";

  return (
    <div
      style={{ top: position.top, left: position.left }}
      className="fixed z-50 transform -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-xl bg-surface border border-border shadow-xl backdrop-blur-md select-none animate-in fade-in zoom-in-95 duration-150"
      onMouseDown={(e) => e.preventDefault()}
    >
      <button type="button" onClick={() => onFormat("bold")} className={btnClass} title="Negrito">
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => onFormat("italic")} className={btnClass} title="Itálico">
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => onFormat("underline")} className={btnClass} title="Sublinhado">
        <Underline className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => onFormat("quote")} className={btnClass} title="Citação">
        <Quote className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-border mx-1" />

      <button
        type="button"
        onClick={onComment}
        className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        title="Comentar trecho selecionado"
      >
        <MessageSquarePlus className="w-3.5 h-3.5" />
        <span>Comentar</span>
      </button>
    </div>
  );
}


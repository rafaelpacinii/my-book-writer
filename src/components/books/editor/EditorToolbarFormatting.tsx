"use client";

import React from "react";
import { Minus, Quote, Sparkles, Undo2, Redo2 } from "lucide-react";
import type { FormatAction } from "@/utils/textFormatting";

interface Props {
  onFormat: (action: FormatAction) => void;
  onUndo: () => void;
  onRedo: () => void;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
}

export function EditorToolbarFormatting({
  onFormat, onUndo, onRedo, isBold, isItalic, isUnderline,
}: Props) {
  const btn = (active?: boolean) =>
    `p-1.5 rounded-md transition-colors cursor-pointer text-xs ${
      active ? "bg-primary-soft text-primary font-bold" : "text-muted hover:text-foreground hover:bg-surface-hover"
    }`;

  return (
    <div className="flex items-center gap-1">
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("bold")} className={`${btn(isBold)} font-bold text-sm w-7 h-7 flex items-center justify-center`} title="Negrito (Ctrl+B)">B</button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("italic")} className={`${btn(isItalic)} font-serif italic text-sm w-7 h-7 flex items-center justify-center`} title="Itálico (Ctrl+I)">I</button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("underline")} className={`${btn(isUnderline)} underline text-sm w-7 h-7 flex items-center justify-center`} title="Sublinhado (Ctrl+U)">U</button>
      <div className="w-[1px] h-4 bg-border mx-1" />
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("dialogue-dash")} className={btn()} title="Travessão de diálogo (—)"><Minus className="w-3.5 h-3.5" /></button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("quote")} className={btn()} title="Citação / Destaque"><Quote className="w-3.5 h-3.5" /></button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("scene-break")} className={btn()} title="Quebra de cena (* * *)"><Sparkles className="w-3.5 h-3.5" /></button>
      <div className="w-[1px] h-4 bg-border mx-1" />
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onUndo} className={btn()} title="Desfazer (Ctrl+Z)"><Undo2 className="w-3.5 h-3.5" /></button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onRedo} className={btn()} title="Refazer (Ctrl+Y)"><Redo2 className="w-3.5 h-3.5" /></button>
    </div>
  );
}


"use client";

import React from "react";
import {
  Bold, Italic, Underline, Minus, Quote, Sparkles,
  AlignLeft, AlignCenter, AlignJustify, Undo2, Redo2,
} from "lucide-react";
import type { FormatAction } from "@/utils/textFormatting";

interface Props {
  onFormat: (action: FormatAction) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
}

export function EditorToolbar({
  onFormat, onUndo, onRedo, canUndo = true, canRedo = true,
  isBold, isItalic, isUnderline,
}: Props) {
  const btn = (active?: boolean) =>
    `p-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${active ? "bg-primary-soft text-primary font-bold" : "text-muted hover:text-foreground hover:bg-surface-hover"
    }`;

  return (
    <div className="flex items-center gap-1 py-1.5 px-2 rounded-lg border border-border bg-surface shadow-xs text-xs select-none w-fit overflow-x-auto max-w-full">
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onUndo} disabled={!canUndo} className={btn()} title="Desfazer (Ctrl+Z)"><Undo2 className="w-3.5 h-3.5" /></button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onRedo} disabled={!canRedo} className={btn()} title="Refazer (Ctrl+Y)"><Redo2 className="w-3.5 h-3.5" /></button>
      <div className="w-[1px] h-4 bg-border/60 mx-1" />
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("bold")} className={btn(isBold)} title="Negrito (Ctrl+B)"><Bold className="w-3.5 h-3.5" /></button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("italic")} className={btn(isItalic)} title="Itálico (Ctrl+I)"><Italic className="w-3.5 h-3.5" /></button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("underline")} className={btn(isUnderline)} title="Sublinhado (Ctrl+U)"><Underline className="w-3.5 h-3.5" /></button>
      <div className="w-[1px] h-4 bg-border/60 mx-1" />
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("dialogue-dash")} className={btn()} title="Travessão de diálogo (—)"><Minus className="w-3.5 h-3.5" /></button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("quote")} className={btn()} title="Citação / Destaque"><Quote className="w-3.5 h-3.5" /></button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("scene-break")} className={btn()} title="Quebra de cena (* * *)"><Sparkles className="w-3.5 h-3.5" /></button>
      <div className="w-[1px] h-4 bg-border/60 mx-1" />
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("align-left")} className={btn()} title="Alinhar à esquerda"><AlignLeft className="w-3.5 h-3.5" /></button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("align-center")} className={btn()} title="Centralizar"><AlignCenter className="w-3.5 h-3.5" /></button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onFormat("justify")} className={btn()} title="Justificar"><AlignJustify className="w-3.5 h-3.5" /></button>
    </div>
  );
}

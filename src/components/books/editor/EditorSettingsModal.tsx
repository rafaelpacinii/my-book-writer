"use client";

import React, { useState, useEffect } from "react";
import type { Book, UpdateBookInput } from "@/types/book";
import type { BookFormat, FontPreset } from "@/types/catalog";
import { EditorSettingsFields } from "./EditorSettingsFields";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  formats: BookFormat[];
  fonts: FontPreset[];
  onSave: (input: UpdateBookInput) => Promise<boolean>;
}

export function EditorSettingsModal({ isOpen, onClose, book, formats, fonts, onSave }: Props) {
  const [formatId, setFormatId] = useState("");
  const [fontId, setFontId] = useState("");
  const [fontSize, setFontSize] = useState(11);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [margins, setMargins] = useState({ top: 20, bottom: 20, left: 20, right: 20 });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!book) return;
    setFormatId(book.format_id);
    setFontId(book.font_preset_id);
    setFontSize(book.font_size_pt);
    setLineHeight(book.line_height_ratio);
    setMargins({
      top: Math.round(book.margin_top_um / 1000), bottom: Math.round(book.margin_bottom_um / 1000),
      left: Math.round(book.margin_left_um / 1000), right: Math.round(book.margin_right_um / 1000),
    });
  }, [book, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({
      format_id: formatId, font_preset_id: fontId, font_size_pt: fontSize, line_height_ratio: lineHeight,
      margin_top_um: margins.top * 1000, margin_bottom_um: margins.bottom * 1000,
      margin_left_um: margins.left * 1000, margin_right_um: margins.right * 1000,
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-base font-bold text-foreground mb-1">Configurações do Livro</h3>
        <p className="text-xs text-muted mb-4">Ajuste o formato, fonte paginada, entrelinha e margens.</p>
        <EditorSettingsFields formats={formats} fonts={fonts} formatId={formatId} setFormatId={setFormatId} fontId={fontId} setFontId={setFontId} fontSize={fontSize} setFontSize={setFontSize} lineHeight={lineHeight} setLineHeight={setLineHeight} margins={margins} setMargins={setMargins} />
        <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-border">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-muted hover:text-foreground">Cancelar</button>
          <button type="button" disabled={isSaving} onClick={handleSave} className="px-4 py-1.5 text-xs bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary-hover">{isSaving ? "Salvando..." : "Salvar alterações"}</button>
        </div>
      </div>
    </div>
  );
}


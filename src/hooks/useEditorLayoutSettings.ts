"use client";

import { useEffect, useState } from "react";
import { validateBookLayout } from "@/utils/bookMeasurements";
import type { EditorSettingsProps } from "@/components/books/editor/editorSettingsTypes";

export function useEditorLayoutSettings({ book, formats, isOpen, onSave, onClose }: EditorSettingsProps) {
  const [formatId, setFormatId] = useState("");
  const [fontId, setFontId] = useState("");
  const [fontSize, setFontSize] = useState(11);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [margins, setMargins] = useState({ top: 20, bottom: 20, left: 20, right: 20 });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!book || !isOpen) return;
    setFormatId(book.format_id);
    setFontId(book.font_preset_id);
    setFontSize(book.font_size_pt);
    setLineHeight(book.line_height_ratio);
    setMargins({
      top: book.margin_top_um / 1000, bottom: book.margin_bottom_um / 1000,
      left: book.margin_left_um / 1000, right: book.margin_right_um / 1000,
    });
    setError(null);
  }, [book, isOpen]);

  const handleSave = async () => {
    if (isSaving) return;
    const validation = validateBookLayout(formats.find((format) => format.id === formatId), fontSize, lineHeight,
      [margins.top, margins.right, margins.bottom, margins.left]);
    if (validation) { setError(validation); return; }
    setIsSaving(true);
    setError(null);
    try {
      const saved = await onSave({
        format_id: formatId, font_preset_id: fontId, font_size_pt: fontSize, line_height_ratio: lineHeight,
        margin_top_um: Math.round(margins.top * 1000), margin_bottom_um: Math.round(margins.bottom * 1000),
        margin_left_um: Math.round(margins.left * 1000), margin_right_um: Math.round(margins.right * 1000),
      });
      if (saved) onClose();
      else setError("Não foi possível salvar a diagramação. Suas alterações foram mantidas; tente novamente.");
    } catch {
      setError("Não foi possível salvar a diagramação. Suas alterações foram mantidas; tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formatId, setFormatId, fontId, setFontId, fontSize, setFontSize, lineHeight, setLineHeight, margins, setMargins,
    isSaving, error, handleSave, close: () => { if (!isSaving) onClose(); },
  };
}

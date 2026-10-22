"use client";

import React, { useId } from "react";
import type { BookFormat, FontPreset } from "@/types/catalog";
import { BookMarginInput } from "@/components/shared/BookMarginInput";
import { useMeasurementUnit } from "@/hooks/useMeasurementUnit";
import { formatBookFormat } from "@/utils/bookMeasurements";

interface Props {
  formats: BookFormat[];
  fonts: FontPreset[];
  formatId: string;
  setFormatId: (v: string) => void;
  fontId: string;
  setFontId: (v: string) => void;
  fontSize: number;
  setFontSize: (v: number) => void;
  lineHeight: number;
  setLineHeight: (v: number) => void;
  margins: { top: number; bottom: number; left: number; right: number };
  setMargins: React.Dispatch<React.SetStateAction<{ top: number; bottom: number; left: number; right: number }>>;
}

export function EditorSettingsFields(p: Props) {
  const id = useId();
  const { unit } = useMeasurementUnit();
  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${id}-format`} className="text-xs font-semibold text-foreground mb-1 block">Formato</label>
          <select id={`${id}-format`} value={p.formatId} onChange={(e) => p.setFormatId(e.target.value)} className="w-full text-xs bg-surface border border-border rounded-md p-2">
            {p.formats.map((f) => (
              <option key={f.id} value={f.id}>
                {formatBookFormat(f, unit)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-font`} className="text-xs font-semibold text-foreground mb-1 block">Fonte do livro</label>
          <select id={`${id}-font`} value={p.fontId} onChange={(e) => p.setFontId(e.target.value)} className="w-full text-xs bg-surface border border-border rounded-md p-2">
            {p.fonts.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${id}-size`} className="text-xs font-semibold text-foreground mb-1 block">Tamanho da fonte (pt)</label>
          <input id={`${id}-size`} type="number" step="0.5" min="8" max="24" value={p.fontSize} onChange={(e) => p.setFontSize(Number(e.target.value))} className="w-full text-xs bg-surface border border-border rounded-md p-2" />
        </div>
        <div>
          <label htmlFor={`${id}-line`} className="text-xs font-semibold text-foreground mb-1 block">Entrelinha</label>
          <input id={`${id}-line`} type="number" step="0.1" min="1" max="3" value={p.lineHeight} onChange={(e) => p.setLineHeight(Number(e.target.value))} className="w-full text-xs bg-surface border border-border rounded-md p-2" />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Margens</p>
        <div className="grid grid-cols-4 gap-2">
          <BookMarginInput label="Sup." valueMm={p.margins.top} onChange={(v) => p.setMargins((m) => ({ ...m, top: v }))} />
          <BookMarginInput label="Inf." valueMm={p.margins.bottom} onChange={(v) => p.setMargins((m) => ({ ...m, bottom: v }))} />
          <BookMarginInput label="Esq." valueMm={p.margins.left} onChange={(v) => p.setMargins((m) => ({ ...m, left: v }))} />
          <BookMarginInput label="Dir." valueMm={p.margins.right} onChange={(v) => p.setMargins((m) => ({ ...m, right: v }))} />
        </div>
      </div>
    </div>
  );
}

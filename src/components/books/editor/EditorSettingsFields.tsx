"use client";

import React from "react";
import type { BookFormat, FontPreset } from "@/types/catalog";
import { BookMarginInput } from "@/components/shared/BookMarginInput";

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
  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Formato</label>
          <select value={p.formatId} onChange={(e) => p.setFormatId(e.target.value)} className="w-full text-xs bg-surface border border-border rounded-md p-2">
            {p.formats.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({Math.round(f.width_um / 1000)}×{Math.round(f.height_um / 1000)}mm)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Fonte Paginada</label>
          <select value={p.fontId} onChange={(e) => p.setFontId(e.target.value)} className="w-full text-xs bg-surface border border-border rounded-md p-2">
            {p.fonts.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Tamanho da fonte (pt)</label>
          <input type="number" step="0.5" min="8" max="24" value={p.fontSize} onChange={(e) => p.setFontSize(Number(e.target.value))} className="w-full text-xs bg-surface border border-border rounded-md p-2" />
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">Entrelinha</label>
          <input type="number" step="0.1" min="1" max="3" value={p.lineHeight} onChange={(e) => p.setLineHeight(Number(e.target.value))} className="w-full text-xs bg-surface border border-border rounded-md p-2" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Margens (mm)</label>
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

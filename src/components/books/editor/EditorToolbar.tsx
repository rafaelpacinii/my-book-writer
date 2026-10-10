"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";
import type { FormatAction } from "@/utils/textFormatting";
import type { FontPreset } from "@/types/catalog";
import { EditorFontSelector } from "./EditorFontSelector";
import { EditorFontSizeSelector } from "./EditorFontSizeSelector";
import { EditorToolbarFormatting } from "./EditorToolbarFormatting";

interface Props {
  onFormat: (action: FormatAction) => void;
  onUndo: () => void;
  onRedo: () => void;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  fonts?: FontPreset[];
  currentFontId?: string;
  onSelectFont?: (fontId: string) => void;
  fontSizePt?: number;
  onSelectFontSize?: (pt: number) => void;
  onOpenSettings?: () => void;
  viewMode: "continuous" | "paged";
  onViewModeChange: (mode: "continuous" | "paged") => void;
}

export function EditorToolbar({
  onFormat, onUndo, onRedo, isBold, isItalic, isUnderline,
  fonts = [], currentFontId, onSelectFont, fontSizePt = 11, onSelectFontSize,
  onOpenSettings, viewMode, onViewModeChange,
}: Props) {
  const modeBtn = (active: boolean) =>
    `px-3 py-1.5 rounded-md font-bold text-xs transition-colors cursor-pointer ${
      active ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
    }`;

  return (
    <div className="h-[59px] px-6 border-b border-border bg-surface flex items-center justify-between select-none shrink-0 overflow-x-auto">
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        <span className="font-bold text-foreground">Parágrafo</span>
        {fonts.length > 0 && onSelectFont && (
          <EditorFontSelector fonts={fonts} currentFontId={currentFontId} onSelectFont={onSelectFont} />
        )}
        {onSelectFontSize && (
          <EditorFontSizeSelector fontSizePt={fontSizePt} onSelectFontSize={onSelectFontSize} />
        )}
        {onOpenSettings && (
          <button type="button" onClick={onOpenSettings} className="p-1.5 text-muted hover:text-foreground hover:bg-surface-hover rounded-md transition-colors" title="Configurações de formatação do livro">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}
        <div className="w-[1px] h-4 bg-border mx-1" />
        <EditorToolbarFormatting onFormat={onFormat} onUndo={onUndo} onRedo={onRedo} isBold={isBold} isItalic={isItalic} isUnderline={isUnderline} />
      </div>

      <div className="hidden sm:flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border">
        <button type="button" onClick={() => onViewModeChange("continuous")} className={modeBtn(viewMode === "continuous")}>Contínuo</button>
        <button type="button" onClick={() => onViewModeChange("paged")} className={modeBtn(viewMode === "paged")}>Paginado</button>
      </div>
    </div>
  );
}

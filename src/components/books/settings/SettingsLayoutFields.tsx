"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface Props {
  fontSize: number; setFontSize: (v: number) => void;
  lineHeight: number; setLineHeight: (v: number) => void;
  marginTopMm: number; setMarginTopMm: (v: number) => void;
  marginBottomMm: number; setMarginBottomMm: (v: number) => void;
  marginLeftMm: number; setMarginLeftMm: (v: number) => void;
  marginRightMm: number; setMarginRightMm: (v: number) => void;
}

export function SettingsLayoutFields(props: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const { fontSize, setFontSize, lineHeight, setLineHeight } = props;
  const { marginTopMm, setMarginTopMm, marginBottomMm, setMarginBottomMm } = props;
  const { marginLeftMm, setMarginLeftMm, marginRightMm, setMarginRightMm } = props;

  return (
    <div className="pt-4 border-t border-border">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-xs font-bold text-muted hover:text-foreground transition-colors cursor-pointer py-1"
      >
        <span>Diagramação · fonte, entrelinha e margens</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="flex flex-col gap-4 mt-3 pt-3 border-t border-border/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Tamanho da fonte (pt)" type="number" step="0.5" min="8" max="32" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
            <Input label="Entrelinha" type="number" step="0.1" min="1" max="3" value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} />
          </div>

          <div>
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2.5">
              Margens em milímetros
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input label="Superior" type="number" min="5" max="60" value={marginTopMm} onChange={(e) => setMarginTopMm(Number(e.target.value))} />
              <Input label="Inferior" type="number" min="5" max="60" value={marginBottomMm} onChange={(e) => setMarginBottomMm(Number(e.target.value))} />
              <Input label="Esquerda" type="number" min="5" max="60" value={marginLeftMm} onChange={(e) => setMarginLeftMm(Number(e.target.value))} />
              <Input label="Direita" type="number" min="5" max="60" value={marginRightMm} onChange={(e) => setMarginRightMm(Number(e.target.value))} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

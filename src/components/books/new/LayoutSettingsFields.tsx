"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface Props {
  fontSize: number;
  setFontSize: (v: number) => void;
  lineHeight: number;
  setLineHeight: (v: number) => void;
  marginMm: number;
  setMarginMm: (v: number) => void;
}

export function LayoutSettingsFields(props: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { fontSize, setFontSize, lineHeight, setLineHeight, marginMm, setMarginMm } = props;

  return (
    <div className="pt-3 border-t border-border">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-xs font-bold text-muted hover:text-foreground transition-colors cursor-pointer py-1"
      >
        <span>Diagramação · fonte, entrelinha e margens</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3.5 pt-3 border-t border-border/60">
          <Input
            label="Tamanho da fonte (pt)"
            type="number"
            step="0.5"
            min="8"
            max="32"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
          <Input
            label="Entrelinha"
            type="number"
            step="0.1"
            min="1"
            max="3"
            value={lineHeight}
            onChange={(e) => setLineHeight(Number(e.target.value))}
          />
          <Input
            label="Margens padrão (mm)"
            type="number"
            min="5"
            max="60"
            value={marginMm}
            onChange={(e) => setMarginMm(Number(e.target.value))}
          />
        </div>
      )}
    </div>
  );
}

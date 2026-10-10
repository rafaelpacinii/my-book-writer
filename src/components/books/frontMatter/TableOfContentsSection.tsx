"use client";

import React, { ChangeEvent } from "react";
import { Checkbox } from "@/components/ui/Checkbox";

interface Props {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  chapterCount: number;
}

export function TableOfContentsSection({ enabled, onToggle, chapterCount }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border bg-surface-hover/30">
        <Checkbox
          id="toc-toggle"
          checked={enabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onToggle(e.target.checked)}
        />
        <div className="space-y-1">
          <label htmlFor="toc-toggle" className="text-sm font-semibold text-foreground cursor-pointer">
            Incluir Sumário Automático
          </label>
          <p className="text-xs text-muted leading-relaxed">
            O sumário lista os títulos dos capítulos e suas páginas iniciais. O sistema calcula a numeração automaticamente a partir da diagramação do miolo.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-lg border border-border/80 bg-background/50 text-xs text-muted space-y-1">
        <p className="font-semibold text-foreground">Status do Sumário:</p>
        <p>• {chapterCount} capítulo(s) atualmente incluído(s) no livro.</p>
        <p>• A numeração e pontilhados são atualizados em tempo real na diagramação.</p>
      </div>
    </div>
  );
}


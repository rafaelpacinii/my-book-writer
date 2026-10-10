"use client";

import React, { ChangeEvent } from "react";
import { Checkbox } from "@/components/ui/Checkbox";

interface Props {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  title: string;
  author: string;
}

export function HalfTitleSection({ enabled, onToggle, title, author }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border bg-surface-hover/30">
        <Checkbox
          id="half-title-toggle"
          checked={enabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onToggle(e.target.checked)}
        />
        <div className="space-y-1">
          <label htmlFor="half-title-toggle" className="text-sm font-semibold text-foreground cursor-pointer">
            Incluir Falsa Folha de Rosto
          </label>
          <p className="text-xs text-muted leading-relaxed">
            É a primeira página do livro, antes da folha de rosto. Contém apenas o título e o autor, protegendo o miolo e abrindo a obra com elegância.
          </p>
        </div>
      </div>

      {enabled && (
        <div className="p-4 rounded-lg border border-border/80 bg-background/50 flex flex-col items-center justify-center py-8 text-center">
          <p className="text-[11px] font-bold text-muted/60 uppercase tracking-widest mb-3">Prévia do Conteúdo</p>
          <h4 className="font-serif text-lg font-bold text-foreground">{title || "Título do Livro"}</h4>
          <p className="font-serif text-xs text-muted mt-2">{author || "Nome do Autor"}</p>
        </div>
      )}
    </div>
  );
}


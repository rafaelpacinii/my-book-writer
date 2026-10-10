"use client";

import React, { ChangeEvent } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";

interface Props {
  includeDedication: boolean;
  onToggleDedication: (v: boolean) => void;
  dedicationText: string;
  onDedicationChange: (v: string) => void;
  includeEpigraph: boolean;
  onToggleEpigraph: (v: boolean) => void;
  epigraphText: string;
  onEpigraphTextChange: (v: string) => void;
  epigraphAuthor: string;
  onEpigraphAuthorChange: (v: string) => void;
}

export function DedicationEpigraphSection(p: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border bg-surface-hover/30">
          <Checkbox id="dedication-toggle" checked={p.includeDedication} onChange={(e: ChangeEvent<HTMLInputElement>) => p.onToggleDedication(e.target.checked)} />
          <div className="space-y-1">
            <label htmlFor="dedication-toggle" className="text-sm font-semibold text-foreground cursor-pointer">
              Incluir Página de Dedicatória
            </label>
            <p className="text-xs text-muted">Texto pessoal de homenagem do autor a pessoas especiais.</p>
          </div>
        </div>
        {p.includeDedication && (
          <Input label="Texto da dedicatória" value={p.dedicationText} onChange={(e) => p.onDedicationChange(e.target.value)} placeholder="Ex.: Para meus pais, que sempre acreditaram..." />
        )}
      </div>

      <div className="space-y-3 pt-2 border-t border-border/60">
        <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border bg-surface-hover/30">
          <Checkbox id="epigraph-toggle" checked={p.includeEpigraph} onChange={(e: ChangeEvent<HTMLInputElement>) => p.onToggleEpigraph(e.target.checked)} />
          <div className="space-y-1">
            <label htmlFor="epigraph-toggle" className="text-sm font-semibold text-foreground cursor-pointer">
              Incluir Página de Epígrafe
            </label>
            <p className="text-xs text-muted">Citação literária ou filosófica que introduz o tema da obra.</p>
          </div>
        </div>
        {p.includeEpigraph && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Citação da epígrafe" value={p.epigraphText} onChange={(e) => p.onEpigraphTextChange(e.target.value)} placeholder="Ex.: O essencial é invisível aos olhos." />
            <Input label="Autor da citação" value={p.epigraphAuthor} onChange={(e) => p.onEpigraphAuthorChange(e.target.value)} placeholder="Ex.: Antoine de Saint-Exupéry" />
          </div>
        )}
      </div>
    </div>
  );
}


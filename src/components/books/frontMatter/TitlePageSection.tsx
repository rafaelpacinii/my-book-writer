"use client";

import React, { ChangeEvent } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";

interface Props {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  subtitle: string;
  onSubtitleChange: (v: string) => void;
  publisher: string;
  onPublisherChange: (v: string) => void;
  edition: string;
  onEditionChange: (v: string) => void;
  year: number | "";
  onYearChange: (v: number | "") => void;
  city: string;
  onCityChange: (v: string) => void;
}

export function TitlePageSection(p: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border bg-surface-hover/30">
        <Checkbox id="title-page-toggle" checked={p.enabled} onChange={(e: ChangeEvent<HTMLInputElement>) => p.onToggle(e.target.checked)} />
        <div className="space-y-1">
          <label htmlFor="title-page-toggle" className="text-sm font-semibold text-foreground cursor-pointer">
            Incluir Folha de Rosto (Frontispício)
          </label>
          <p className="text-xs text-muted leading-relaxed">
            Obrigatória na editoração. Traz as informações catalográficas essenciais da obra.
          </p>
        </div>
      </div>

      {p.enabled && (
        <div className="space-y-3 pt-1">
          <Input label="Subtítulo da obra (opcional)" value={p.subtitle} onChange={(e) => p.onSubtitleChange(e.target.value)} placeholder="Ex.: Uma jornada de mistério e redenção" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Editora / Selo" value={p.publisher} onChange={(e) => p.onPublisherChange(e.target.value)} placeholder="Ex.: Publicação Independente" />
            <Input label="Número da Edição" value={p.edition} onChange={(e) => p.onEditionChange(e.target.value)} placeholder="1ª edição" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Ano de Publicação" type="number" value={p.year} onChange={(e) => p.onYearChange(e.target.value ? Number(e.target.value) : "")} placeholder="2026" />
            <Input label="Cidade / Local de Publicação" value={p.city} onChange={(e) => p.onCityChange(e.target.value)} placeholder="Ex.: São Paulo, SP" />
          </div>
        </div>
      )}
    </div>
  );
}


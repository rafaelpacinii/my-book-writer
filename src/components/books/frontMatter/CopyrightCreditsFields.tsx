"use client";

import React from "react";
import { Input } from "@/components/ui/Input";

interface Props {
  coverDesigner: string;
  onCoverChange: (v: string) => void;
  proofreader: string;
  onProofreaderChange: (v: string) => void;
  layoutDesigner: string;
  onLayoutChange: (v: string) => void;
}

export function CopyrightCreditsFields(p: Props) {
  return (
    <div className="space-y-2 pt-2 border-t border-border/60">
      <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Créditos da Equipe</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input label="Capa / Ilustração" value={p.coverDesigner} onChange={(e) => p.onCoverChange(e.target.value)} placeholder="Nome do capista" />
        <Input label="Revisão de Texto" value={p.proofreader} onChange={(e) => p.onProofreaderChange(e.target.value)} placeholder="Nome do revisor" />
        <Input label="Diagramação" value={p.layoutDesigner} onChange={(e) => p.onLayoutChange(e.target.value)} placeholder="My Book Writer" />
      </div>
    </div>
  );
}


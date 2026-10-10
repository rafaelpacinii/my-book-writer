"use client";

import React, { ChangeEvent } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { CopyrightCreditsFields } from "./CopyrightCreditsFields";

interface Props {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  copyright: string;
  onCopyrightChange: (v: string) => void;
  isbnPrint: string;
  onIsbnPrintChange: (v: string) => void;
  isbnDigital: string;
  onIsbnDigitalChange: (v: string) => void;
  coverDesigner: string;
  onCoverChange: (v: string) => void;
  proofreader: string;
  onProofreaderChange: (v: string) => void;
  layoutDesigner: string;
  onLayoutChange: (v: string) => void;
}

export function CopyrightSection(p: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border bg-surface-hover/30">
        <Checkbox id="copyright-toggle" checked={p.enabled} onChange={(e: ChangeEvent<HTMLInputElement>) => p.onToggle(e.target.checked)} />
        <div className="space-y-1">
          <label htmlFor="copyright-toggle" className="text-sm font-semibold text-foreground cursor-pointer">
            Incluir Folha de Copyright e Créditos
          </label>
          <p className="text-xs text-muted leading-relaxed">
            Fica no verso da folha de rosto. Apresenta direitos autorais, ISBN e ficha de créditos.
          </p>
        </div>
      </div>

      {p.enabled && (
        <div className="space-y-3 pt-1">
          <Input label="Declaração de Copyright" value={p.copyright} onChange={(e) => p.onCopyrightChange(e.target.value)} placeholder="© 2026 Autor. Todos os direitos reservados." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="ISBN (Livro Impresso)" value={p.isbnPrint} onChange={(e) => p.onIsbnPrintChange(e.target.value)} placeholder="Ex.: 978-65-00-00000-0" />
            <Input label="ISBN (eBook Digital)" value={p.isbnDigital} onChange={(e) => p.onIsbnDigitalChange(e.target.value)} placeholder="Ex.: 978-65-00-00000-1" />
          </div>
          <CopyrightCreditsFields coverDesigner={p.coverDesigner} onCoverChange={p.onCoverChange} proofreader={p.proofreader} onProofreaderChange={p.onProofreaderChange} layoutDesigner={p.layoutDesigner} onLayoutChange={p.onLayoutChange} />
        </div>
      )}
    </div>
  );
}


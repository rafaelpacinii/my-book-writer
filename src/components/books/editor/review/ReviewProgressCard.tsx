"use client";

import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  needsRecheck: boolean;
  onToggle: () => void;
}

export function ReviewProgressCard({ needsRecheck, onToggle }: Props) {
  return (
    <div
      className={`p-3.5 rounded-xl border transition-colors ${
        needsRecheck
          ? "bg-warning/10 border-warning/30 text-warning"
          : "bg-surface-hover/50 border-border text-muted"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {needsRecheck ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-warning" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">
              {needsRecheck ? "Revisão pendente" : "Capítulo sem pendências"}
            </p>
            <p className="text-[11px] text-muted truncate">
              {needsRecheck ? "Sinalizado para rever trechos" : "Leitura em dia"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer shrink-0 ${
            needsRecheck
              ? "bg-warning text-primary-foreground border-transparent hover:opacity-90"
              : "border-control-border hover:bg-surface text-foreground"
          }`}
        >
          {needsRecheck ? "Concluir" : "Sinalizar"}
        </button>
      </div>
    </div>
  );
}


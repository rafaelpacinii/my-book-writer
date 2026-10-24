"use client";

import React from "react";
import { RestoreVersionButton } from "./RestoreVersionButton";
import { Button } from "@/components/ui/Button";

interface Props {
  chapterTitle: string;
  versionNumber?: number;
  onRestore: () => Promise<boolean>;
  isLoading: boolean;
  onRefresh: () => void;
}

export function VersionsHeader(props: Props) {
  const { chapterTitle, versionNumber, onRestore } = props;

  return (
    <header className="z-20 flex min-h-[72px] shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 select-none">
      <span className="min-w-0 truncate text-xs text-muted">
        {chapterTitle || "Sem título"} · Histórico de Versões
      </span>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={props.isLoading} onClick={props.onRefresh}>Atualizar comparação</Button>
        {versionNumber !== undefined && <RestoreVersionButton versionNumber={versionNumber} disabled={props.isLoading} onRestore={onRestore} />}
      </div>
    </header>
  );
}


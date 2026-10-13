import React from "react";
import { VersionCard } from "./VersionCard";
import type { ChapterVersionSummary } from "@/types/chapterVersion";

interface Props {
  versions: ChapterVersionSummary[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function VersionList({ versions, selectedId, onSelect, onDelete }: Props) {
  if (versions.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-muted flex flex-col items-center gap-1">
        <span>Nenhum snapshot registrado ainda.</span>
        <span>Crie um snapshot manual ou ative o rastreamento.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {versions.map((v) => (
        <VersionCard
          key={v.id}
          version={v}
          isSelected={v.id === selectedId}
          onSelect={() => onSelect(v.id)}
          onDelete={() => onDelete(v.id)}
        />
      ))}
    </div>
  );
}


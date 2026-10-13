"use client";

import React, { useState } from "react";
import { VersionsSidebarItem } from "./VersionsSidebarItem";
import { DeleteVersionModal } from "./DeleteVersionModal";
import type { ChapterVersionSummary } from "@/types/chapterVersion";

interface Props {
  versions: ChapterVersionSummary[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

export function VersionsSidebar({ versions, selectedId, onSelect, onDelete }: Props) {
  const [target, setTarget] = useState<{ id: string; num: number } | null>(null);

  const handleConfirm = async () => {
    if (!target) return;
    await onDelete(target.id);
    setTarget(null);
  };

  return (
    <aside className="w-80 shrink-0 border-r border-border bg-surface flex flex-col h-full select-none">
      <div className="p-4 border-b border-border">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
          Snapshots salvos ({versions.length})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {versions.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted">
            Nenhum snapshot encontrado.
          </div>
        ) : (
          versions.map((ver) => (
            <VersionsSidebarItem
              key={ver.id}
              version={ver}
              isSelected={ver.id === selectedId}
              onSelect={() => onSelect(ver.id)}
              onDelete={() => setTarget({ id: ver.id, num: ver.version_number })}
            />
          ))
        )}
      </div>

      <DeleteVersionModal
        isOpen={Boolean(target)}
        onClose={() => setTarget(null)}
        onConfirm={handleConfirm}
        versionNumber={target?.num}
      />
    </aside>
  );
}

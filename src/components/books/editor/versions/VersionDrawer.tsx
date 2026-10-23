"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { VersionDrawerHeader } from "./VersionDrawerHeader";
import { VersionDrawerBody } from "./VersionDrawerBody";
import { useHistoryAction } from "@/hooks/useHistoryAction";
import { DeleteVersionModal } from "@/components/books/versions/DeleteVersionModal";
import type { VersionDrawerProps } from "./types";

export function VersionDrawer(props: VersionDrawerProps) {
  const { isOpen, onClose, versions, onDeleteVersion, bookId, chapterId } = props;
  const navigation = useHistoryAction(chapterId);
  const router = useRouter();
  const [versionToDelete, setVersionToDelete] = useState<{ id: string; versionNumber: number } | null>(null);

  if (!isOpen) return null;

  const handleSelect = (versionId: string) => {
    if (!bookId || !chapterId) return;
    void navigation.run(async () => {
      if (!await props.onBeforeNavigate()) throw new Error("Salve o rascunho antes de abrir a comparação.");
      router.push(
        `/books/versions?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(chapterId)}&versionId=${encodeURIComponent(versionId)}`
      );
    });
  };

  const handleRequestDelete = (versionId: string) => {
    const target = versions.find((v) => v.id === versionId);
    setVersionToDelete({ id: versionId, versionNumber: target?.version_number ?? 0 });
  };

  const handleConfirmDelete = async () => {
    if (!versionToDelete) return;
    await onDeleteVersion(versionToDelete.id);
    setVersionToDelete(null);
  };

  return (
    <aside aria-label="Histórico de versões" className="absolute inset-y-0 right-0 w-full max-w-sm min-[1100px]:static min-[1100px]:w-96 border-l border-border bg-surface flex flex-col shrink-0 h-full z-20">
      <VersionDrawerHeader
        count={versions.length}
        onClose={onClose}
        bookId={bookId}
        chapterId={chapterId}
      />
      <VersionDrawerBody {...props} error={navigation.error || props.error}
        onSelect={handleSelect} onDelete={handleRequestDelete} />
      <DeleteVersionModal
        isOpen={Boolean(versionToDelete)}
        onClose={() => setVersionToDelete(null)}
        onConfirm={handleConfirmDelete}
        versionNumber={versionToDelete?.versionNumber}
      />
    </aside>
  );
}

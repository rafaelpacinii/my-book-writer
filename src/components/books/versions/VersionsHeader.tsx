"use client";

import React from "react";
import { RestoreVersionButton } from "./RestoreVersionButton";
import { Button } from "@/components/ui/Button";
import { BookBreadcrumbs } from "@/components/shared/BookBreadcrumbs";

interface Props {
  bookId: string;
  chapterId: string;
  bookTitle: string;
  chapterTitle: string;
  versionNumber?: number;
  onRestore: () => Promise<boolean>;
  isLoading: boolean;
  onRefresh: () => void;
}

export function VersionsHeader(props: Props) {
  const { bookId, chapterId, bookTitle, chapterTitle, versionNumber, onRestore } = props;
  const editorUrl = `/books/editor?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(chapterId)}`;

  return (
    <header className="z-20 flex min-h-[72px] shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 select-none">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex flex-col min-w-0">
          <BookBreadcrumbs bookId={bookId} bookTitle={bookTitle} current="Histórico"
            ancestors={[{ label: "Editor", href: editorUrl }]} />
          <span className="text-xs text-muted truncate">
            {chapterTitle || "Sem título"} · Histórico de Versões
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={props.isLoading} onClick={props.onRefresh}>Atualizar comparação</Button>
        {versionNumber !== undefined && <RestoreVersionButton versionNumber={versionNumber} disabled={props.isLoading} onRestore={onRestore} />}
      </div>
    </header>
  );
}


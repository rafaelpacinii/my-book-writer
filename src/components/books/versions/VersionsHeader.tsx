"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface Props {
  bookId: string;
  chapterId: string;
  bookTitle: string;
  chapterTitle: string;
  versionNumber?: number;
  onRestore: () => Promise<boolean>;
}

export function VersionsHeader(props: Props) {
  const { bookId, chapterId, bookTitle, chapterTitle, versionNumber, onRestore } = props;
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    if (!window.confirm(`Tem certeza que deseja restaurar a Versão #${versionNumber}? O texto atual será salvo em um novo snapshot de segurança.`)) {
      return;
    }
    setIsRestoring(true);
    try {
      await onRestore();
    } finally {
      setIsRestoring(false);
    }
  };

  const editorUrl = `/books/editor?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(chapterId)}`;

  return (
    <header className="h-[72px] px-6 border-b border-border bg-surface flex items-center justify-between select-none shrink-0 z-20">
      <div className="flex items-center gap-4 min-w-0">
        <Link
          href={editorUrl}
          className="text-foreground hover:text-primary transition-colors cursor-pointer"
          title="Voltar ao editor"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-bold text-foreground truncate">
            {bookTitle || "Sem título"}
          </span>
          <span className="text-xs text-muted truncate">
            {chapterTitle || "Sem título"} · Histórico de Versões
          </span>
        </div>
      </div>

      {versionNumber !== undefined && (
        <button
          type="button"
          onClick={handleRestore}
          disabled={isRestoring}
          className="h-11 px-4 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-[13px] font-bold flex items-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restaurar versão #{versionNumber}</span>
        </button>
      )}
    </header>
  );
}


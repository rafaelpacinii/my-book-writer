import React from "react";
import Link from "next/link";
import { History, Maximize2, X } from "lucide-react";

interface Props {
  count: number;
  onClose: () => void;
  bookId?: string;
  chapterId?: string;
}

export function VersionDrawerHeader({ count, onClose, bookId, chapterId }: Props) {
  return (
    <div className="h-[72px] px-5 border-b border-border bg-surface flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
          <History className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">Histórico</span>
          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-surface-hover text-muted">
            {count} {count === 1 ? "versão" : "versões"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {bookId && chapterId && (
          <Link
            href={`/books/versions?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(chapterId)}`}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
            title="Abrir em tela cheia"
          >
            <Maximize2 className="w-4 h-4" />
          </Link>
        )}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
          title="Fechar histórico"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

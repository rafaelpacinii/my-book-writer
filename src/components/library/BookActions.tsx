"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useBookMenu } from "@/hooks/useBookMenu";

export function BookActions({ bookId, title }: { bookId: string; title: string }) {
  const ref = useBookMenu();
  const query = `?bookId=${encodeURIComponent(bookId)}`;

  return (
    <details ref={ref} className="absolute top-2 right-2 z-30">
      <summary aria-label={`Ações de ${title}`} title={`Ações de ${title}`}
        className="flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded text-muted hover:bg-surface [&::-webkit-details-marker]:hidden"
      >
        <MoreHorizontal className="h-4 w-4" />
      </summary>
      <div className="absolute right-0 mt-1 flex w-44 flex-col rounded-md border border-border bg-surface p-1 text-[11px] shadow-lg">
        <Link href={`/books/view${query}`} className="rounded p-2.5 hover:bg-surface-hover">Abrir livro</Link>
        <Link href={`/books/settings${query}`} className="rounded p-2.5 hover:bg-surface-hover">Configurar livro</Link>
        <Link href={`/books/preview${query}`} className="rounded p-2.5 hover:bg-surface-hover">Pré-visualizar</Link>
        <Link href={`/books/export${query}`} className="rounded p-2.5 hover:bg-surface-hover">Exportar livro</Link>
      </div>
    </details>
  );
}

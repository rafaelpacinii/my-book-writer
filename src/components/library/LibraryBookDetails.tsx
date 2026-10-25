import { BookOpen, Settings2 } from "lucide-react";
import { BookObject } from "@/components/shared/BookObject";
import { LinkButton } from "@/components/ui/LinkButton";
import { formatLastEdited } from "@/utils/format";
import type { Book } from "@/types/book";
import type { useLibrary } from "@/hooks/useLibrary";

export function LibraryBookDetails({ book, lib }: { book: Book; lib: ReturnType<typeof useLibrary> }) {
  const series = lib.collections.find((entry) => entry.kind === "series" && entry.collection.id === book.series_id);
  const universe = lib.collections.find((entry) => entry.kind === "universe" && entry.books.some((item) => item.id === book.id));
  const query = `?bookId=${encodeURIComponent(book.id)}`;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-center rounded-lg bg-background p-5"><BookObject book={book} /></div>
      <div><p className="editorial-eyebrow">Livro</p><h2 className="mt-2 font-display text-2xl">{book.title}</h2>
        <p className="mt-1 break-words text-xs text-muted">{book.author_name || "Autor"}</p></div>
      <dl>
        <div><dt>Universo</dt><dd>{universe?.collection.name ?? "Sem universo"}</dd></div>
        <div><dt>Série</dt><dd>{series?.collection.name ?? "Livro avulso"}{book.series_volume ? ` · Vol. ${book.series_volume}` : ""}</dd></div>
        <div><dt>Formato</dt><dd>{lib.formatMap.get(book.format_id) ?? "Formato do livro"}</dd></div>
        <div><dt>Atualização</dt><dd>{formatLastEdited(book.updated_at)}</dd></div>
      </dl>
      <LinkButton href={`/books/view${query}`}><BookOpen size={16} aria-hidden="true" />Abrir livro</LinkButton>
      <LinkButton href={`/books/settings${query}`} variant="outline"><Settings2 size={16} aria-hidden="true" />Configurar livro</LinkButton>
    </div>
  );
}

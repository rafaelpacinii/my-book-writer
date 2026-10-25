import type { DragEventHandler } from "react";
import Link from "next/link";
import type { Book } from "@/types/book";
import { formatLastEdited } from "@/utils/format";
import { BookCardCover } from "@/components/library/BookCardCover";
import { BookActions } from "@/components/library/BookActions";
import { BookSelectionButton } from "@/components/library/BookSelectionButton";

interface Props {
  book: Book;
  index: number;
  formatName?: string;
  fontName?: string;
  onMove?: () => void;
  onDragStart?: DragEventHandler<HTMLElement>;
  onDragEnd?: DragEventHandler<HTMLElement>;
  disabled?: boolean;
  onInspect?: (element: HTMLButtonElement) => void;
  selected?: boolean;
}

export function BookCard({ book, index, formatName, fontName, onMove, onDragStart, onDragEnd, disabled, onInspect, selected = false }: Props) {
  return (
    <article className="book-card relative min-w-0" data-book-id={book.id} data-selected={selected}
      draggable={Boolean(onDragStart) && !disabled} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {onInspect && <BookSelectionButton title={book.title} selected={selected} onInspect={onInspect} />}
      <BookCardCover book={book} index={index} />
      <BookActions bookId={book.id} title={book.title} onMove={onMove} disabled={disabled} />
      <div className="book-info min-w-0 px-px pt-[15px]">
        {book.series_id && book.series_volume != null && (
          <span className="mb-2 w-fit rounded bg-primary-soft px-2 py-1 text-xs font-semibold text-foreground">
            Vol. {book.series_volume}
          </span>
        )}
        <h2 className="font-display text-[23px] leading-[1.12]">
          <Link href={`/books/view?bookId=${encodeURIComponent(book.id)}`}
            className={`line-clamp-2 wrap-anywhere hover:text-primary ${onInspect ? "relative z-20" : "after:absolute after:inset-0 after:rounded-md after:content-['']"}`}
          >
            {book.title}
          </Link>
        </h2>
        <p className="mt-1.5 truncate text-[10px] text-muted">{book.author_name || "Autor"}</p>
        <div className="book-metadata mt-3 flex flex-wrap justify-between gap-x-3 gap-y-1 border-t border-border pt-2.5 text-[9px] text-muted">
          <span>{[formatName, fontName].filter(Boolean).join(" · ")}</span>
          <span>Atualizado {formatLastEdited(book.updated_at)}</span>
        </div>
      </div>
    </article>
  );
}

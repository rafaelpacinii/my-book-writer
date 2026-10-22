import Link from "next/link";
import type { Book } from "@/types/book";
import { formatLastEdited } from "@/utils/format";
import { BookCardCover } from "@/components/library/BookCardCover";
import { BookActions } from "@/components/library/BookActions";

interface Props {
  book: Book;
  index: number;
  formatName?: string;
  fontName?: string;
}

export function BookCard({ book, index, formatName, fontName }: Props) {
  return (
    <article className="book-card relative min-w-0">
      <BookCardCover book={book} index={index} />
      <BookActions bookId={book.id} title={book.title} />
      <div className="book-info min-w-0 px-px pt-[15px]">
        <h2 className="font-display text-[23px] leading-[1.12]">
          <Link href={`/books/view?bookId=${encodeURIComponent(book.id)}`}
            className="line-clamp-2 wrap-anywhere hover:text-primary after:absolute after:inset-0 after:rounded-md after:content-['']"
          >
            {book.title}
          </Link>
        </h2>
        <p className="mt-1.5 truncate text-[10px] text-muted">{book.author_name || "Autor"}</p>
        <div className="mt-3 flex flex-wrap justify-between gap-x-3 gap-y-1 border-t border-border pt-2.5 text-[9px] text-muted">
          <span>{[formatName, fontName].filter(Boolean).join(" · ")}</span>
          <span>Atualizado {formatLastEdited(book.updated_at)}</span>
        </div>
      </div>
    </article>
  );
}

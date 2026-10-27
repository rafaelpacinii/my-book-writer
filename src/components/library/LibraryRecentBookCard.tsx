import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BookObject } from "@/components/shared/BookObject";
import { formatLastEdited } from "@/utils/format";
import { libraryBookUpdateTimestamp } from "@/utils/libraryRecentBooks";
import type { Book } from "@/types/book";
import styles from "@/components/library/libraryRecentBooks.module.css";

export function LibraryRecentBookCard({ book }: { book: Book }) {
  const updated = libraryBookUpdateTimestamp(book.updated_at);
  return (
    <li className={styles.card}>
      <div className={styles.cover}><BookObject book={book} /></div>
      <Link href={`/books/view?bookId=${encodeURIComponent(book.id)}`} aria-label={`Retomar ${book.title}`}
        className={styles.link}>
        <span className={styles.title} title={book.title}>{book.title}</span>
        <span className={styles.author}>{book.author_name || "Autor"}</span>
        <span className={styles.updated}>Atualizado {formatLastEdited(updated ? new Date(updated).toISOString() : undefined)}</span>
      </Link>
      <ArrowUpRight size={16} aria-hidden="true" className={styles.arrow} />
    </li>
  );
}

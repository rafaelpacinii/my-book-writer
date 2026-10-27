import type { Book } from "@/types/book";
import type { LibraryScope } from "@/types/library";

export function libraryBookUpdateTimestamp(value: string) {
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:/.test(value) ? `${value.replace(" ", "T")}Z` : value;
  return Date.parse(normalized) || 0;
}

/** Resume the current collection independently of temporary catalog filters. */
export function libraryRecentBooks(books: Book[], scope: LibraryScope): Book[] {
  const candidates = scope.kind === "missing" ? [] : scope.kind === "root" ? books : scope.books;
  return candidates.filter((book) => !book.deleted_at).sort((a, b) =>
    libraryBookUpdateTimestamp(b.updated_at) - libraryBookUpdateTimestamp(a.updated_at)
      || a.title.localeCompare(b.title, "pt-BR") || a.id.localeCompare(b.id)).slice(0, 3);
}

import type { Book } from "@/types/book";
import type { LibraryCollection, LibraryEntry, LibraryScope, LibraryTypeFilter } from "@/types/library";

export function libraryTypeIsAvailable(type: LibraryTypeFilter, scope: LibraryScope["kind"]) {
  return scope !== "missing" && (type !== "universe" || scope === "root")
    && (type !== "series" || scope !== "series");
}

/** Typed views expose nested items at the root and stay within the open collection. */
export function libraryTypeEntries(books: Book[], collections: LibraryCollection[], scope: LibraryScope,
  entries: LibraryEntry[], type: LibraryTypeFilter): LibraryEntry[] {
  if (type === "all" || scope.kind === "series" || scope.kind === "missing") return entries;
  if (type === "book") {
    return (scope.kind === "universe" ? scope.books : books).map((book) => ({ kind: "book", book }));
  }
  return collections.filter((entry) => entry.kind === type && (scope.kind === "root"
    || (entry.kind === "series" && entry.collection.universe_id === scope.collection.id)));
}

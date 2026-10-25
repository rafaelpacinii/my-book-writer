import type { Book } from "@/types/book";
import type { BookSeries } from "@/types/series";
import type { Universe } from "@/types/universe";

export type LibraryCollection =
  | { kind: "series"; collection: BookSeries; books: Book[] }
  | { kind: "universe"; collection: Universe; books: Book[] };
export type LibraryEntry = LibraryCollection | { kind: "book"; book: Book };
export type LibraryScope = { kind: "root" } | { kind: "missing" } | LibraryCollection;
export type LibrarySort = "recent" | "title" | "author";
export type LibraryGrouping = "mixed" | "type";
export type LibraryTypeFilter = "all" | "book" | "series" | "universe";
export interface LibraryFilters {
  searchQuery: string;
  formatFilter: string;
  sortOrder: LibrarySort;
}
/** Direct placement moves the book to this parent in the navigation tree. */
export type LibraryMoveTarget = { kind: "root" } | (LibraryCollection & { direct?: boolean });
export interface LibraryDragSource {
  kind: "book" | "series";
  id: string;
}

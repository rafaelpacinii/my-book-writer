import type { Book } from "@/types/book";
import type { BookSeries } from "@/types/series";
import type { Universe } from "@/types/universe";
import type { LibraryCollection, LibraryEntry, LibraryFilters, LibraryScope } from "@/types/library";

export const collectionHref = (item: Pick<LibraryCollection, "kind" | "collection">) =>
  `/library?${item.kind === "series" ? "seriesId" : "universeId"}=${encodeURIComponent(item.collection.id)}`;
export const entryTitle = (entry: LibraryEntry) => entry.kind === "book" ? entry.book.title : entry.collection.name;

export function libraryCollections(books: Book[], series: BookSeries[], universes: Universe[]): LibraryCollection[] {
  const seriesMap = new Map(series.map((item) => [item.id, item]));
  const belongsToUniverse = (book: Book, id: string) =>
    book.universe_id === id || seriesMap.get(book.series_id ?? "")?.universe_id === id;
  return [
    ...universes.map((collection) => ({ kind: "universe" as const, collection,
      books: books.filter((book) => belongsToUniverse(book, collection.id)).sort((a, b) =>
        a.position - b.position || a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id)),
    })),
    ...series.map((collection) => ({ kind: "series" as const, collection,
      books: books.filter((book) => book.series_id === collection.id).sort((a, b) =>
        (a.series_volume ?? Infinity) - (b.series_volume ?? Infinity) || a.position - b.position),
    })),
  ];
}

export function libraryScope(collections: LibraryCollection[], seriesId: string | null, universeId: string | null): LibraryScope {
  const kind = seriesId ? "series" : "universe";
  const id = seriesId || universeId;
  if (!id) return { kind: "root" };
  return collections.find((entry) => entry.kind === kind && entry.collection.id === id) ?? { kind: "missing" };
}

export function libraryEntries(books: Book[], collections: LibraryCollection[], scope: LibraryScope): LibraryEntry[] {
  const series = collections.filter((entry) => entry.kind === "series");
  const universes = new Set(collections.filter((entry) => entry.kind === "universe").map((entry) => entry.collection.id));
  const seriesMap = new Map(series.map((entry) => [entry.collection.id, entry.collection]));
  if (scope.kind === "missing") return [];
  if (scope.kind === "series") return scope.books.map((book) => ({ kind: "book", book }));
  if (scope.kind === "universe") {
    return [
      ...series.filter((entry) => entry.collection.universe_id === scope.collection.id),
      ...scope.books.filter((book) => seriesMap.get(book.series_id ?? "")?.universe_id !== scope.collection.id)
        .map((book) => ({ kind: "book" as const, book })),
    ];
  }
  return [
    ...collections.filter((entry) => entry.kind === "universe" || !universes.has(entry.collection.universe_id ?? "")),
    ...books.filter((book) => !seriesMap.has(book.series_id ?? "") && !universes.has(book.universe_id ?? ""))
      .map((book) => ({ kind: "book" as const, book })),
  ];
}

export function filterLibraryEntries(entries: LibraryEntry[], filters: LibraryFilters, inSeries = false) {
  const query = filters.searchQuery.trim().toLocaleLowerCase("pt-BR");
  const matches = (book: Book) => (!filters.formatFilter || book.format_id === filters.formatFilter)
    && (!query || `${book.title} ${book.author_name}`.toLocaleLowerCase("pt-BR").includes(query));
  const visible = entries.filter((entry) => entry.kind === "book" ? matches(entry.book) : (
    (!query || `${entry.collection.name} ${entry.collection.description ?? ""}`.toLocaleLowerCase("pt-BR").includes(query))
      && (!filters.formatFilter || entry.books.some((book) => book.format_id === filters.formatFilter))
  ) || entry.books.some(matches));
  if (inSeries) return visible;
  return visible.sort((a, b) => {
    if (filters.sortOrder === "author") {
      const author = (entry: LibraryEntry) => entry.kind === "book" ? entry.book.author_name : "";
      return author(a).localeCompare(author(b), "pt-BR") || entryTitle(a).localeCompare(entryTitle(b), "pt-BR");
    }
    if (filters.sortOrder === "title") return entryTitle(a).localeCompare(entryTitle(b), "pt-BR");
    const date = (entry: LibraryEntry) => entry.kind === "book" ? entry.book.updated_at : entry.collection.updated_at;
    return date(b).localeCompare(date(a)) || entryTitle(a).localeCompare(entryTitle(b), "pt-BR");
  });
}

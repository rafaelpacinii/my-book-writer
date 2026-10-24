import type { Book } from "@/types/book";
import type { BookSeries } from "@/types/series";

export function groupLibraryBooks(books: Book[], series: BookSeries[]) {
  const ids = new Set(series.map((item) => item.id));
  return {
    groups: series.map((item) => ({
      series: item,
      books: books.filter((book) => book.series_id === item.id).sort(
        (a, b) => (a.series_volume ?? Infinity) - (b.series_volume ?? Infinity),
      ),
    })),
    standalone: books.filter((book) => !book.series_id || !ids.has(book.series_id)),
  };
}

/** Move within the complete series so filtered-out volumes keep their relative order. */
export function moveSeriesBook(books: Book[], sourceId: string, targetId: string): string[] | null {
  const ids = books.map((book) => book.id);
  const source = ids.indexOf(sourceId);
  const target = ids.indexOf(targetId);
  if (source < 0 || target < 0 || source === target) return null;
  ids.splice(source, 1);
  ids.splice(target, 0, sourceId);
  return ids;
}

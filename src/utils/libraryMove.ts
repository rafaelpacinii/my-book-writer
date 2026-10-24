import type { Book, UpdateBookInput } from "@/types/book";
import type { BookSeries, UpdateSeriesInput } from "@/types/series";
import type { LibraryMoveTarget } from "@/types/library";

export function libraryMoveInput(book: Book, target: LibraryMoveTarget): UpdateBookInput | null {
  if (target.kind === "series") {
    if (book.series_id === target.collection.id) return null;
    return {
      series_id: target.collection.id,
      ...(target.collection.universe_id ? { universe_id: target.collection.universe_id } : {}),
    };
  }
  if (target.kind === "universe") {
    if (book.universe_id === target.collection.id) return null;
    return { universe_id: target.collection.id };
  }
  if (!book.series_id && !book.universe_id) return null;
  return { clear_series: true, clear_universe: true };
}

/** Series can be inside a universe or at the library root, never in another series/book. */
export function librarySeriesMoveInput(series: BookSeries, target: LibraryMoveTarget): UpdateSeriesInput | null {
  if (target.kind === "series") return null;
  if (target.kind === "universe") {
    return series.universe_id === target.collection.id ? null : { universe_id: target.collection.id };
  }
  return { clear_universe: true };
}

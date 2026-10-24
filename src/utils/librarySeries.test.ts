import { describe, expect, it } from "vitest";
import { book } from "@/tests/fixtures/book";
import type { BookSeries } from "@/types/series";
import { groupLibraryBooks, moveSeriesBook } from "@/utils/librarySeries";

const series: BookSeries = {
  id: "saga", profile_id: book.profile_id, universe_id: null, name: "Saga",
  description: null, position: 0, created_at: book.created_at,
  updated_at: book.updated_at, deleted_at: null,
};
const volumes = [1, 2, 3].map((volume) => ({
  ...book, id: `volume-${volume}`, series_id: series.id, series_volume: volume,
}));

describe("library series grouping and ordering", () => {
  it("keeps volume order regardless of the library sort and preserves standalone books", () => {
    const orphan = { ...book, id: "orphan", series_id: "unavailable" };
    const result = groupLibraryBooks([volumes[2], book, volumes[0], orphan, volumes[1]], [series]);
    expect(result.groups[0].books.map((item) => item.series_volume)).toEqual([1, 2, 3]);
    expect(result.standalone).toEqual([book, orphan]);
    expect(groupLibraryBooks([], [series]).groups[0].books).toEqual([]);
  });

  it("reorders the complete series including hidden volumes without mutating the input", () => {
    expect(moveSeriesBook(volumes, "volume-3", "volume-1")).toEqual(["volume-3", "volume-1", "volume-2"]);
    expect(moveSeriesBook(volumes, "volume-1", "volume-3")).toEqual(["volume-2", "volume-3", "volume-1"]);
    expect(volumes.map((item) => item.series_volume)).toEqual([1, 2, 3]);
    expect(moveSeriesBook(volumes, "missing", "volume-1")).toBeNull();
    expect(moveSeriesBook(volumes, "volume-1", "volume-1")).toBeNull();
  });
});

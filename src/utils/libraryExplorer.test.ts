import { describe, expect, it } from "vitest";
import { book } from "@/tests/fixtures/book";
import type { Universe } from "@/types/universe";
import type { BookSeries } from "@/types/series";
import { filterLibraryEntries, libraryCollections, libraryEntries, libraryScope } from "@/utils/libraryExplorer";
import { libraryMoveInput, librarySeriesMoveInput } from "@/utils/libraryMove";

const universe: Universe = {
  id: "world", profile_id: book.profile_id, name: "Terra", description: null,
  position: 0, created_at: book.created_at, updated_at: book.updated_at, deleted_at: null,
};
const series: BookSeries = { ...universe, id: "saga", name: "Saga", universe_id: universe.id };
const volumes = [3, 1, 2].map((volume) => ({ ...book, id: `volume-${volume}`, title: `História ${volume}`,
  series_id: series.id, series_volume: volume, universe_id: null }));
const direct = { ...book, id: "direct", universe_id: universe.id };
const orphan = { ...book, id: "orphan", series_id: "deleted", universe_id: "deleted" };
const books = [...volumes, direct, book, orphan];
const collections = libraryCollections(books, [series], [universe]);

describe("library explorer hierarchy", () => {
  it("shows first-level collections and standalone books without repeating nested volumes", () => {
    const entries = libraryEntries(books, collections, { kind: "root" });
    expect(entries.map((entry) => entry.kind)).toEqual(["universe", "book", "book"]);
    expect(entries.flatMap((entry) => entry.kind === "book" ? [entry.book.id] : [])).toEqual([book.id, orphan.id]);
    const world = libraryScope(collections, null, universe.id);
    expect(libraryEntries(books, collections, world).map((entry) => entry.kind)).toEqual(["series", "book"]);
    expect(libraryScope(collections, "deleted", null)).toEqual({ kind: "missing" });
  });

  it("keeps the first three series covers in volume order regardless of sorting and filtering", () => {
    const saga = collections.find((entry) => entry.kind === "series")!;
    expect(saga.books.map((item) => item.series_volume)).toEqual([1, 2, 3]);
    const filtered = filterLibraryEntries([saga], { searchQuery: "história 2", formatFilter: "", sortOrder: "title" });
    expect(filtered).toEqual([saga]);
    expect(filtered[0].kind !== "book" && filtered[0].books).toHaveLength(3);
    expect(filterLibraryEntries([saga], { searchQuery: "saga", formatFilter: "missing", sortOrder: "recent" })).toEqual([]);
  });

  it("preserves empty collections and discovers a collection by its name or a descendant book", () => {
    const empty = libraryCollections([], [series], [universe]);
    expect(empty.every((entry) => entry.books.length === 0)).toBe(true);
    expect(filterLibraryEntries(empty, { searchQuery: "terra", formatFilter: "", sortOrder: "title" })).toHaveLength(1);
    expect(filterLibraryEntries(collections, { searchQuery: "história 2", formatFilter: "", sortOrder: "recent" })).toHaveLength(2);
  });
});

describe("moving books between collections", () => {
  const saga = collections.find((entry) => entry.kind === "series")!;
  const world = collections.find((entry) => entry.kind === "universe")!;
  it("links a book to a universe while preserving its series", () => {
    expect(libraryMoveInput(volumes[0], world)).toEqual({ universe_id: universe.id });
    expect(libraryMoveInput(volumes[0], saga)).toBeNull();
    expect(libraryMoveInput(direct, world)).toBeNull();
  });
  it("inherits the destination series universe and clears old membership when returning to root", () => {
    expect(libraryMoveInput(book, saga)).toEqual({ series_id: series.id, universe_id: universe.id });
    expect(libraryMoveInput(direct, { ...saga, kind: "series", collection: { ...series, universe_id: null } })).toEqual({ series_id: series.id });
    expect(libraryMoveInput(volumes[0], { kind: "root" })).toEqual({ clear_series: true, clear_universe: true });
    expect(libraryMoveInput(book, { kind: "root" })).toBeNull();
  });
});

describe("series movement respects the domain hierarchy", () => {
  const saga = collections.find((entry) => entry.kind === "series")!;
  const world = collections.find((entry) => entry.kind === "universe")!;
  it("allows only universe or root destinations for a series", () => {
    expect(librarySeriesMoveInput({ ...series, universe_id: null }, world)).toEqual({ universe_id: universe.id });
    expect(librarySeriesMoveInput(series, saga)).toBeNull();
    expect(librarySeriesMoveInput(series, world)).toBeNull();
    expect(librarySeriesMoveInput(series, { kind: "root" })).toEqual({ clear_universe: true });
    expect(librarySeriesMoveInput({ ...series, universe_id: null }, { kind: "root" })).toEqual({ clear_universe: true });
  });
  it("keeps directly linked books visible even when their series has a different universe", () => {
    const other = { ...universe, id: "other", name: "Outro mundo" };
    const directBook = { ...volumes[0], universe_id: other.id };
    const worlds = libraryCollections([directBook], [series], [universe, other]);
    expect(worlds.filter((entry) => entry.kind === "universe").map((entry) => entry.books.length)).toEqual([1, 1]);
  });
});

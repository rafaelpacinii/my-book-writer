import { describe, expect, it } from "vitest";
import { book } from "@/tests/fixtures/book";
import { libraryRecentBooks } from "@/utils/libraryRecentBooks";
import { libraryCollections } from "@/utils/libraryExplorer";
import type { Universe } from "@/types/universe";

describe("recent books in the library sidebar", () => {
  const books = [
    { ...book, id: "older", title: "Antigo", updated_at: "2026-10-25T10:00:00Z" },
    { ...book, id: "sql", title: "SQLite", updated_at: "2026-10-27 10:00:00" },
    { ...book, id: "offset", title: "Fuso", updated_at: "2026-10-27T08:00:00-03:00" },
    { ...book, id: "invalid", title: "Sem data", updated_at: "invalid" },
    { ...book, id: "deleted", deleted_at: "2026-10-27", updated_at: "2026-10-28" },
  ];
  it("returns at most three active books by update time, normalizing SQLite UTC and ISO offsets", () => {
    expect(libraryRecentBooks(books, { kind: "root" }).map((book) => book.id)).toEqual(["offset", "sql", "older"]);
    expect(books.map((book) => book.id)).toEqual(["older", "sql", "offset", "invalid", "deleted"]);
  });
  it("limits shortcuts to the open universe or series and handles missing and empty collections", () => {
    const world: Universe = { id: "world", name: "Mundo", profile_id: book.profile_id, description: null,
      position: 0, created_at: book.created_at, updated_at: book.updated_at, deleted_at: null };
    const saga = { ...world, id: "saga", universe_id: world.id };
    const catalog = [{ ...books[0], series_id: saga.id }, { ...books[1], universe_id: world.id }, books[2]];
    const collections = libraryCollections(catalog, [saga], [world]);
    const universe = collections.find((entry) => entry.kind === "universe")!;
    const series = collections.find((entry) => entry.kind === "series")!;
    expect(libraryRecentBooks(catalog, universe).map((book) => book.id)).toEqual(["sql", "older"]);
    expect(libraryRecentBooks(catalog, series).map((book) => book.id)).toEqual(["older"]);
    expect(libraryRecentBooks(catalog, { ...series, books: [] })).toEqual([]);
    expect(libraryRecentBooks(catalog, { kind: "missing" })).toEqual([]);
  });
  it("breaks equal-time ties deterministically and does not elevate invalid timestamps", () => {
    const tied = [{ ...books[0], title: "B" }, { ...books[1], title: "A", updated_at: books[0].updated_at }, books[3]];
    expect(libraryRecentBooks(tied, { kind: "root" }).map((book) => book.title)).toEqual(["A", "B", "Sem data"]);
  });
});

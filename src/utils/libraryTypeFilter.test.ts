import { describe, expect, it } from "vitest";
import { book } from "@/tests/fixtures/book";
import { libraryCollections, libraryEntries, filterLibraryEntries } from "@/utils/libraryExplorer";
import { libraryTypeEntries } from "@/utils/libraryTypeFilter";
import type { Universe } from "@/types/universe";

const world: Universe = { id: "world", name: "Mundo", profile_id: book.profile_id, description: null,
  position: 0, created_at: book.created_at, updated_at: book.updated_at, deleted_at: null };
const saga = { ...world, id: "saga", name: "Saga", universe_id: world.id };
const independent = { ...saga, id: "independent", universe_id: null };
const books = [{ ...book, id: "nested", series_id: saga.id, universe_id: world.id },
  { ...book, id: "direct", universe_id: world.id }, { ...book, id: "free" }];
const collections = libraryCollections(books, [saga, independent], [world]);
const root = { kind: "root" } as const;

describe("library type filters", () => {
  it("preserves the explorer by default and includes nested items in root typed views", () => {
    const entries = libraryEntries(books, collections, root);
    expect(libraryTypeEntries(books, collections, root, entries, "all")).toEqual(entries);
    expect(libraryTypeEntries(books, collections, root, entries, "series")).toHaveLength(2);
    expect(libraryTypeEntries(books, collections, root, entries, "book")).toHaveLength(3);
    expect(libraryTypeEntries(books, collections, root, entries, "universe")).toHaveLength(1);
  });
  it("limits typed views to the opened universe and composes with search and format", () => {
    const scope = collections.find((entry) => entry.kind === "universe")!;
    const typed = libraryTypeEntries(books, collections, scope, libraryEntries(books, collections, scope), "book");
    expect(typed.flatMap((entry) => entry.kind === "book" ? [entry.book.id] : []).sort()).toEqual(["direct", "nested"]);
    expect(filterLibraryEntries(typed, { searchQuery: "inexistente", formatFilter: "", sortOrder: "recent" })).toEqual([]);
    expect(filterLibraryEntries(typed, { searchQuery: "", formatFilter: "missing", sortOrder: "title" })).toEqual([]);
    expect(libraryTypeEntries(books, collections, scope, [], "series")).toHaveLength(1);
  });
  it("keeps series volumes available regardless of an ancestor type selection", () => {
    const scope = collections.find((entry) => entry.kind === "series")!;
    const entries = libraryEntries(books, collections, scope);
    expect(libraryTypeEntries(books, collections, scope, entries, "universe")).toEqual(entries);
  });
});

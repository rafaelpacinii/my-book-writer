import { describe, expect, it } from "vitest";
import { book } from "@/tests/fixtures/book";
import { libraryAncestorCrumbs, libraryExplorerCrumbs } from "@/utils/libraryBreadcrumbs";
import { libraryCollections, libraryScope } from "@/utils/libraryExplorer";
import type { BookSeries } from "@/types/series";
import type { Universe } from "@/types/universe";

const world: Universe = { id: "world / norte", profile_id: book.profile_id, name: "Terras do Norte",
  description: null, position: 0, created_at: book.created_at, updated_at: book.updated_at, deleted_at: null };
const series: BookSeries = { ...world, id: "saga & norte", name: "Crônicas", universe_id: world.id };
const sibling: BookSeries = { ...world, id: "saga-2", name: "Lendas", universe_id: world.id };
const independent: BookSeries = { ...world, id: "solo", name: "Série Independente", universe_id: null };

describe("contextual library ancestor path", () => {
  it("provides clickable universe and series ancestors in hierarchy order", () => {
    expect(libraryAncestorCrumbs(series.id, null, [series], [world])).toEqual([
      { label: "Biblioteca", href: "/library" },
      { label: world.name, href: "/library?universeId=world%20%2F%20norte" },
      { label: series.name, href: "/library?seriesId=saga%20%26%20norte" },
    ]);
  });
  it("supports direct universe membership, independent series and standalone books", () => {
    expect(libraryAncestorCrumbs(null, world.id, [], [world]).map((crumb) => crumb.label)).toEqual(["Biblioteca", world.name]);
    expect(libraryAncestorCrumbs(series.id, null, [{ ...series, universe_id: null }], []).map((crumb) => crumb.label)).toEqual(["Biblioteca", series.name]);
    expect(libraryAncestorCrumbs(null, null, [], [])).toEqual([{ label: "Biblioteca", href: "/library" }]);
  });
  it("omits removed ancestors and uses the series universe for its canonical path", () => {
    expect(libraryAncestorCrumbs("removed", world.id, [], [world]).map((crumb) => crumb.label)).toEqual(["Biblioteca", world.name]);
    expect(libraryAncestorCrumbs(series.id, "another", [series], [world]).map((crumb) => crumb.label)).toEqual(["Biblioteca", world.name, series.name]);
  });
  it("builds explorer crumbs with root collections and sibling series in the active universe", () => {
    const collections = libraryCollections([book], [series, sibling, independent], [world]);
    const scope = libraryScope(collections, series.id, null);
    const crumbs = libraryExplorerCrumbs(scope, collections);
    expect(crumbs.map((crumb) => crumb.label)).toEqual(["Biblioteca", world.name, series.name]);
    expect(crumbs[0].items.map((item) => item.collection.id)).toEqual([world.id, independent.id]);
    expect(crumbs[1].items.map((item) => item.collection.id)).toEqual([series.id, sibling.id]);
  });
});

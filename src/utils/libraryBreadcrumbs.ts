import { collectionHref } from "@/utils/libraryExplorer";
import type { LibraryCollection, LibraryMoveTarget, LibraryScope } from "@/types/library";
import type { BookSeries } from "@/types/series";
import type { Universe } from "@/types/universe";
import type { TitleBarCrumb } from "@/types/navigation";

export interface LibraryExplorerCrumb {
  id: string;
  label: string;
  href: string;
  kind: "root" | "universe" | "series";
  current: boolean;
  target: LibraryMoveTarget;
  menuLabel?: string;
  menuRegionLabel?: string;
  menuEmptyText?: string;
  items: LibraryCollection[];
}

/** A series supplies the universe ancestor; a book can also have a direct universe. */
export function libraryAncestorCrumbs(
  seriesId: string | null | undefined,
  universeId: string | null | undefined,
  series: BookSeries[],
  universes: Universe[],
): TitleBarCrumb[] {
  const selected = series.find((item) => item.id === seriesId);
  const universe = universes.find((item) => item.id === (selected?.universe_id || universeId));
  return [
    { label: "Biblioteca", href: "/library" },
    ...(universe ? [{ label: universe.name, href: `/library?universeId=${encodeURIComponent(universe.id)}` }] : []),
    ...(selected ? [{ label: selected.name, href: `/library?seriesId=${encodeURIComponent(selected.id)}` }] : []),
  ];
}

export function libraryExplorerCrumbs(
  scope: LibraryScope,
  collections: LibraryCollection[],
): LibraryExplorerCrumb[] {
  const universeIds = new Set(collections.filter((item) => item.kind === "universe").map((item) => item.collection.id));
  const rootItems = collections.filter((item) => item.kind === "universe" || !universeIds.has(item.collection.universe_id ?? ""));
  const universe = scope.kind === "universe"
    ? scope
    : scope.kind === "series"
      ? collections.find((item): item is Extract<LibraryCollection, { kind: "universe" }> =>
        item.kind === "universe" && item.collection.id === scope.collection.universe_id)
      : undefined;

  return [
    {
      id: "root",
      label: "Biblioteca",
      href: "/library",
      kind: "root",
      current: scope.kind === "root",
      target: { kind: "root" },
      menuLabel: "Ver coleções de Biblioteca",
      menuRegionLabel: "Coleções de Biblioteca",
      menuEmptyText: "Nenhuma coleção na Biblioteca.",
      items: rootItems,
    },
    ...(universe ? [{
      id: universe.collection.id,
      label: universe.collection.name,
      href: collectionHref(universe),
      kind: "universe" as const,
      current: scope.kind === "universe",
      target: { ...universe, direct: true },
      menuLabel: `Ver séries de ${universe.collection.name}`,
      menuRegionLabel: `Séries de ${universe.collection.name}`,
      menuEmptyText: "Nenhuma série neste universo.",
      items: collections.filter((item) => item.kind === "series" && item.collection.universe_id === universe.collection.id),
    }] : []),
    ...(scope.kind === "series" ? [{
      id: scope.collection.id,
      label: scope.collection.name,
      href: collectionHref(scope),
      kind: "series" as const,
      current: true,
      target: { ...scope, direct: true },
      items: [],
    }] : []),
  ];
}

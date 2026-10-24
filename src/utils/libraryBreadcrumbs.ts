import type { BookSeries } from "@/types/series";
import type { Universe } from "@/types/universe";
import type { TitleBarCrumb } from "@/types/navigation";

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

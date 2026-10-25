import type { LibraryScope } from "@/types/library";

export function libraryBookCreationHref(scope: LibraryScope) {
  if (scope.kind === "series") return `/books/new?seriesId=${encodeURIComponent(scope.collection.id)}`;
  if (scope.kind === "universe") return `/books/new?universeId=${encodeURIComponent(scope.collection.id)}`;
  return "/books/new";
}

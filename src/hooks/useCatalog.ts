"use client";

import { catalogResource } from "@/lib/data/appResources";
import { useResource } from "@/hooks/useResource";

export function useCatalog() {
  const catalog = useResource(catalogResource);
  return {
    formats: catalog.data?.formats ?? [],
    fonts: catalog.data?.fonts ?? [],
    isLoading: catalog.isLoading,
    isRefreshing: catalog.isRefreshing,
    error: catalog.error,
    refreshCatalog: catalog.refresh,
  };
}

export type UseCatalogReturn = ReturnType<typeof useCatalog>;

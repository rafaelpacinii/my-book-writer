"use client";

import { useCallback, useState } from "react";
import type { CreateSeriesInput, UpdateSeriesInput } from "@/types/series";
import {
  createSeries,
  deleteSeries,
  reorderSeries,
  reorderSeriesBooks,
  updateSeries,
} from "@/lib/api/series";
import { emptySeriesResource, seriesResource } from "@/lib/data/appResources";
import { useResource } from "@/hooks/useResource";

export function useSeries(profileId?: string | null) {
  const [mutationError, setMutationError] = useState<string | null>(null);
  const resource = profileId ? seriesResource(profileId) : emptySeriesResource;
  const series = useResource(resource);

  async function mutate<T>(action: () => Promise<T>) {
    setMutationError(null);
    try {
      return await action();
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  const refresh = series.refresh;
  const refreshSeries = useCallback(() => {
    setMutationError(null);
    return refresh();
  }, [refresh]);

  return {
    series: series.data ?? [],
    isLoading: Boolean(profileId) && series.isLoading,
    isRefreshing: series.isRefreshing,
    error: mutationError || series.error,
    refreshSeries,
    addSeries: (input: CreateSeriesInput) => mutate(() => createSeries(input)),
    editSeries: (id: string, input: UpdateSeriesInput) => mutate(() => updateSeries(id, input)),
    removeSeries: (id: string) => mutate(() => deleteSeries(id)),
    reorderSeriesList: (seriesIds: string[]) =>
      mutate(() => (profileId ? reorderSeries(profileId, seriesIds) : Promise.resolve())),
    reorderBooksInSeries: (seriesId: string, bookIds: string[]) =>
      mutate(() => reorderSeriesBooks(seriesId, bookIds)),
  };
}

export type UseSeriesReturn = ReturnType<typeof useSeries>;


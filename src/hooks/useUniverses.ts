"use client";

import { useCallback, useState } from "react";
import type { CreateUniverseInput, UpdateUniverseInput } from "@/types/universe";
import {
  createUniverse,
  deleteUniverse,
  reorderUniverses,
  updateUniverse,
} from "@/lib/api/universes";
import { emptyUniversesResource, universesResource } from "@/lib/data/appResources";
import { useResource } from "@/hooks/useResource";

export function useUniverses(profileId?: string | null) {
  const [mutationError, setMutationError] = useState<string | null>(null);
  const resource = profileId ? universesResource(profileId) : emptyUniversesResource;
  const universes = useResource(resource);

  async function mutate<T>(action: () => Promise<T>) {
    setMutationError(null);
    try {
      return await action();
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  const refresh = universes.refresh;
  const refreshUniverses = useCallback(() => {
    setMutationError(null);
    return refresh();
  }, [refresh]);

  return {
    universes: universes.data ?? [],
    isLoading: Boolean(profileId) && universes.isLoading,
    isRefreshing: universes.isRefreshing,
    error: mutationError || universes.error,
    refreshUniverses,
    addUniverse: (input: CreateUniverseInput) => mutate(() => createUniverse(input)),
    editUniverse: (id: string, input: UpdateUniverseInput) => mutate(() => updateUniverse(id, input)),
    removeUniverse: (id: string) => mutate(() => deleteUniverse(id)),
    reorderUniverseList: (universeIds: string[]) =>
      mutate(() => (profileId ? reorderUniverses(profileId, universeIds) : Promise.resolve())),
  };
}

export type UseUniversesReturn = ReturnType<typeof useUniverses>;


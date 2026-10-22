"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { createResource } from "@/lib/data/resource";

export function useResource<T>(resource: ReturnType<typeof createResource<T>>) {
  const snapshot = useSyncExternalStore(resource.subscribe, resource.getSnapshot, resource.getServerSnapshot);
  useEffect(() => { void resource.load(); }, [resource]);
  return {
    ...snapshot,
    isLoading: snapshot.data === undefined && snapshot.error === null,
    refresh: useCallback(() => resource.load(true), [resource]),
  };
}

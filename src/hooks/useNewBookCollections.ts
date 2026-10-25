"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSeries } from "@/hooks/useSeries";
import { useUniverses } from "@/hooks/useUniverses";
import { newBookCollectionInput } from "@/utils/newBookCollections";

export function useNewBookCollections(profileId?: string) {
  const params = useSearchParams();
  const seriesData = useSeries(profileId);
  const universeData = useUniverses(profileId);
  const [seriesId, setSeriesId] = useState(() => params.get("seriesId") ?? "");
  const [chosenUniverse, setUniverseId] = useState(() => params.get("universeId") ?? "");
  const inheritedUniverse = seriesData.series.find((item) => item.id === seriesId)?.universe_id;
  const universeId = inheritedUniverse || chosenUniverse;
  return {
    seriesData, universeData, seriesId, setSeriesId, universeId, setUniverseId,
    isUniverseInherited: Boolean(inheritedUniverse),
    isCollectionsLoading: seriesData.isLoading || universeData.isLoading,
    collectionsError: seriesData.error || universeData.error,
    refreshCollections: () => { void seriesData.refreshSeries(); void universeData.refreshUniverses(); },
    collectionInput: () => newBookCollectionInput(seriesId, universeId, seriesData.series, universeData.universes),
  };
}

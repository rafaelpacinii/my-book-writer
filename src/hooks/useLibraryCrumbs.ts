"use client";

import { useProfile } from "@/hooks/useProfile";
import { useSeries } from "@/hooks/useSeries";
import { useUniverses } from "@/hooks/useUniverses";
import { libraryAncestorCrumbs } from "@/utils/libraryBreadcrumbs";
import type { TitleBarCrumb } from "@/types/navigation";

export function useLibraryCrumbs(enabled: boolean, seriesId: string | null, universeId: string | null): TitleBarCrumb[] {
  const { profile } = useProfile();
  const profileId = enabled && (seriesId || universeId) ? profile?.id : null;
  const { series } = useSeries(profileId);
  const { universes } = useUniverses(profileId);
  const crumbs = libraryAncestorCrumbs(seriesId, universeId, series, universes);
  if (seriesId && !series.some((item) => item.id === seriesId)) crumbs.push({ label: "Série" });
  if (!seriesId && universeId && !universes.some((item) => item.id === universeId)) crumbs.push({ label: "Universo" });
  return crumbs;
}

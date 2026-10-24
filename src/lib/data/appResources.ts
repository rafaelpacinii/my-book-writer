import { getProfile } from "@/lib/api/profile";
import { listBooks } from "@/lib/api/books";
import { listBookFormats, listFontPresets } from "@/lib/api/catalog";
import { getDatabaseStats } from "@/lib/api/database";
import { listSeries } from "@/lib/api/series";
import { listUniverses } from "@/lib/api/universes";
import { createResource } from "@/lib/data/resource";
import type { DataChange } from "@/lib/data/changes";

export const profileResource = createResource(getProfile);
export const catalogResource = createResource(async () => {
  const [formats, fonts] = await Promise.all([listBookFormats(), listFontPresets()]);
  return { formats, fonts };
});
export const statsResource = createResource(getDatabaseStats);

const makeBooksResource = (profileId: string) => createResource(() => listBooks(profileId));
const bookResources = new Map<string, ReturnType<typeof makeBooksResource>>();
export const emptyBooksResource = createResource(async () => [] as Awaited<ReturnType<typeof listBooks>>);

const makeSeriesResource = (profileId: string) => createResource(() => listSeries(profileId));
const seriesResources = new Map<string, ReturnType<typeof makeSeriesResource>>();
export const emptySeriesResource = createResource(async () => [] as Awaited<ReturnType<typeof listSeries>>);

const makeUniversesResource = (profileId: string) => createResource(() => listUniverses(profileId));
const universeResources = new Map<string, ReturnType<typeof makeUniversesResource>>();
export const emptyUniversesResource = createResource(async () => [] as Awaited<ReturnType<typeof listUniverses>>);

export function booksResource(profileId: string) {
  let resource = bookResources.get(profileId);
  if (!resource) {
    resource = makeBooksResource(profileId);
    bookResources.set(profileId, resource);
  }
  return resource;
}

export function seriesResource(profileId: string) {
  let resource = seriesResources.get(profileId);
  if (!resource) {
    resource = makeSeriesResource(profileId);
    seriesResources.set(profileId, resource);
  }
  return resource;
}

export function universesResource(profileId: string) {
  let resource = universeResources.get(profileId);
  if (!resource) {
    resource = makeUniversesResource(profileId);
    universeResources.set(profileId, resource);
  }
  return resource;
}

export function invalidateAppResources(change: DataChange) {
  if (change === "profile") { profileResource.invalidate(); return; }
  const isRestore = change === "restore";
  if (isRestore) profileResource.invalidate(true);
  if (isRestore) catalogResource.invalidate(true);
  statsResource.invalidate(isRestore);

  if (change === "books" || change === "covers" || isRestore) {
    for (const resource of bookResources.values()) {
      resource.invalidate(isRestore);
    }
  }
  if (change === "series" || isRestore) {
    for (const resource of seriesResources.values()) {
      resource.invalidate(isRestore);
    }
  }
  if (change === "universes" || isRestore) {
    for (const resource of universeResources.values()) {
      resource.invalidate(isRestore);
    }
  }
}

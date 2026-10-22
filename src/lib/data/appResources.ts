import { getProfile } from "@/lib/api/profile";
import { listBooks } from "@/lib/api/books";
import { listBookFormats, listFontPresets } from "@/lib/api/catalog";
import { getDatabaseStats } from "@/lib/api/database";
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

export function booksResource(profileId: string) {
  let resource = bookResources.get(profileId);
  if (!resource) {
    resource = makeBooksResource(profileId);
    bookResources.set(profileId, resource);
  }
  return resource;
}

export function invalidateAppResources(change: DataChange) {
  if (change === "profile") { profileResource.invalidate(); return; }
  if (change === "restore") profileResource.invalidate(true);
  if (change === "restore") catalogResource.invalidate(true);
  statsResource.invalidate(change === "restore");
  for (const resource of bookResources.values()) {
    resource.invalidate(change === "restore");
  }
}

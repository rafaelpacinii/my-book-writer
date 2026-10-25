import { readCodexImage } from "@/lib/api/codexGallery";
import { createResource } from "@/lib/data/resource";
import type { CodexScopeInput } from "@/types/codex";
import type { DataChange } from "@/lib/data/changes";

const resources = new Map<string, ReturnType<typeof make>>();
const make = (scope: CodexScopeInput, entity: string, imageId: string) => createResource(async () => {
  const src = await readCodexImage(scope, entity, imageId);
  const image = new Image(); image.src = src; await image.decode();
  return src;
});
export function codexImageResource(scope: CodexScopeInput, entity: string, image: string) {
  const key = JSON.stringify([scope.profile_id, scope.book_id, scope.universe_id, entity, image]);
  let resource = resources.get(key);
  if (!resource) {
    for (const [old, entry] of resources) if (resources.size >= 24 && !entry.isObserved()) resources.delete(old);
    resource = make(scope, entity, image); resources.set(key, resource);
  }
  return resource;
}
export function invalidateCodexImages(change: DataChange) {
  if (["restore", "profile", "books", "series", "universes"].includes(change)) {
    for (const resource of [...resources.values()]) resource.invalidate(true);
  }
}

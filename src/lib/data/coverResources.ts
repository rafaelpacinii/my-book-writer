import { loadBookCoverUrl } from "@/lib/api/images";
import { createResource } from "@/lib/data/resource";

const resources = new Map<string, ReturnType<typeof makeCoverResource>>();

function makeCoverResource(bookId: string, assetId: string) {
  return createResource(async () => {
    const src = await loadBookCoverUrl(bookId, assetId);
    if (!src) throw new Error("A capa não está disponível.");
    const image = new Image();
    image.src = src;
    await image.decode();
    return { src, image };
  });
}

export function coverResource(bookId: string, assetId: string) {
  const key = JSON.stringify([bookId, assetId]);
  let resource = resources.get(key);
  if (!resource) {
    // Bound retained decoded images; mounted covers keep their resource.
    if (resources.size >= 32) {
      for (const [oldKey, oldResource] of resources) {
        if (!oldResource.isObserved()) resources.delete(oldKey);
        if (resources.size < 32) break;
      }
    }
    resource = makeCoverResource(bookId, assetId);
    resources.set(key, resource);
  }
  return resource;
}

export function invalidateCoverResources() {
  resources.forEach((resource) => resource.invalidate(true));
}

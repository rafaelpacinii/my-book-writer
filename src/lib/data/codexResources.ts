import { getCodexSheet, listCodexEntities, listCodexTemplates, listCodexContexts, resolveCodexScope } from "@/lib/api/codex";
import { createResource } from "@/lib/data/resource";
import type { DataChange } from "@/lib/data/changes";
import type { CodexContext, CodexEntity, CodexKind, CodexScope, CodexScopeInput, CodexSheet, CodexTemplate } from "@/types/codex";

type Resource<T> = ReturnType<typeof createResource<T>>;
const entities = new Map<string, Resource<CodexEntity[]>>();
const sheets = new Map<string, Resource<CodexSheet | null>>();
const templates = new Map<string, Resource<CodexTemplate[]>>();
const contexts = new Map<string, Resource<CodexContext[]>>();
const scopes = new Map<string, Resource<CodexScope | null>>();
export const emptyCodexScope = createResource<CodexScope | null>(async () => null);
export const emptyCodexEntities = createResource<CodexEntity[]>(async () => []);
export const emptyCodexSheet = createResource<CodexSheet | null>(async () => null);
export const emptyCodexTemplates = createResource<CodexTemplate[]>(async () => []);
export const emptyCodexContexts = createResource<CodexContext[]>(async () => []);
const key = (scope: CodexScopeInput) => [scope.profile_id, scope.book_id ?? null, scope.universe_id ?? null];

function cached<T>(cache: Map<string, Resource<T>>, id: string, loader: () => Promise<T>): Resource<T> {
  const resource = cache.get(id) ?? createResource(loader);
  cache.delete(id);
  cache.set(id, resource);
  for (const [old, entry] of cache) {
    if (cache.size <= 64) break;
    if (old !== id && !entry.isObserved()) cache.delete(old);
  }
  return resource;
}
export const codexEntitiesResource = (scope: CodexScopeInput, kind?: CodexKind) =>
  cached(entities, JSON.stringify([...key(scope), kind ?? null]), () => listCodexEntities(scope, kind));
export const codexSheetResource = (scope: CodexScopeInput, id: string) =>
  cached(sheets, JSON.stringify([...key(scope), id]), () => getCodexSheet(scope, id));
export const codexTemplatesResource = (profileId: string, kind?: CodexKind) =>
  cached(templates, JSON.stringify([profileId, kind ?? null]), () => listCodexTemplates(profileId, kind));
export const codexContextsResource = (profileId: string) => cached(contexts, profileId, () => listCodexContexts(profileId));
export const codexScopeResource = (scope: CodexScopeInput) =>
  cached(scopes, JSON.stringify(key(scope)), () => resolveCodexScope(scope));

export function invalidateCodexResources(change: DataChange) {
  if (!["codex", "books", "series", "universes", "restore", "profile"].includes(change)) return;
  const clear = change !== "codex";
  for (const cache of [entities, sheets, templates, contexts, scopes]) for (const resource of [...cache.values()]) resource.invalidate(clear);
}

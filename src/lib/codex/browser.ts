import type { CodexCategoryInput, CodexKind, CodexScopeInput, CreateCodexEntityInput, UpdateCodexEntityInput } from "@/types/codex";
import { readCodexStore, writeCodexStore, type CodexStore } from "@/lib/codex/storage";
import { assertProfile, listContexts, normalizeScopes, resolveScope } from "@/lib/codex/scopes";
import { ensurePresets } from "@/lib/codex/presets";
import { findEntity, replaceStructure, sheet, templateStructure } from "@/lib/codex/structure";
import { codexKinds, label, optionalText, tags, writable } from "@/lib/codex/validation";
import { invalid, missing } from "@/lib/codex/errors";
import { uuidV7 } from "@/utils/uuidV7";

export function transaction<T>(action: (store: CodexStore) => T): T {
  const store = readCodexStore();
  const before = JSON.stringify(store);
  normalizeScopes(store);
  const result = action(store);
  if (JSON.stringify(store) !== before) writeCodexStore(store);
  return structuredClone(result);
}
export const browserResolveScope = (scope: CodexScopeInput) => transaction((store) => resolveScope(store, scope));
export const browserListContexts = (profile: string) => transaction((store) => listContexts(store, profile));
export const browserGetSheet = (scope: CodexScopeInput, id: string) => transaction((store) => sheet(store, resolveScope(store, scope), id));
export const browserListEntities = (input: CodexScopeInput, kind?: CodexKind) => transaction((store) => {
  const scope = resolveScope(store, input);
  return store.entities.filter((item) => item.profile_id === scope.profile_id && item.book_id === scope.book_id
    && item.universe_id === scope.universe_id && !item.deleted_at && (!kind || item.kind === kind))
    .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
});
export const browserCreateEntity = (input: CreateCodexEntityInput) => transaction((store) => {
  const scope = resolveScope(store, input.scope);
  writable(scope);
  const name = label(input.name);
  if (!codexKinds.includes(input.kind)) invalid("Tipo de ficha inválido");
  ensurePresets(store, scope.profile_id);
  const template = store.templates.find((item) => item.profile_id === scope.profile_id && !item.deleted_at
    && (input.template_id ? item.id === input.template_id : item.kind === input.kind && Boolean(item.preset_key)));
  if (!template) missing("Modelo não encontrado neste perfil");
  if (template.kind !== input.kind) invalid("O modelo não corresponde ao tipo da ficha");
  const now = new Date().toISOString();
  const id = uuidV7();
  const position = Math.max(-1, ...store.entities.filter((item) => item.profile_id === scope.profile_id && item.book_id === scope.book_id
    && item.universe_id === scope.universe_id && !item.deleted_at).map((item) => item.position)) + 1;
  store.entities.push({ id, profile_id: scope.profile_id, book_id: scope.book_id, universe_id: scope.universe_id,
    kind: input.kind, name, position, summary: null, role: null, status: null, archetype: null, tags_json: "[]",
    created_at: now, updated_at: now, deleted_at: null });
  replaceStructure(store, scope, id, JSON.parse(template.schema_json) as CodexCategoryInput[]);
  return sheet(store, scope, id);
});
export const browserUpdateEntity = (input: CodexScopeInput, id: string, changes: UpdateCodexEntityInput) => transaction((store) => {
  const scope = resolveScope(store, input);
  writable(scope);
  const entity = findEntity(store, scope, id);
  if (changes.name !== undefined) entity.name = label(changes.name);
  for (const key of ["summary", "role", "status", "archetype"] as const) {
    const value = changes[key];
    if (value !== undefined) entity[key] = optionalText(value);
  }
  if (changes.tags !== undefined) entity.tags_json = JSON.stringify(tags(changes.tags));
  entity.updated_at = new Date().toISOString();
  return entity;
});
export const browserDeleteEntity = (input: CodexScopeInput, id: string) => transaction((store) => {
  const scope = resolveScope(store, input);
  writable(scope);
  const entity = findEntity(store, scope, id);
  entity.deleted_at = entity.updated_at = new Date().toISOString();
});
export const browserSaveStructure = (input: CodexScopeInput, id: string, categories: CodexCategoryInput[]) => transaction((store) => {
  const scope = resolveScope(store, input);
  writable(scope);
  findEntity(store, scope, id);
  replaceStructure(store, scope, id, categories);
  return sheet(store, scope, id);
});
export const browserListTemplates = (profile: string, kind?: CodexKind) => transaction((store) => {
  ensurePresets(store, profile);
  return store.templates.filter((item) => item.profile_id === profile && !item.deleted_at && (!kind || item.kind === kind))
    .sort((a, b) => Number(!a.preset_key) - Number(!b.preset_key) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
});
export const browserSaveTemplate = (input: CodexScopeInput, entityId: string, name: string) => transaction((store) => {
  const source = sheet(store, resolveScope(store, input), entityId);
  const now = new Date().toISOString();
  const template = { id: uuidV7(), profile_id: input.profile_id, name: label(name), kind: source.entity.kind,
    preset_key: null, schema_json: JSON.stringify(templateStructure(source)), created_at: now, updated_at: now, deleted_at: null };
  store.templates.push(template);
  return template;
});
export const browserDeleteTemplate = (profile: string, id: string) => transaction((store) => {
  assertProfile(profile);
  const template = store.templates.find((item) => item.id === id && item.profile_id === profile && !item.deleted_at);
  if (!template) missing("Modelo não encontrado neste perfil");
  if (template.preset_key) invalid("Os modelos iniciais são preservados; salve uma cópia personalizada");
  template.deleted_at = template.updated_at = new Date().toISOString();
});

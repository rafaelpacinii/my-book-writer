import type { CodexEntity, CodexCategory, CodexField, CodexImage, CodexTemplate, CodexStoredAsset } from "@/types/codex";
import { CodexError } from "@/lib/codex/errors";
import { codexFieldTypes, codexKinds } from "@/lib/codex/validation";

export const CODEX_STORAGE_KEY = "my_book_writer_codex_v1";
export interface StoredContext { id: string; profile_id: string; name: string; kind: "book" | "universe" }
export interface CodexStore {
  assets: CodexStoredAsset[];
  version: 1; entities: CodexEntity[]; categories: CodexCategory[]; fields: CodexField[];
  images: CodexImage[]; templates: CodexTemplate[]; contexts: StoredContext[];
}
function object(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function rows(value: unknown, keys: string[]): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.every((row) => object(row) && keys.every((key) => typeof row[key] === "string"))
    && new Set(value.map((row: Record<string, unknown>) => row.id)).size === value.length;
}
function json(value: unknown, accepts: (parsed: unknown) => boolean): boolean {
  return typeof value === "string" && accepts(JSON.parse(value) as unknown);
}
const position = (value: unknown) => Number.isSafeInteger(value) && Number(value) >= 0;
function valid(value: unknown): value is CodexStore {
  if (!object(value) || value.version !== 1
    || (value.assets !== undefined && !rows(value.assets, ["id", "entity_id", "data_url", "sha256"]))
    || !rows(value.entities, ["id", "profile_id", "name", "kind", "tags_json", "created_at", "updated_at"])
    || !rows(value.categories, ["id", "entity_id", "name", "created_at", "updated_at"])
    || !rows(value.fields, ["id", "category_id", "label", "field_type", "value_json", "config_json", "created_at", "updated_at"])
    || !rows(value.images, ["id", "entity_id", "image_asset_id", "created_at", "updated_at"])
    || !rows(value.templates, ["id", "profile_id", "kind", "name", "schema_json", "created_at", "updated_at"])
    || !rows(value.contexts, ["id", "profile_id", "name", "kind"])) return false;
  const nullable = (item: unknown) => item === null || typeof item === "string";
  return value.entities.every((row) => codexKinds.some((kind) => kind === row.kind) && nullable(row.book_id)
    && nullable(row.universe_id) && Boolean(row.book_id) !== Boolean(row.universe_id) && nullable(row.deleted_at)
    && [row.summary, row.role, row.status, row.archetype].every(nullable) && position(row.position)
    && json(row.tags_json, (parsed) => Array.isArray(parsed) && parsed.every((tag) => typeof tag === "string")))
    && value.categories.every((row) => nullable(row.deleted_at) && position(row.position))
    && value.fields.every((row) => codexFieldTypes.some((kind) => kind === row.field_type)
      && nullable(row.deleted_at) && position(row.position) && json(row.value_json, () => true) && json(row.config_json, object))
    && value.images.every((row) => typeof row.is_primary === "boolean" && nullable(row.deleted_at) && position(row.position))
    && value.templates.every((row) => codexKinds.some((kind) => kind === row.kind) && nullable(row.deleted_at)
      && nullable(row.preset_key) && json(row.schema_json, Array.isArray))
    && value.contexts.every((row) => row.kind === "book" || row.kind === "universe");
}
export function readCodexStore(): CodexStore {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CODEX_STORAGE_KEY)
      ?? '{"version":1,"entities":[],"categories":[],"fields":[],"images":[],"templates":[],"contexts":[]}');
    if (!valid(value)) throw new Error("Invalid codex store");
    return { ...value, assets: value.assets ?? [] };
  } catch { throw new CodexError("storage", "Não foi possível ler o Códice local. Seus dados foram preservados."); }
}
export function writeCodexStore(store: CodexStore) {
  try { localStorage.setItem(CODEX_STORAGE_KEY, JSON.stringify(store)); }
  catch { throw new CodexError("storage", "Não foi possível salvar o Códice local. Tente novamente."); }
}
export function localRows<T>(key: string): T[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (!Array.isArray(value)) throw new Error("Invalid local collection");
    return value as T[];
  } catch { throw new CodexError("storage", "Não foi possível ler os agrupadores locais do Códice. Seus dados foram preservados."); }
}

import { transaction } from "@/lib/codex/browser";
import { resolveScope } from "@/lib/codex/scopes";
import { findEntity, sheet } from "@/lib/codex/structure";
import { writable, label } from "@/lib/codex/validation";
import { invalid, missing } from "@/lib/codex/errors";
import { decodeCodexUpload } from "@/utils/codexImage";
import { uuidV7 } from "@/utils/uuidV7";
import type { CodexScopeInput, ImportCodexImageInput, UpdateCodexImageInput } from "@/types/codex";
import type { CodexStore } from "@/lib/codex/storage";

function imageFor(store: CodexStore, entity: string, id: string) {
  return store.images.find((item) => item.entity_id === entity && item.id === id && !item.deleted_at)
    ?? missing("Imagem não encontrada nesta ficha");
}
export async function browserImportCodexImage(input: CodexScopeInput, entity: string, image: ImportCodexImageInput) {
  const filename = label(image.original_filename);
  const decoded = await decodeCodexUpload(image.data_url);
  return transaction((store) => {
    const scope = resolveScope(store, input);
    writable(scope);
    const owner = findEntity(store, scope, entity);
    const images = store.images.filter((item) => item.entity_id === entity && !item.deleted_at);
    if (images.length >= 64) invalid("Use no máximo 64 imagens por ficha");
    const id = uuidV7();
    const asset = uuidV7();
    const now = new Date().toISOString();
    store.assets.push({ id: asset, entity_id: entity, data_url: image.data_url, ...decoded });
    store.images.push({ id, entity_id: entity, image_asset_id: asset, caption: filename, is_primary: images.length === 0,
      position: Math.max(-1, ...store.images.filter((item) => item.entity_id === entity).map((item) => item.position)) + 1,
      created_at: now, updated_at: now, deleted_at: null });
    owner.updated_at = now;
    if (!images.length) owner.primary_image_id = id;
    return sheet(store, scope, entity);
  });
}
export const browserReadCodexImage = (input: CodexScopeInput, entity: string, id: string) => transaction((store) => {
  findEntity(store, resolveScope(store, input), entity);
  const image = imageFor(store, entity, id);
  return store.assets.find((asset) => asset.id === image.image_asset_id && asset.entity_id === entity)?.data_url
    ?? missing("A imagem não está disponível neste dispositivo");
});
export const browserUpdateCodexImage = (input: CodexScopeInput, entity: string, id: string, changes: UpdateCodexImageInput) => transaction((store) => {
  const scope = resolveScope(store, input);
  writable(scope);
  const owner = findEntity(store, scope, entity);
  const image = imageFor(store, entity, id);
  if ([...changes.caption].length > 1000) invalid("A legenda deve conter até 1.000 caracteres");
  if (changes.is_primary) for (const item of store.images) if (item.entity_id === entity && !item.deleted_at) {
    item.is_primary = item.id === id; item.updated_at = new Date().toISOString();
  }
  image.caption = changes.caption.trim();
  image.updated_at = owner.updated_at = new Date().toISOString();
  if (changes.is_primary) owner.primary_image_id = id;
  return sheet(store, scope, entity);
});
export const browserDeleteCodexImage = (input: CodexScopeInput, entity: string, id: string) => transaction((store) => {
  const scope = resolveScope(store, input);
  writable(scope);
  const owner = findEntity(store, scope, entity);
  const image = imageFor(store, entity, id);
  const primary = image.is_primary;
  image.deleted_at = image.updated_at = owner.updated_at = new Date().toISOString();
  image.is_primary = false;
  if (primary) {
    const next = sheet(store, scope, entity).images[0];
    if (next) next.is_primary = true;
    owner.primary_image_id = next?.id ?? null;
  }
  return sheet(store, scope, entity);
});

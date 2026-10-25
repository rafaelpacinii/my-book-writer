import type { CodexCategoryInput, CodexEntity, CodexScope, CodexSheet } from "@/types/codex";
import type { CodexStore } from "@/lib/codex/storage";
import { defaultValue, label, validateField } from "@/lib/codex/validation";
import { invalid, missing } from "@/lib/codex/errors";
import { uuidV7 } from "@/utils/uuidV7";

export function findEntity(store: CodexStore, scope: CodexScope, id: string): CodexEntity {
  return store.entities.find((item) => item.id === id && item.profile_id === scope.profile_id && item.book_id === scope.book_id
    && item.universe_id === scope.universe_id && !item.deleted_at) ?? missing("Ficha não encontrada neste Códice");
}
export function sheet(store: CodexStore, scope: CodexScope, id: string): CodexSheet {
  const entity = findEntity(store, scope, id);
  const ordered = <T extends { position: number; id: string }>(rows: T[]) => rows.sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
  const categories = ordered(store.categories.filter((item) => item.entity_id === id && !item.deleted_at));
  const fields = categories.flatMap((category) => ordered(store.fields.filter((item) => item.category_id === category.id && !item.deleted_at)));
  return { entity, categories, fields, images: ordered(store.images.filter((item) => item.entity_id === id && !item.deleted_at)) };
}
export function replaceStructure(store: CodexStore, scope: CodexScope, id: string, inputs: CodexCategoryInput[]) {
  if (!Array.isArray(inputs) || inputs.length > 64 || inputs.reduce((sum, item) => sum + item.fields.length, 0) > 256) {
    invalid("Use no máximo 64 categorias e 256 campos por ficha");
  }
  const ids = new Set<string>();
  const now = new Date().toISOString();
  const categories = inputs.map((category) => {
    const previous = category.id ? store.categories.find((item) => item.id === category.id && item.entity_id === id) : undefined;
    if (category.id && !previous) invalid("A categoria não pertence a esta ficha");
    const categoryId = category.id || uuidV7();
    if (ids.has(categoryId)) invalid("IDs repetidos na estrutura");
    ids.add(categoryId);
    const fields = category.fields.map((field) => {
      validateField(field);
      const old = field.id ? store.fields.find((item) => item.id === field.id) : undefined;
      if (field.id && (!old || !store.categories.some((item) => item.id === old.category_id && item.entity_id === id))) {
        invalid("O campo não pertence a esta ficha");
      }
      const fieldId = field.id || uuidV7();
      if (ids.has(fieldId)) invalid("IDs repetidos na estrutura");
      ids.add(fieldId);
      if (field.field_type === "reference") for (const target of field.value as string[]) findEntity(store, scope, target);
      return { ...field, id: fieldId, label: label(field.label), created_at: old?.created_at ?? now };
    });
    return { ...category, id: categoryId, name: label(category.name), created_at: previous?.created_at ?? now, fields };
  });
  const oldCategories = new Set(store.categories.filter((item) => item.entity_id === id).map((item) => item.id));
  for (const item of store.categories) if (item.entity_id === id) { item.deleted_at = now; item.updated_at = now; }
  for (const item of store.fields) if (oldCategories.has(item.category_id)) { item.deleted_at = now; item.updated_at = now; }
  for (const [position, category] of categories.entries()) {
    store.categories = store.categories.filter((item) => item.id !== category.id);
    store.categories.push({ id: category.id, entity_id: id, name: category.name, position,
      created_at: category.created_at, updated_at: now, deleted_at: null });
    for (const [index, field] of category.fields.entries()) {
      store.fields = store.fields.filter((item) => item.id !== field.id);
      store.fields.push({ id: field.id, category_id: category.id, label: field.label, field_type: field.field_type,
        value_json: JSON.stringify(field.value), config_json: JSON.stringify(field.config), position: index,
        created_at: field.created_at, updated_at: now, deleted_at: null });
    }
  }
  findEntity(store, scope, id).updated_at = now;
}
export function templateStructure(sheet: CodexSheet): CodexCategoryInput[] {
  return sheet.categories.map((category) => ({ name: category.name, fields: sheet.fields.filter((field) => field.category_id === category.id)
    .map((field) => ({ label: field.label, field_type: field.field_type, value: defaultValue(field.field_type), config: JSON.parse(field.config_json) })) }));
}

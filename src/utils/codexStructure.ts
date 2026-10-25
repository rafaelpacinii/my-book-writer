import type { CodexCategoryInput, CodexFieldType, CodexSheet } from "@/types/codex";
import type { DraftCategory, DraftField } from "@/types/codexEditing";
import { defaultValue, label, validateField } from "@/lib/codex/validation";
import { CodexError } from "@/lib/codex/errors";

export const fieldLabels: Record<CodexFieldType, string> = { short_text: "Texto curto", long_text: "Texto longo",
  tags: "Tags", scale: "Escala (0–100)", reference: "Vínculo entre fichas", document: "Documento narrativo" };
export function draftFromSheet(sheet: CodexSheet): DraftCategory[] {
  return sheet.categories.map((category) => ({ key: category.id, id: category.id, name: category.name,
    fields: sheet.fields.filter((field) => field.category_id === category.id).map((field) => ({ key: field.id, id: field.id,
      label: field.label, field_type: field.field_type, value: JSON.parse(field.value_json), config: JSON.parse(field.config_json) })) }));
}
export function structureInput(items: DraftCategory[]): CodexCategoryInput[] {
  if (items.length > 64 || items.reduce((count, item) => count + item.fields.length, 0) > 256) {
    throw new CodexError("validation", "Use no máximo 64 categorias e 256 campos por ficha.");
  }
  return items.map((category) => ({ id: category.id, name: label(category.name), fields: category.fields.map((field) => {
    validateField(field);
    return { id: field.id, label: label(field.label), field_type: field.field_type, value: field.value, config: field.config };
  }) }));
}
export function moved<T>(items: T[], index: number, offset: number): T[] {
  const next = index + offset;
  if (index < 0 || index >= items.length || next < 0 || next >= items.length) return items;
  const result = [...items]; [result[index], result[next]] = [result[next], result[index]];
  return result;
}
export function changedField(field: DraftField, name: string, type: CodexFieldType): DraftField {
  return { ...field, label: label(name), field_type: type,
    value: type === field.field_type ? field.value : defaultValue(type), config: type === field.field_type ? field.config : {} };
}
export function placedField(items: DraftCategory[], source: string | undefined, target: string, field: DraftField): DraftCategory[] {
  return items.map((category) => {
    const fields = category.key === source ? category.fields.filter((item) => item.key !== field.key) : category.fields;
    if (category.key !== target) return { ...category, fields };
    const old = category.fields.findIndex((item) => item.key === field.key);
    if (source === target && old >= 0) return { ...category, fields: category.fields.map((item) => item.key === field.key ? field : item) };
    return { ...category, fields: [...fields, field] };
  });
}

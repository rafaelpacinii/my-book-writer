import type { CodexFieldInput, CodexFieldType, CodexJSON, CodexScope } from "@/types/codex";
import { invalid } from "@/lib/codex/errors";

export const codexKinds = ["character", "location", "lore"] as const;
export const codexFieldTypes = ["short_text", "long_text", "tags", "scale", "reference", "document"] as const;
export function label(value: string): string {
  if (typeof value !== "string" || !value.trim() || [...value.trim()].length > 160) invalid("O nome deve conter entre 1 e 160 caracteres");
  return value.trim();
}
export function optionalText(value: string): string | null {
  if (typeof value !== "string" || new TextEncoder().encode(value).length > 40_000) invalid("O texto ultrapassa o limite de 40.000 bytes");
  return value.trim() || null;
}
export function tags(values: string[]): string[] {
  if (!Array.isArray(values) || values.length > 100) invalid("Use no máximo 100 tags ou vínculos");
  return [...new Set(values.map(label))];
}
export function writable(scope: CodexScope) {
  if (scope.is_archived) invalid("Este Códice está arquivado; seus dados continuam disponíveis para consulta");
}
export function defaultValue(type: CodexFieldType): CodexJSON {
  if (type === "tags" || type === "reference") return [];
  if (type === "scale") return 0;
  if (type === "document") return { type: "doc", content: [] };
  return "";
}
export function validateField(field: CodexFieldInput) {
  const value = field.value;
  const config = field.config;
  if (!config || typeof config !== "object" || Array.isArray(config)
    || new TextEncoder().encode(JSON.stringify(config)).length > 32_768
    || new TextEncoder().encode(JSON.stringify(value)).length > 1_048_576) invalid("Configuração ou conteúdo do campo inválido");
  let valid = false;
  switch (field.field_type) {
    case "short_text": valid = typeof value === "string" && [...value].length <= 1_000; break;
    case "long_text": valid = typeof value === "string"; break;
    case "scale": valid = typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100; break;
    case "tags": case "reference": valid = Array.isArray(value) && value.length <= 100
      && value.every((item) => typeof item === "string" && item.trim() && [...item].length <= 160); break;
    case "document": valid = Boolean(value && typeof value === "object" && !Array.isArray(value)
      && value.type === "doc" && Array.isArray(value.content)); break;
  }
  if (!valid) invalid("O valor não corresponde ao tipo do campo");
}

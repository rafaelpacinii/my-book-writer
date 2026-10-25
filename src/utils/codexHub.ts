import type { CodexContext, CodexEntity, CodexKind, CodexScopeInput } from "@/types/codex";

export const codexKinds = ["character", "location", "lore"] as const;
export const codexLabels: Record<CodexKind, { singular: string; plural: string }> = {
  character: { singular: "Personagem", plural: "Personagens" },
  location: { singular: "Lugar", plural: "Lugares" },
  lore: { singular: "Conceito", plural: "Conceitos" },
};
export const contextKey = (context: Pick<CodexContext, "id" | "kind">) => `${context.kind}:${context.id}`;
export function codexSheetHref(scope: CodexScopeInput, entityId: string, kind?: CodexKind): string {
  const params = new URLSearchParams({ entityId });
  if (scope.book_id) params.set("bookId", scope.book_id);
  else params.set("universeId", scope.universe_id!);
  if (kind) params.set("kind", kind);
  return `/codex/sheet?${params}`;
}
export function contextScope(profile: string, context: Pick<CodexContext, "id" | "kind">): CodexScopeInput {
  return context.kind === "book" ? { profile_id: profile, book_id: context.id }
    : { profile_id: profile, universe_id: context.id };
}
export function codexHref(context: Pick<CodexContext, "id" | "kind">, kind: CodexKind): string {
  const params = new URLSearchParams({ [context.kind === "book" ? "bookId" : "universeId"]: context.id, kind });
  return `/codex?${params}`;
}
export function filterCodex(entities: CodexEntity[], kind: CodexKind, query: string): CodexEntity[] {
  const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const needle = normalize(query.trim());
  return entities.filter((entity) => entity.kind === kind && normalize([
    entity.name, entity.summary, entity.role, entity.status, entity.archetype, entity.tags_json,
  ].filter(Boolean).join(" ")).includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR") || a.id.localeCompare(b.id));
}

import type { Book } from "@/types/book";
import type { BookSeries } from "@/types/series";
import type { Universe } from "@/types/universe";
import type { CodexContext, CodexScope, CodexScopeInput } from "@/types/codex";
import type { CodexStore, StoredContext } from "@/lib/codex/storage";
import { localRows } from "@/lib/codex/storage";
import { CodexError, invalid, missing } from "@/lib/codex/errors";

export function assertProfile(id: string) {
  let profile: unknown;
  try { profile = JSON.parse(localStorage.getItem("my_book_writer_profile") ?? '{"id":"local-default-id"}'); }
  catch { throw new CodexError("storage", "Não foi possível ler o perfil local."); }
  if (!profile || typeof profile !== "object" || !("id" in profile) || profile.id !== id) missing("Perfil não encontrado");
}
function parents() {
  return { books: localRows<Book>("my_book_writer_books"), series: localRows<BookSeries>("my_book_writer_series"),
    universes: localRows<Universe>("my_book_writer_universes") };
}
function universeFor(book: Book, data: ReturnType<typeof parents>) {
  const active = (id: string | null | undefined) => data.universes.find((world) => world.id === id
    && world.profile_id === book.profile_id && !world.deleted_at);
  const series = data.series.find((item) => item.id === book.series_id && item.profile_id === book.profile_id && !item.deleted_at);
  return active(book.universe_id) ?? active(series?.universe_id);
}
function remember(store: CodexStore, context: StoredContext) {
  store.contexts = [...store.contexts.filter((item) => item.id !== context.id || item.kind !== context.kind), context];
}
export function normalizeScopes(store: CodexStore) {
  const data = parents();
  for (const entity of store.entities) {
    const book = data.books.find((item) => item.id === entity.book_id && item.profile_id === entity.profile_id && !item.deleted_at);
    if (!book) continue;
    const universe = universeFor(book, data);
    if (!universe) continue;
    entity.book_id = null;
    entity.universe_id = universe.id;
    entity.updated_at = new Date().toISOString();
    remember(store, { id: universe.id, name: universe.name, profile_id: universe.profile_id, kind: "universe" });
  }
}
export function resolveScope(store: CodexStore, input: CodexScopeInput): CodexScope {
  assertProfile(input.profile_id);
  if ((input.book_id != null) === (input.universe_id != null)
    || (input.book_id != null && !input.book_id.trim()) || (input.universe_id != null && !input.universe_id.trim())) {
    invalid("Informe exatamente um Livro ou Universo para o Códice");
  }
  const data = parents();
  let kind: "book" | "universe" = input.book_id ? "book" : "universe";
  let id = input.book_id || input.universe_id!;
  const parent = input.book_id ? data.books.find((item) => item.id === id && item.profile_id === input.profile_id)
    : data.universes.find((item) => item.id === id && item.profile_id === input.profile_id);
  let archived = !parent || Boolean(parent.deleted_at);
  if (parent) {
    remember(store, { id, name: "title" in parent ? parent.title : parent.name, kind, profile_id: input.profile_id });
    if (input.book_id && !archived) {
      const universe = universeFor(parent as Book, data);
      if (universe) {
        kind = "universe"; id = universe.id; archived = false;
        remember(store, { id, kind, name: universe.name, profile_id: input.profile_id });
      }
    }
  } else if (!store.contexts.some((item) => item.id === id && item.kind === kind && item.profile_id === input.profile_id)) {
    missing("Livro ou Universo não encontrado neste perfil");
  }
  return { profile_id: input.profile_id, book_id: kind === "book" ? id : null, universe_id: kind === "universe" ? id : null, is_archived: archived };
}
export function listContexts(store: CodexStore, profile: string): CodexContext[] {
  assertProfile(profile);
  const data = parents();
  const entries: StoredContext[] = [
    ...data.universes.filter((item) => item.profile_id === profile).map((item) => ({ id: item.id, name: item.name, kind: "universe" as const, profile_id: profile })),
    ...data.books.filter((item) => item.profile_id === profile).map((item) => ({ id: item.id, name: item.title, kind: "book" as const, profile_id: profile })),
  ];
  const result: CodexContext[] = [];
  for (const context of [...entries, ...store.contexts.filter((item) => item.profile_id === profile)]) {
    if (result.some((item) => item.id === context.id && item.kind === context.kind)) continue;
    const scope = resolveScope(store, context.kind === "book" ? { profile_id: profile, book_id: context.id } : { profile_id: profile, universe_id: context.id });
    const hasEntities = store.entities.some((entity) => !entity.deleted_at && (context.kind === "book" ? entity.book_id : entity.universe_id) === context.id);
    if ((context.kind === "book" && scope.universe_id && !hasEntities) || (scope.is_archived && !hasEntities)) continue;
    result.push({ id: context.id, name: context.name, kind: context.kind, is_archived: scope.is_archived });
  }
  return result.sort((a, b) => Number(a.is_archived) - Number(b.is_archived) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}

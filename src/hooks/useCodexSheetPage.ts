"use client";

import { useSearchParams } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useCodexSheet, useCodexContexts } from "@/hooks/useCodex";
import { useResource } from "@/hooks/useResource";
import { codexScopeResource, emptyCodexScope } from "@/lib/data/codexResources";
import type { CodexScopeInput } from "@/types/codex";

export function useCodexSheetPage(enabled = true) {
  const params = useSearchParams();
  const profile = useProfile();
  const book = params.get("bookId");
  const universe = params.get("universeId");
  const id = params.get("entityId");
  const valid = Boolean(enabled && id && (Boolean(book) !== Boolean(universe)) && !(book !== null && universe !== null));
  const requested: CodexScopeInput | null = !profile.profile || !valid ? null : book
    ? { profile_id: profile.profile.id, book_id: book } : { profile_id: profile.profile.id, universe_id: universe! };
  const resolved = useResource(requested ? codexScopeResource(requested) : emptyCodexScope);
  const scope: CodexScopeInput | null = !resolved.data ? null : resolved.data.universe_id
    ? { profile_id: resolved.data.profile_id, universe_id: resolved.data.universe_id }
    : { profile_id: resolved.data.profile_id, book_id: resolved.data.book_id! };
  const data = useCodexSheet(scope, id);
  const contexts = useCodexContexts(enabled ? profile.profile?.id : null);
  const context = contexts.contexts.find((item) => item.id === (scope?.book_id ?? scope?.universe_id));
  return { ...data, scope, context, archived: resolved.data?.is_archived ?? false,
    error: !valid ? "Informe a ficha e exatamente um Livro ou Universo." : profile.error ?? resolved.error ?? data.error ?? contexts.error,
    isLoading: valid && (profile.isLoading || resolved.isLoading || data.isLoading),
    retry: () => { void profile.refreshProfile(); void resolved.refresh(); void data.refresh(); void contexts.refresh(); } };
}

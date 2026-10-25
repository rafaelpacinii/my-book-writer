"use client";

import { useContext, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SheetNavigationContext } from "@/lib/codex/editing";
import { useProfile } from "@/hooks/useProfile";
import { useCodex, useCodexContexts } from "@/hooks/useCodex";
import { useResource } from "@/hooks/useResource";
import { codexScopeResource, emptyCodexScope } from "@/lib/data/codexResources";
import { codexHref, codexSheetHref, codexKinds, contextKey, contextScope, filterCodex } from "@/utils/codexHub";
import type { CodexKind, CodexScopeInput } from "@/types/codex";

export function useCodexHub() {
  const router = useRouter();
  const navigate = useContext(SheetNavigationContext) ?? router.push;
  const params = useSearchParams();
  const selectedId = usePathname() === "/codex/sheet" ? params.get("entityId") : null;
  const profile = useProfile();
  const contexts = useCodexContexts(profile.profile?.id);
  const bookId = params.get("bookId");
  const universeId = params.get("universeId");
  const invalidScope = bookId !== null && universeId !== null;
  const requested: CodexScopeInput | null = !profile.profile || invalidScope ? null
    : bookId !== null ? { profile_id: profile.profile.id, book_id: bookId }
      : universeId !== null ? { profile_id: profile.profile.id, universe_id: universeId } : null;
  const resolved = useResource(requested ? codexScopeResource(requested) : emptyCodexScope);
  const resolvedScope = requested ? resolved.data : null;
  const target = resolvedScope ?? requested;
  const context = requested ? contexts.contexts.find((item) => item.kind === (target?.universe_id ? "universe" : "book")
    && item.id === (target?.universe_id ?? target?.book_id))
    : contexts.contexts.find((item) => !item.is_archived) ?? contexts.contexts[0];
  const scope = context && profile.profile ? contextScope(profile.profile.id, context) : null;
  const data = useCodex(scope);
  const kind = data.entities.find((item) => item.id === selectedId)?.kind
    ?? codexKinds.find((item) => item === params.get("kind")) ?? "character";
  const [search, setSearch] = useState("");
  const dialogKey = `${profile.profile?.id}:${context ? contextKey(context) : "none"}:${kind}`;
  const [creationKey, setCreationKey] = useState<string | null>(null);
  const setCreating = (open: boolean) => setCreationKey(open ? dialogKey : null);
  const [announcement, setAnnouncement] = useState("");
  const chooseContext = (value: string) => {
    const next = contexts.contexts.find((item) => contextKey(item) === value);
    if (next) navigate(codexHref(next, kind));
  };
  const chooseKind = (next: CodexKind) => {
    if (context && next !== kind) navigate(codexHref(context, next));
  };
  const error = profile.error ?? contexts.error ?? (invalidScope ? "Escolha apenas um Livro ou Universo para o Códice." : null)
    ?? (requested ? resolved.error : null) ?? data.error;
  return { ...data, contexts: contexts.contexts, context, scope, kind, search, setSearch, chooseContext, chooseKind,
    creating: creationKey === dialogKey, setCreating,
    announcement, selectedId,
    visible: filterCodex(data.entities, kind, search), error,
    isLoading: profile.isLoading || contexts.isLoading || Boolean(requested && resolved.isLoading) || data.isLoading,
    canCreate: Boolean(scope && !context?.is_archived && !error),
    retry: () => { void profile.refreshProfile(); void contexts.refresh(); void resolved.refresh(); void data.refresh(); },
    created: (id: string, name: string) => { setCreating(false); setAnnouncement(`Ficha ${name} criada.`); if (scope) navigate(codexSheetHref(scope, id, kind)); },
  };
}
export type CodexHub = ReturnType<typeof useCodexHub>;

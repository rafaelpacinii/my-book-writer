"use client";

import { useRef, useState } from "react";
import { useResource } from "@/hooks/useResource";
import { codexEntitiesResource, codexSheetResource, codexTemplatesResource, codexContextsResource,
  emptyCodexEntities, emptyCodexSheet, emptyCodexTemplates, emptyCodexContexts } from "@/lib/data/codexResources";
import { createCodexEntity, deleteCodexEntity, updateCodexEntity, saveCodexStructure } from "@/lib/api/codex";
import { CodexError } from "@/lib/codex/errors";
import type { CodexCategoryInput, CodexKind, CodexScopeInput, CreateCodexEntityInput, UpdateCodexEntityInput } from "@/types/codex";

export function useCodex(scope?: CodexScopeInput | null, kind?: CodexKind) {
  const data = useResource(scope ? codexEntitiesResource(scope, kind) : emptyCodexEntities);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const locked = useRef(false);
  const key = JSON.stringify(scope);
  const requireScope = () => {
    if (!scope) throw new CodexError("validation", "Escolha um Livro ou Universo para o Códice");
    return scope;
  };
  async function run<T>(action: () => Promise<T>): Promise<T> {
    if (locked.current) throw new CodexError("validation", "Aguarde a operação atual do Códice");
    locked.current = true;
    setBusy(true);
    setFailure(null);
    try { return await action(); }
    catch (error) {
      setFailure({ key, message: error instanceof Error ? error.message : "Não foi possível salvar o Códice" });
      throw error;
    } finally { locked.current = false; setBusy(false); }
  }
  return { entities: data.data ?? [], isLoading: Boolean(scope) && data.isLoading, isRefreshing: data.isRefreshing,
    error: failure?.key === key ? failure.message : data.error,
    refresh: () => { setFailure(null); return data.refresh(); }, busy,
    create: (input: Omit<CreateCodexEntityInput, "scope">) => run(() => createCodexEntity({ ...input, scope: requireScope() })),
    update: (id: string, input: UpdateCodexEntityInput) => run(() => updateCodexEntity(requireScope(), id, input)),
    remove: (id: string) => run(() => deleteCodexEntity(requireScope(), id)),
    saveStructure: (id: string, categories: CodexCategoryInput[]) => run(() => saveCodexStructure(requireScope(), id, categories)),
  };
}
export function useCodexSheet(scope?: CodexScopeInput | null, id?: string | null) {
  const data = useResource(scope && id ? codexSheetResource(scope, id) : emptyCodexSheet);
  return { ...data, sheet: data.data ?? null, isLoading: Boolean(scope && id) && data.isLoading };
}
export function useCodexTemplates(profileId?: string | null, kind?: CodexKind) {
  const data = useResource(profileId ? codexTemplatesResource(profileId, kind) : emptyCodexTemplates);
  return { ...data, templates: data.data ?? [], isLoading: Boolean(profileId) && data.isLoading };
}
export function useCodexContexts(profileId?: string | null) {
  const data = useResource(profileId ? codexContextsResource(profileId) : emptyCodexContexts);
  return { ...data, contexts: data.data ?? [], isLoading: Boolean(profileId) && data.isLoading };
}

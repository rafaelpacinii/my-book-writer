"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { updateCodexEntity } from "@/lib/api/codex";
import { useUnsavedNavigation } from "@/hooks/useUnsavedNavigation";
import type { CodexEntity, CodexScopeInput } from "@/types/codex";

export function useCodexIdentity(scope: CodexScopeInput, entity: CodexEntity, backHref: string) {
  const initial = { name: entity.name, summary: entity.summary ?? "", role: entity.role ?? "", status: entity.status ?? "",
    archetype: entity.archetype ?? "", tags: (JSON.parse(entity.tags_json) as string[]).join(", ") };
  const [values, setValues] = useState(initial);
  const [baseline, setBaseline] = useState(JSON.stringify(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);
  const dirty = JSON.stringify(values) !== baseline;
  const navigation = useUnsavedNavigation(dirty || busy, backHref);
  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);
  const change = (key: keyof typeof values, value: string) => { setValues((current) => ({ ...current, [key]: value })); setSaved(false); };
  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(null); setSaved(false);
    try {
      await updateCodexEntity(scope, entity.id, { ...values, tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean) });
      setBaseline(JSON.stringify(values)); setSaved(true);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Não foi possível salvar a identidade."); }
    finally { lock.current = false; setBusy(false); }
  };
  return { values, change, submit, dirty, busy, error, saved, navigation };
}

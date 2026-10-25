"use client";

import { useRef, useState, type SubmitEvent } from "react";
import { saveCodexTemplate } from "@/lib/api/codex";
import type { CodexScopeInput } from "@/types/codex";

export function useCodexTemplateSave(scope: CodexScopeInput, entity: string, onSaved: (name: string) => void) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);
  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true; setBusy(true); setError(null);
    try { const template = await saveCodexTemplate(scope, entity, name); onSaved(template.name); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Não foi possível salvar o modelo."); }
    finally { locked.current = false; setBusy(false); }
  };
  return { name, setName, busy, error, submit, canClose: () => !locked.current };
}

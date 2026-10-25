"use client";

import { useRef, useState } from "react";
import { useCodexTemplates } from "@/hooks/useCodex";
import { createCodexEntity } from "@/lib/api/codex";
import type { CodexKind, CodexScopeInput } from "@/types/codex";

export function useCodexCreate(scope: CodexScopeInput, kind: CodexKind, onCreated: (id: string, name: string) => void) {
  const models = useCodexTemplates(scope.profile_id, kind);
  const [name, setName] = useState("");
  const [chosen, setChosen] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const template = models.templates.find((item) => item.id === chosen)
    ?? models.templates.find((item) => item.preset_key) ?? models.templates[0];
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current || !template || models.error) return;
    if (!name.trim() || [...name.trim()].length > 160) {
      setError("O nome deve conter entre 1 e 160 caracteres.");
      return;
    }
    locked.current = true;
    setBusy(true);
    setError(null);
    try {
      const sheet = await createCodexEntity({ scope, kind, name, template_id: template.id });
      onCreated(sheet.entity.id, sheet.entity.name);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Não foi possível criar a ficha. Tente novamente.");
    } finally { locked.current = false; setBusy(false); }
  }
  return { models, name, setName, template, setChosen, error, busy, submit, canClose: () => !locked.current };
}

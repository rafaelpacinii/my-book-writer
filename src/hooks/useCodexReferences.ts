"use client";

import { useState } from "react";
import { useCodex } from "@/hooks/useCodex";
import type { CodexJSON, CodexScopeInput } from "@/types/codex";

export function useCodexReferences(scope: CodexScopeInput, entity: string, value: CodexJSON, change: (value: CodexJSON) => void) {
  const data = useCodex(scope);
  const [choice, setChoice] = useState("");
  const ids = Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  const selected = ids.map((id) => ({ id, entity: data.entities.find((item) => item.id === id) }));
  const options = data.entities.filter((item) => item.id !== entity && !ids.includes(item.id));
  return { ...data, ids, selected, options, choice, setChoice,
    add: () => { if (options.some((item) => item.id === choice)) { change([...ids, choice]); setChoice(""); } },
    remove: (id: string) => change(ids.filter((item) => item !== id)) };
}

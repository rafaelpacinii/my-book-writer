"use client";

import { useState, type SubmitEvent } from "react";
import type { CodexStructureEditor } from "@/hooks/useCodexStructure";
import type { CodexFieldType } from "@/types/codex";

export function useCodexCategoryDialog(editor: CodexStructureEditor, key?: string) {
  const [name, setName] = useState(editor.items.find((item) => item.key === key)?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    try { editor.category(name, key); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Não foi possível aplicar o nome."); }
  };
  return { name, setName, error, submit };
}
export function useCodexFieldDialog(editor: CodexStructureEditor, source: string, key?: string) {
  const original = editor.items.find((item) => item.key === source)?.fields.find((item) => item.key === key);
  const [name, setName] = useState(original?.label ?? "");
  const [type, setType] = useState<CodexFieldType>(original?.field_type ?? "short_text");
  const [category, setCategory] = useState(source);
  const [error, setError] = useState<string | null>(null);
  const changedType = Boolean(original && original.field_type !== type);
  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    try { editor.field(source, key, category, name, type); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Não foi possível aplicar o campo."); }
  };
  return { name, setName, type, setType, category, setCategory, error, submit, changedType };
}

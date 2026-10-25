"use client";

import { useRef, useState } from "react";
import { saveCodexStructure } from "@/lib/api/codex";
import { useSheetDirty } from "@/hooks/useSheetDirty";
import { draftFromSheet, structureInput, moved, changedField, placedField } from "@/utils/codexStructure";
import { label, defaultValue } from "@/lib/codex/validation";
import { CodexError } from "@/lib/codex/errors";
import { uuidV7 } from "@/utils/uuidV7";
import type { CodexFieldType, CodexJSON, CodexScopeInput, CodexSheet } from "@/types/codex";
import type { DraftCategory, DraftField, StructureDialog, StructureRemoval } from "@/types/codexEditing";

function read(sheet: CodexSheet) {
  try { return { items: draftFromSheet(sheet), error: null }; }
  catch { return { items: [] as DraftCategory[], error: "Não foi possível ler os campos desta ficha. Recarregue para tentar novamente." }; }
}
export function useCodexStructure(scope: CodexScopeInput, sheet: CodexSheet, archived: boolean) {
  const [initial] = useState(() => read(sheet));
  const [items, setItems] = useState(initial.items);
  const saved = useRef(initial.items);
  const [baseline, setBaseline] = useState(JSON.stringify(initial.items));
  const [activeKey, setActive] = useState(initial.items[0]?.key ?? "");
  const [dialog, setDialog] = useState<StructureDialog | null>(null);
  const [removal, setRemoval] = useState<StructureRemoval | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initial.error);
  const [announcement, setAnnouncement] = useState("");
  const [revision, setRevision] = useState(0);
  const [templateOpen, setTemplateOpen] = useState(false);
  const lock = useRef(false);
  const dirty = baseline !== JSON.stringify(items);
  const active = items.find((item) => item.key === activeKey) ?? items[0];
  const readOnly = archived || Boolean(initial.error);
  const fieldCount = items.reduce((count, item) => count + item.fields.length, 0);
  useSheetDirty("structure", dirty || busy);
  const change = (next: DraftCategory[]) => { if (!readOnly && !lock.current) { setItems(next); setAnnouncement(""); } };
  const category = (name: string, key?: string) => {
    if (readOnly || lock.current) return;
    const trimmed = label(name);
    if (!key && items.length >= 64) throw new CodexError("validation", "Use no máximo 64 categorias.");
    const id = key ?? uuidV7();
    change(key ? items.map((item) => item.key === key ? { ...item, name: trimmed } : item)
      : [...items, { key: id, name: trimmed, fields: [] }]);
    setActive(id); setDialog(null);
  };
  const field = (source: string, key: string | undefined, target: string, name: string, type: CodexFieldType) => {
    if (readOnly || lock.current) return;
    if (!items.some((item) => item.key === target)) throw new CodexError("validation", "Escolha uma categoria válida.");
    const old = items.find((item) => item.key === source)?.fields.find((item) => item.key === key);
    if (!old && fieldCount >= 256) throw new CodexError("validation", "Use no máximo 256 campos.");
    const next: DraftField = old ? changedField(old, name, type)
      : { key: uuidV7(), label: label(name), field_type: type, value: defaultValue(type), config: {} };
    change(placedField(items, old ? source : undefined, target, next));
    setActive(target); setDialog(null);
  };
  const value = (categoryKey: string, fieldKey: string, next: CodexJSON) => change(items.map((item) => item.key !== categoryKey ? item
    : { ...item, fields: item.fields.map((field) => field.key === fieldKey ? { ...field, value: next } : field) }));
  const moveCategory = (offset: number) => change(moved(items, items.findIndex((item) => item.key === active?.key), offset));
  const moveField = (key: string, offset: number) => change(items.map((item) => item.key !== active?.key ? item
    : { ...item, fields: moved(item.fields, item.fields.findIndex((field) => field.key === key), offset) }));
  const remove = () => {
    if (!removal || readOnly || lock.current) return;
    if (removal.kind === "reset") { setItems(structuredClone(saved.current)); setRevision((old) => old + 1); setError(initial.error); }
    else change(removal.kind === "category" ? items.filter((item) => item.key !== removal.key)
      : items.map((item) => item.key !== removal.category ? item : { ...item, fields: item.fields.filter((field) => field.key !== removal.key) }));
    setRemoval(null);
  };
  async function save() {
    if (readOnly || lock.current || !dirty) return;
    lock.current = true; setBusy(true); setError(null); setAnnouncement("");
    try {
      const result = await saveCodexStructure(scope, sheet.entity.id, structureInput(items));
      const next = draftFromSheet(result);
      const index = items.findIndex((item) => item.key === active?.key);
      setItems(next); saved.current = next; setBaseline(JSON.stringify(next)); setActive(next[index]?.key ?? next[0]?.key ?? "");
      setRevision((old) => old + 1); setAnnouncement("Categorias e campos salvos.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Não foi possível salvar os campos."); }
    finally { lock.current = false; setBusy(false); }
  }
  return { items, active, busy, dirty, readOnly, error, announcement, revision, fieldCount, dialog, removal,
    templateOpen, openTemplate: () => setTemplateOpen(true), closeTemplate: () => setTemplateOpen(false),
    templateSaved: (name: string) => { setTemplateOpen(false); setAnnouncement(`Modelo ${name} salvo. Disponível ao criar novas fichas deste tipo.`); },
    select: setActive, open: setDialog, close: () => setDialog(null), askRemove: setRemoval, cancelRemove: () => setRemoval(null),
    category, field, value, moveCategory, moveField, remove, save };
}
export type CodexStructureEditor = ReturnType<typeof useCodexStructure>;

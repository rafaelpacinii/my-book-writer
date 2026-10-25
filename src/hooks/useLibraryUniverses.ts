"use client";

import { useRef, useState } from "react";
import { useUniverses } from "@/hooks/useUniverses";
import type { Universe } from "@/types/universe";

type Dialog = { kind: "create" } | { kind: "edit" | "delete"; universe: Universe };

export function useLibraryUniverses(profileId?: string) {
  const data = useUniverses(profileId);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const locked = useRef(false);

  async function run(action: () => Promise<unknown>, message: string) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setActionError(null);
    try { await action(); setAnnouncement(message); setDialog(null); }
    catch (error) { setActionError(error instanceof Error ? error.message : "Não foi possível salvar o universo. Tente novamente."); }
    finally { locked.current = false; setBusy(false); }
  }
  async function save(name: string, description: string) {
    if (!dialog || !profileId) return;
    await run(() => dialog.kind === "create"
      ? data.addUniverse({ profile_id: profileId, name, description })
      : data.editUniverse(dialog.universe.id, { name, description }), "Universo salvo.");
  }
  async function remove() {
    if (dialog?.kind !== "delete") return;
    await run(() => data.removeUniverse(dialog.universe.id), "Universo excluído. As séries e os livros foram preservados.");
  }
  const updateUniverse = (id: string, name: string, description: string) => {
    const trimmed = name.trim();
    if (!trimmed) return Promise.resolve(false);
    return run(() => data.editUniverse(id, { name: trimmed, description: description.trim() }), "Universo salvo.");
  };
  return {
    ...data, dialog, busy, actionError, announcement, save, remove, updateUniverse,
    open: (next: Dialog) => { setActionError(null); setDialog(next); },
    close: () => { if (!locked.current) setDialog(null); },
  };
}
export type LibraryUniverses = ReturnType<typeof useLibraryUniverses>;

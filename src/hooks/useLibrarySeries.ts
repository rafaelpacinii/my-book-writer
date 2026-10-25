"use client";

import { useRef, useState } from "react";
import { useSeries } from "@/hooks/useSeries";
import type { BookSeries } from "@/types/series";

type SeriesDialog = { kind: "create"; universeId?: string } | { kind: "edit" | "delete"; series: BookSeries };

export function useLibrarySeries(profileId?: string) {
  const data = useSeries(profileId);
  const [dialog, setDialog] = useState<SeriesDialog | null>(null);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  async function run(action: () => Promise<unknown>, message: string) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setActionError(null);
    try {
      await action();
      setAnnouncement(message);
      return true;
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Não foi possível salvar a série. Tente novamente.");
      return false;
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function save(name: string, description: string) {
    if (!dialog || !profileId || !name.trim()) return;
    const ok = await run(() => dialog.kind === "create"
      ? data.addSeries({ profile_id: profileId, name, description, universe_id: dialog.universeId })
      : data.editSeries(dialog.series.id, { name, description }), "Série salva.");
    if (ok) setDialog(null);
  }

  async function remove() {
    if (!dialog || dialog.kind !== "delete") return;
    const ok = await run(() => data.removeSeries(dialog.series.id), "Série excluída. Os livros foram preservados.");
    if (ok) setDialog(null);
  }

  const updateSeries = (id: string, name: string, description: string) => {
    const trimmed = name.trim();
    if (!trimmed) return Promise.resolve(false);
    return run(() => data.editSeries(id, { name: trimmed, description: description.trim() }), "Série salva.");
  };

  return {
    ...data, dialog, busy, actionError, announcement, save, remove, updateSeries,
    open: (next: SeriesDialog) => { setActionError(null); setDialog(next); },
    close: () => { if (!locked.current) setDialog(null); },
    reorder: (id: string, ids: string[]) => run(
      () => data.reorderBooksInSeries(id, ids), "Ordem dos volumes salva.",
    ),
  };
}

export type LibrarySeries = ReturnType<typeof useLibrarySeries>;

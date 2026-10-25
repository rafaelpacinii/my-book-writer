"use client";

import { useRef, useState } from "react";
import type { LibraryEntry, LibraryScope } from "@/types/library";

const keyOf = (entry: LibraryEntry) => `${entry.kind}:${entry.kind === "book" ? entry.book.id : entry.collection.id}`;

export function useLibraryInspector(scope: LibraryScope, entries: LibraryEntry[]) {
  const scopeKey = scope.kind === "series" || scope.kind === "universe" ? keyOf(scope) : scope.kind;
  const [selection, setSelection] = useState<{ scope: string; key: string } | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const trigger = useRef<HTMLElement | null>(null);
  const selected = selection?.scope === scopeKey ? entries.find((entry) => keyOf(entry) === selection.key) : undefined;
  const entry = selected ?? (scope.kind === "series" || scope.kind === "universe" ? scope : null);

  return {
    isOpen, navigationOpen, entry, selectedId: selected?.kind === "book" ? selected.book.id : undefined,
    toggleNavigation: () => setNavigationOpen((open) => !open),
    toggle: () => setOpen((open) => !open),
    select: (next: LibraryEntry, element: HTMLElement) => {
      trigger.current = element;
      setSelection({ scope: scopeKey, key: keyOf(next) });
      setOpen(true);
    },
    close: () => { setOpen(false); if (trigger.current?.isConnected) trigger.current.focus(); },
  };
}

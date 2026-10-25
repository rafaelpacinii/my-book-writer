"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { SheetDirtyContext, SheetNavigationContext } from "@/lib/codex/editing";
import { useUnsavedNavigation } from "@/hooks/useUnsavedNavigation";
import { DiscardChangesModal } from "@/components/books/settings/DiscardChangesModal";

export function SheetEditingProvider({ backHref, children }: { backHref: string; children: ReactNode }) {
  const [changes, setChanges] = useState<Record<string, boolean>>({});
  const register = useCallback((key: string, dirty: boolean) => {
    setChanges((current) => current[key] === dirty ? current : { ...current, [key]: dirty });
  }, []);
  const dirty = Object.values(changes).some(Boolean);
  const navigation = useUnsavedNavigation(dirty, backHref);
  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);
  return (
    <SheetDirtyContext.Provider value={register}>
      <SheetNavigationContext.Provider value={navigation.requestNavigation}>{children}</SheetNavigationContext.Provider>
      <DiscardChangesModal isOpen={navigation.isOpen} onClose={navigation.close} onDiscard={navigation.confirm} />
    </SheetDirtyContext.Provider>
  );
}

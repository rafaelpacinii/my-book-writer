"use client";

import { useContext, useEffect } from "react";
import { SheetDirtyContext } from "@/lib/codex/editing";

export function useSheetDirty(key: string, dirty: boolean) {
  const register = useContext(SheetDirtyContext);
  if (!register) throw new Error("A edição da ficha exige o contexto de alterações.");
  useEffect(() => { register(key, dirty); return () => register(key, false); }, [register, key, dirty]);
}

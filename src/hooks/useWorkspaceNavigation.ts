"use client";

import { createContext, useContext } from "react";
import type { useMobileNavigation } from "@/hooks/useMobileNavigation";

export const WorkspaceNavigationContext = createContext<ReturnType<typeof useMobileNavigation> | null>(null);

export function useWorkspaceNavigation() {
  const menu = useContext(WorkspaceNavigationContext);
  if (!menu) throw new Error("A navegação precisa estar dentro da área de trabalho.");
  return menu;
}

"use client";

import type { ReactNode } from "react";
import { useMobileNavigation } from "@/hooks/useMobileNavigation";
import { WorkspaceNavigationContext } from "@/hooks/useWorkspaceNavigation";

export function WorkspaceNavigationProvider({ children }: { children: ReactNode }) {
  const menu = useMobileNavigation();
  return <WorkspaceNavigationContext value={menu}>{children}</WorkspaceNavigationContext>;
}

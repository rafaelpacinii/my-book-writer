"use client";

import type { ReactNode } from "react";
import { useEditorPreferences } from "@/hooks/useEditorPreferences";
import { useTheme } from "@/hooks/useTheme";
import { useSidebarCollapse } from "@/hooks/useSidebarCollapse";

export function PreferenceProvider({ children }: { children: ReactNode }) {
  useTheme();
  useEditorPreferences();
  useSidebarCollapse();
  return children;
}

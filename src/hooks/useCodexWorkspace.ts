"use client";

import { useContext } from "react";
import { CodexWorkspaceContext } from "@/lib/codex/workspace";

export function useCodexWorkspace() {
  const workspace = useContext(CodexWorkspaceContext);
  if (!workspace) throw new Error("O Códice exige seu espaço de trabalho compartilhado.");
  return workspace;
}

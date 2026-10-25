"use client";

import { CodexContent } from "@/components/codex/CodexContent";
import { useCodexWorkspace } from "@/hooks/useCodexWorkspace";

export function Main() {
  const hub = useCodexWorkspace();
  return hub.isLoading || hub.error ? null : <CodexContent hub={hub} />;
}

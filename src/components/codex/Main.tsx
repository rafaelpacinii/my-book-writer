"use client";

import { CodexContent } from "@/components/codex/CodexContent";
import { useCodexWorkspace } from "@/hooks/useCodexWorkspace";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { CodexSkeleton } from "@/components/codex/CodexSkeleton";

export function Main() {
  const hub = useCodexWorkspace();
  return (
    <div id="codex-panel" role="tabpanel" aria-labelledby={`codex-tab-${hub.kind}`}>
      {hub.error && <ErrorState message={hub.error} onRetry={hub.retry} />}
      {(!hub.error || hub.entities.length > 0) && (
        <LoadingRegion isLoading={hub.isLoading && !hub.entities.length} label="Carregando Códice" skeleton={<CodexSkeleton />}>
          <CodexContent hub={hub} />
        </LoadingRegion>
      )}
    </div>
  );
}

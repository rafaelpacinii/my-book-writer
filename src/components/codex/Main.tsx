"use client";

import { PageContent } from "@/components/shared/PageContent";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { CodexHeader } from "@/components/codex/CodexHeader";
import { CodexFilters } from "@/components/codex/CodexFilters";
import { CodexContent } from "@/components/codex/CodexContent";
import { CodexSkeleton } from "@/components/codex/CodexSkeleton";
import { CodexCreateDialog } from "@/components/codex/CodexCreateDialog";
import { useCodexHub } from "@/hooks/useCodexHub";
import { contextKey } from "@/utils/codexHub";

export function Main() {
  const hub = useCodexHub();
  const selectionKey = `${hub.context ? contextKey(hub.context) : "none"}:${hub.kind}`;
  return (
    <PageContent>
      <CodexHeader hub={hub} />
      <CodexFilters hub={hub} />
      <p role="status" className="sr-only">{hub.announcement}</p>
      <div id="codex-panel" role="tabpanel" aria-labelledby={`codex-tab-${hub.kind}`}>
        {hub.error ? <ErrorState message={hub.error} onRetry={hub.retry} /> : (
          <LoadingRegion isLoading={hub.isLoading} label="Carregando Códice" skeleton={<CodexSkeleton />}>
            <CodexContent hub={hub} />
          </LoadingRegion>
        )}
      </div>
      {hub.creating && hub.scope && hub.canCreate && (
        <CodexCreateDialog key={selectionKey} scope={hub.scope} kind={hub.kind} contextName={hub.context?.name ?? ""}
          onClose={() => hub.setCreating(false)} onCreated={hub.created} />
      )}

    </PageContent>
  );
}

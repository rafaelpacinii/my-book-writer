import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { CodexSkeleton } from "@/components/codex/CodexSkeleton";
import { CodexFilters } from "@/components/codex/CodexFilters";
import { CodexEntryList } from "@/components/codex/CodexEntryList";
import type { CodexHub } from "@/hooks/useCodexHub";
import panels from "@/components/shared/panelWorkspace.module.css";
import styles from "@/components/codex/codexWorkspace.module.css";

export function CodexNavigation({ hub }: { hub: CodexHub }) {
  return (
    <section className={`${panels.navigation} ${styles.navigation}`} aria-label="Navegador de fichas">
      <div className={styles.filters}><CodexFilters hub={hub} /></div>
      <div id="codex-panel" role="tabpanel" aria-labelledby={`codex-tab-${hub.kind}`} className="flex min-h-0 flex-1 flex-col">
        {hub.error ? <div className="p-4"><ErrorState message={hub.error} onRetry={hub.retry} /></div> : (
          <LoadingRegion isLoading={hub.isLoading && !hub.entities.length} label="Carregando Códice" skeleton={<CodexSkeleton />}
            className="flex min-h-0 flex-1 flex-col"><CodexEntryList hub={hub} /></LoadingRegion>
        )}
      </div>
    </section>
  );
}

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { CodexFilters } from "@/components/codex/CodexFilters";
import { CodexEntryList } from "@/components/codex/CodexEntryList";
import type { CodexHub } from "@/hooks/useCodexHub";
import panels from "@/components/shared/panelWorkspace.module.css";
import styles from "@/components/codex/codexWorkspace.module.css";

export function CodexNavigation({ hub, filtersOpen, toggleFilters }: {
  hub: CodexHub; filtersOpen: boolean; toggleFilters: () => void;
}) {
  return (
    <section id="codex-navigation" className={`${panels.navigation} ${styles.navigation}`}
      aria-label="Navegador de fichas" data-filters-open={filtersOpen}>
      <button type="button" className={styles.filtersToggle} onClick={toggleFilters}
        aria-expanded={filtersOpen} aria-controls="codex-filters">
        <SlidersHorizontal size={15} aria-hidden="true" />Contexto e filtros<ChevronDown size={14} aria-hidden="true" />
      </button>
      <div id="codex-filters" className={styles.filters}><CodexFilters hub={hub} /></div>
      {hub.selectedId && <div id="codex-panel" role="tabpanel" aria-labelledby={`codex-tab-${hub.kind}`}
        className="flex min-h-0 flex-1 flex-col"><CodexEntryList hub={hub} /></div>}
    </section>
  );
}

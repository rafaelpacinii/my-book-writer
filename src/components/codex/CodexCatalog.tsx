import { Plus } from "lucide-react";
import { CodexCatalogCard } from "@/components/codex/CodexCatalogCard";
import { LibraryViewToggle } from "@/components/library/LibraryViewToggle";
import { codexLabels } from "@/utils/codexHub";
import type { CodexHub } from "@/hooks/useCodexHub";
import styles from "@/components/codex/codexCatalog.module.css";

export function CodexCatalog({ hub }: { hub: CodexHub }) {
  const scope = hub.scope;
  return (
    <div data-codex-catalog className={styles.catalog} data-view={hub.view}>
      <div className={styles.results}>
        <h2>Suas fichas <span>({hub.visible.length})</span></h2>
        <LibraryViewToggle view={hub.view} onChange={hub.setView} label="Visualização do Códice" />
      </div>
      <div className={styles.grid}>
        <div className={styles.createItem}>
          <button type="button" aria-label="Nova ficha" onClick={() => hub.setCreating(true)}
            disabled={!hub.canCreate || hub.isLoading} className={styles.createCard}>
            <Plus size={28} strokeWidth={1.5} aria-hidden="true" />
            <span className="font-display text-2xl">Nova ficha</span>
            <span className="text-xs text-muted">{codexLabels[hub.kind].singular} para sua história</span>
          </button>
        </div>
        {scope && hub.visible.map((entity) => <CodexCatalogCard key={entity.id} entity={entity} scope={scope} />)}
      </div>
    </div>
  );
}

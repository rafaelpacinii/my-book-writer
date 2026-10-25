import { CodexCard } from "@/components/codex/CodexCard";
import type { CodexHub } from "@/hooks/useCodexHub";
import styles from "@/components/codex/codexWorkspace.module.css";

export function CodexEntryList({ hub }: { hub: CodexHub }) {
  const scope = hub.scope;
  return (
    <div className={styles.list} aria-label="Lista de fichas" role="region" data-codex-list tabIndex={0}>
      <p role="status">{hub.visible.length} {hub.visible.length === 1 ? "ficha" : "fichas"}</p>
      {!hub.visible.length && <p>{hub.search.trim() ? "Nenhuma ficha encontrada." : "Nenhuma ficha nesta lista."}</p>}
      {scope && hub.visible.map((entity) => (
        <CodexCard key={entity.id} entity={entity} scope={scope} selected={hub.selectedId === entity.id} />
      ))}
    </div>
  );
}

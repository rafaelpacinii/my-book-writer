"use client";

import type { ReactNode } from "react";
import { List } from "lucide-react";
import { PageContent } from "@/components/shared/PageContent";
import { CodexHeader } from "@/components/codex/CodexHeader";
import { CodexNavigation } from "@/components/codex/CodexNavigation";
import { CodexCreateDialog } from "@/components/codex/CodexCreateDialog";
import { SheetEditingProvider } from "@/components/codex/sheet/SheetEditingProvider";
import { CodexWorkspaceContext } from "@/lib/codex/workspace";
import { useCodexHub } from "@/hooks/useCodexHub";
import { useCodexPanels } from "@/hooks/useCodexPanels";
import { contextKey } from "@/utils/codexHub";
import panels from "@/components/shared/panelWorkspace.module.css";
import styles from "@/components/codex/codexWorkspace.module.css";

export function CodexWorkspace({ children }: { children: ReactNode }) {
  return <SheetEditingProvider backHref="/codex"><WorkspaceContent>{children}</WorkspaceContent></SheetEditingProvider>;
}

function WorkspaceContent({ children }: { children: ReactNode }) {
  const hub = useCodexHub();
  const view = useCodexPanels(hub.selectedId);
  const selectionKey = `${hub.context ? contextKey(hub.context) : "none"}:${hub.kind}`;
  return (
    <CodexWorkspaceContext.Provider value={hub}>
      <PageContent className={panels.workspace}>
        <div className={panels.header}><CodexHeader hub={hub} />
          {hub.selectedId && <button type="button" className={styles.listToggle} onClick={view.toggleList}
            aria-expanded={view.listOpen} aria-controls="codex-panel"><List size={15} aria-hidden="true" />
            {view.listOpen ? "Ocultar lista" : "Ver fichas"}</button>}
        </div>
        <p role="status" className="sr-only">{hub.announcement}</p>
        <div className={`${panels.body} ${styles.layout}`} data-selected={Boolean(hub.selectedId)}
          data-list-open={view.listOpen} data-has-entries={hub.visible.length > 0}>
          <CodexNavigation hub={hub} />
          <section ref={view.detailRef} className={`${panels.catalog} ${styles.detail}`}
            aria-label="Conteúdo da ficha" data-codex-detail tabIndex={0}>{children}</section>
        </div>
        {hub.creating && hub.scope && hub.canCreate && (
          <CodexCreateDialog key={selectionKey} scope={hub.scope} kind={hub.kind} contextName={hub.context?.name ?? ""}
            onClose={() => hub.setCreating(false)} onCreated={hub.created} />
        )}
      </PageContent>
    </CodexWorkspaceContext.Provider>
  );
}

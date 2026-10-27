import { ArrowLeft, List } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { Button } from "@/components/ui/Button";
import { codexHref } from "@/utils/codexHub";
import type { CodexHub } from "@/hooks/useCodexHub";
import styles from "@/components/codex/codexWorkspace.module.css";

export function CodexWorkspaceControls({ hub, listOpen, toggleList }: {
  hub: CodexHub; listOpen: boolean; toggleList: () => void;
}) {
  return (
    <div className={styles.toolbar}>
      <LinkButton href={hub.context ? codexHref(hub.context, hub.kind) : "/codex"} variant="ghost">
        <ArrowLeft size={16} aria-hidden="true" />Voltar ao Códice
      </LinkButton>
      <Button type="button" variant="outline" onClick={toggleList}
        aria-expanded={listOpen} aria-controls="codex-navigation">
        <List size={16} aria-hidden="true" />{listOpen ? "Ocultar lista" : "Ver fichas"}
      </Button>
    </div>
  );
}

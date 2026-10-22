import { EditorSaveIndicator } from "./EditorSaveIndicator";
import { EditorViewMode } from "./EditorViewMode";
import type { SaveStatus } from "./useChapterEditor";
import styles from "./editorChrome.module.css";

interface Props {
  wordCount: number;
  readingTime: string;
  viewMode: "continuous" | "paged";
  onViewModeChange: (mode: "continuous" | "paged") => void;
  saveStatus: SaveStatus;
  autosaveEnabled: boolean;
  onSave: () => void;
  isFocusMode: boolean;
}

export function EditorFooter(props: Props) {
  if (props.isFocusMode && props.saveStatus !== "error") return null;
  return (
    <footer role="region" aria-label="Status do editor" className={`${styles.footer} border-t border-border bg-surface text-xs text-muted select-none`}>
      {!props.isFocusMode && (
        <span className="whitespace-nowrap">
          <strong className="font-medium text-foreground">{props.wordCount.toLocaleString("pt-BR")}</strong>{" "}
          {props.wordCount === 1 ? "palavra" : "palavras"}
          <span className={styles.readingTime}> · {props.readingTime}</span>
        </span>
      )}
      <div className={styles.saveStatus}>
        <EditorSaveIndicator status={props.saveStatus} autosaveEnabled={props.autosaveEnabled} onSave={props.onSave} />
      </div>
      {!props.isFocusMode && <EditorViewMode value={props.viewMode} onChange={props.onViewModeChange} />}
    </footer>
  );
}

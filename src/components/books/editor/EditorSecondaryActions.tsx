import Link from "next/link";
import { BookOpen, Maximize2 } from "lucide-react";
import { EditorReviewButton } from "./EditorReviewButton";
import { EditorHistoryButton } from "./EditorHistoryButton";
import type { EditorActionProps } from "./editorActionTypes";
import styles from "./editorChrome.module.css";

export function EditorSecondaryActions(props: EditorActionProps) {
  return (
    <>
      <Link href={`/books/preview?bookId=${encodeURIComponent(props.bookId)}&chapterId=${encodeURIComponent(props.chapterId)}`}
        aria-label="Ver livro completo" title="Ver livro completo"
        className={`${styles.action} text-muted hover:bg-surface-hover hover:text-foreground`}
      >
        <BookOpen className="h-4 w-4" /><span>Ver livro</span>
      </Link>
      <EditorReviewButton isOpen={props.isReviewOpen} onToggle={props.onToggleReview}
        openCommentsCount={props.openCommentsCount} needsRecheck={props.needsRecheck} />
      <EditorHistoryButton isOpen={props.isVersionOpen} onToggle={props.onToggleVersion} count={props.versionsCount} />
      <button type="button" onClick={props.onToggleFocus}
        className={`${styles.action} text-muted hover:bg-surface-hover hover:text-foreground`} title="Modo foco"
      >
        <Maximize2 className="h-4 w-4" /><span>Modo foco</span>
      </button>
    </>
  );
}

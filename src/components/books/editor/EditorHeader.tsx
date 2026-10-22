import type { ReactNode } from "react";
import { BookBreadcrumbs } from "@/components/shared/BookBreadcrumbs";
import styles from "./editorChrome.module.css";

interface Props {
  bookId: string;
  bookTitle?: string;
  children: ReactNode;
}

export function EditorHeader({ bookId, bookTitle, children }: Props) {
  return (
    <header role="region" aria-label="Editor do livro" className={`${styles.header} border-b border-border bg-surface select-none`}>
      <div className={styles.location}>
        <BookBreadcrumbs bookId={bookId} bookTitle={bookTitle} current="Editor" />
      </div>
      {children}
    </header>
  );
}

import type { ReactNode } from "react";
import styles from "./editorChrome.module.css";

interface Props {
  children: ReactNode;
}

export function EditorHeader({ children }: Props) {
  return (
    <header role="region" aria-label="Editor do livro" className={`${styles.header} border-b border-border bg-surface select-none`}>
      {children}
    </header>
  );
}

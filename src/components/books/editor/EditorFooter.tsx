import React from "react";

interface Props {
  wordCount: number;
  readingTime: string;
  viewMode?: "continuous" | "paged";
}

export function EditorFooter({
  wordCount, readingTime, viewMode = "continuous",
}: Props) {
  const isPaged = viewMode === "paged";

  return (
    <footer className="h-11 px-6 border-t border-border bg-surface flex items-center justify-between text-xs text-muted select-none shrink-0">
      <div>
        <span>
          <strong className="text-foreground font-semibold">{wordCount.toLocaleString()}</strong>{" "}
          {wordCount === 1 ? "palavra" : "palavras"}
        </span>
        <span className="mx-2 text-border">·</span>
        <span>português</span>
      </div>

      <div className="hidden sm:block">
        <span>{isPaged ? "Diagramação em tempo real" : "Salvamento automático local"}</span>
      </div>

      <span>{readingTime}</span>
    </footer>
  );
}

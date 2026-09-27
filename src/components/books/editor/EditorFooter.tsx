import React from "react";

interface Props {
  wordCount: number;
  charCount: number;
  readingTime: string;
  lastSavedAt: Date | null;
}

export function EditorFooter({
  wordCount,
  charCount,
  readingTime,
  lastSavedAt,
}: Props) {
  const formattedSavedAt = lastSavedAt
    ? lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 py-3 border-t border-border/70 text-xs text-muted select-none">
      <div className="flex items-center gap-4 flex-wrap">
        <span>
          <strong className="text-foreground font-semibold">{wordCount.toLocaleString()}</strong>{" "}
          {wordCount === 1 ? "palavra" : "palavras"}
        </span>
        <span className="text-border">·</span>
        <span>
          <strong className="text-foreground font-semibold">{charCount.toLocaleString()}</strong>{" "}
          {charCount === 1 ? "caractere" : "caracteres"}
        </span>
        <span className="text-border">·</span>
        <span>{readingTime}</span>
      </div>

      {formattedSavedAt && (
        <span className="text-[11px] text-muted/80">
          Último salvamento às {formattedSavedAt}
        </span>
      )}
    </footer>
  );
}

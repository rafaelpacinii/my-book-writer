import React from "react";

interface Props {
  kind: "dedication" | "epigraph" | "blank";
  text?: string | null;
  author?: string | null;
}

export function PreviewSpecialPage({ kind, text, author }: Props) {
  if (kind === "blank") {
    return <div className="h-full select-none" />;
  }

  if (kind === "dedication") {
    return (
      <div className="h-full flex flex-col justify-end items-end pb-24 text-right pr-4 select-text">
        <p className="font-serif italic text-sm text-ink/90 max-w-[70%] leading-relaxed whitespace-pre-line">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-end items-end pb-24 text-right pr-4 select-text">
      <blockquote className="font-serif italic text-sm text-ink/90 max-w-[75%] leading-relaxed">
        “{text}”
      </blockquote>
      {author && (
        <p className="font-serif text-xs text-ink/70 mt-2">
          — {author}
        </p>
      )}
    </div>
  );
}


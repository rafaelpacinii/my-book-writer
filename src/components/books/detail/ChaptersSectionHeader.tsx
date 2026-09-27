import React from "react";

interface Props {
  chaptersCount: number;
  estimatedPages?: number;
}

export function ChaptersSectionHeader({ chaptersCount, estimatedPages = 0 }: Props) {
  const subtitle =
    chaptersCount === 0
      ? "Seu livro começa aqui"
      : `${chaptersCount} ${chaptersCount === 1 ? "capítulo" : "capítulos"}${estimatedPages > 0 ? ` · ${estimatedPages} páginas estimadas` : ""
      }`;

  return (
    <div className="flex items-center justify-between gap-4 pt-6 border-t border-border mb-6 select-none">
      <h2 className="font-bold text-xl text-foreground">Capítulos</h2>
      <p className="text-xs text-muted font-medium">{subtitle}</p>
    </div>
  );
}

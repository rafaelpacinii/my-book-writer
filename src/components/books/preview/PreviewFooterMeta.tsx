interface Props {
  words: number;
  page: number;
  totalPages: number;
  chapterTitle?: string;
}

export function PreviewFooterMeta({ words, page, totalPages, chapterTitle }: Props) {
  const pct = totalPages > 0 ? Math.round((page / totalPages) * 100) : 0;

  return (
    <div className="flex items-center gap-4 text-xs text-muted select-none min-w-0">
      <span className="whitespace-nowrap shrink-0">
        <strong className="text-foreground font-semibold">{words.toLocaleString("pt-BR")}</strong>
        {words === 1 ? " palavra" : " palavras"} · português
      </span>
      <span className="hidden md:inline-block text-border">|</span>
      <span role="status" className="hidden sm:inline-block truncate">
        {totalPages > 0 ? (
          <>
            Página <strong className="text-foreground">{page}</strong> de {totalPages} ({pct}%)
            {chapterTitle ? ` · ${chapterTitle}` : ""}
          </>
        ) : (
          "Calculando páginas…"
        )}
      </span>
    </div>
  );
}


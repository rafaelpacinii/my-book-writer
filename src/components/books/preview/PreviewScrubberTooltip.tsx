interface Props {
  page: number;
  totalPages: number;
  chapterTitle?: string;
  percent: number;
}

export function PreviewScrubberTooltip({ page, totalPages, chapterTitle, percent }: Props) {
  const pct = Math.round((page / Math.max(1, totalPages)) * 100);

  return (
    <div
      style={{ left: `${percent}%` }}
      className="absolute bottom-full mb-2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center"
    >
      <div className="bg-surface text-foreground border border-border shadow-lg px-3 py-1.5 rounded-lg text-xs whitespace-nowrap flex flex-col items-center gap-0.5">
        {chapterTitle && (
          <span className="font-semibold text-foreground max-w-[180px] truncate">
            {chapterTitle}
          </span>
        )}
        <span className="text-[11px] text-muted">
          Página {page} de {totalPages} ({pct}%)
        </span>
      </div>
      <div className="w-2 h-2 bg-surface border-r border-b border-border rotate-45 -mt-1" />
    </div>
  );
}

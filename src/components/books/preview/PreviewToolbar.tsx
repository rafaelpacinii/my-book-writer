import Link from "next/link";
import { EditorPagedNavigation } from "@/components/books/editor/EditorPagedNavigation";

interface Props {
  bookId: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PreviewToolbar({ bookId, page, totalPages, onPageChange }: Props) {
  return (
    <div className="h-[59px] px-6 border-b border-border bg-surface flex items-center justify-between gap-4 select-none shrink-0 overflow-x-auto">
      <span className="text-[13px] font-bold text-foreground whitespace-nowrap">Visualização de impressão</span>
      <div className="flex items-center gap-3 text-xs text-muted">
        <EditorPagedNavigation currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        <Link
          href={`/books/export?bookId=${encodeURIComponent(bookId)}`}
          className="inline-flex items-center h-10 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-bold hover:bg-primary-hover transition-colors whitespace-nowrap"
        >
          Exportar PDF
        </Link>
      </div>
    </div>
  );
}


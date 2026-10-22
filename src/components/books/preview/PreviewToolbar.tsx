import Link from "next/link";
import { EditorPagedNavigation } from "@/components/books/editor/EditorPagedNavigation";

interface Props {
  bookId: string;
  chapterId: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PreviewToolbar({ bookId, chapterId, page, totalPages, onPageChange }: Props) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3 text-xs text-muted">
      <EditorPagedNavigation currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
      <Link href={`/books/editor?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(chapterId)}`}
        className="inline-flex min-h-10 items-center rounded-lg border border-control-border px-3 font-semibold text-foreground hover:bg-surface-hover"
      >Voltar ao editor</Link>
      <Link
        href={`/books/export?bookId=${encodeURIComponent(bookId)}`}
        className="inline-flex items-center h-10 px-4 rounded-lg bg-primary text-primary-foreground text-[13px] font-bold hover:bg-primary-hover transition-colors whitespace-nowrap"
      >
        Exportar
      </Link>
    </div>
  );
}


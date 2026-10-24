import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { exportIssues } from "@/utils/bookExport";
import type { ExportFormat, PdfExportInfo } from "@/types/export";

interface Props {
  bookId: string;
  info: PdfExportInfo;
  format: ExportFormat;
  disabled: boolean;
  onReload: () => void;
}

export function ExportIssues({ bookId, info, format, disabled, onReload }: Props) {
  const issues = exportIssues(info, format);
  if (!issues.length) return null;
  const query = `bookId=${encodeURIComponent(bookId)}`;
  return (
    <section aria-labelledby="export-issues-title" className="my-6 rounded-xl border border-warning bg-surface p-5">
      <h2 id="export-issues-title" className="font-semibold text-foreground">Ajustes necessários para exportar</h2>
      <ul className="my-4 space-y-4 text-sm text-foreground">
        {issues.map((issue, index) => (
          <li key={`${issue.code}-${issue.chapter_id ?? index}`}>
            <p>{issue.message}</p>
            <Link className="mt-1 inline-flex min-h-10 items-center font-semibold text-primary underline"
              href={issue.chapter_id ? `/books/editor?${query}&chapterId=${encodeURIComponent(issue.chapter_id)}`
                : issue.code === "page_layout" ? `/books/settings?${query}` : `/books/view?${query}`}>
              {issue.chapter_id ? "Abrir capítulo" : issue.code === "page_layout" ? "Ajustar configurações" : "Abrir livro"}
            </Link>
          </li>
        ))}
      </ul>
      <Button variant="outline" disabled={disabled} onClick={onReload}>Verificar novamente</Button>
    </section>
  );
}

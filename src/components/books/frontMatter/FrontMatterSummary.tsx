import Link from "next/link";
import { BookSectionCard } from "@/components/books/shared/BookSectionPage";
import type { SaveFrontMatterInput } from "@/types/frontMatter";

export function FrontMatterSummary({ bookId, form }: { bookId: string; form: SaveFrontMatterInput }) {
  const pages = [
    { label: "Falsa folha", enabled: form.include_half_title },
    { label: "Folha de rosto", enabled: form.include_title_page },
    { label: "Copyright e créditos", enabled: form.include_copyright_page && form.include_title_page },
    { label: "Dedicatória", enabled: form.include_dedication, pending: form.include_dedication && !form.dedication_text?.trim() },
    { label: "Epígrafe", enabled: form.include_epigraph, pending: form.include_epigraph && !form.epigraph_text?.trim() },
    { label: "Sumário", enabled: form.include_table_of_contents },
  ];
  return (
    <BookSectionCard className="lg:col-span-5">
      <h2 className="text-lg font-bold text-foreground">Organização do livro</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">Estas páginas aparecem antes dos capítulos, nesta ordem.</p>
      <ol className="my-6 space-y-3 text-sm">
        {pages.map((page, index) => (
          <li key={page.label} className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-foreground">{index + 1}. {page.label}</span>
            <span className={page.pending ? "text-warning" : page.enabled ? "text-primary" : "text-muted"}>
              {page.pending ? "Texto pendente" : page.enabled ? "Incluída" : "Não incluída"}
            </span>
          </li>
        ))}
      </ol>
      <p className="mb-3 text-xs leading-relaxed text-muted">Salve as alterações antes de conferir o livro completo.</p>
      <Link href={`/books/preview?bookId=${encodeURIComponent(bookId)}`} className="text-sm font-semibold text-primary hover:underline">
        Conferir livro completo
      </Link>
    </BookSectionCard>
  );
}

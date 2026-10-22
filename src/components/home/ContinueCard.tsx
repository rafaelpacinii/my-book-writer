import { ArrowUpRight } from "lucide-react";
import type { Book } from "@/types/book";
import { formatLastEdited } from "@/utils/format";
import { LinkButton } from "@/components/ui/LinkButton";
import { ContinueCover } from "@/components/home/ContinueCover";

export function ContinueCard({ book }: { book: Book }) {
  return (
    <section aria-label="Retomar seu livro" className="resume-card">
      <div className="relative z-10 min-w-0">
        <p className="editorial-eyebrow">Uma história esperando por você</p>
        <h2 className="mt-3 mb-3 max-w-[17ch] font-display text-[32px] leading-[1.05] wrap-anywhere">
          {book.title}
        </h2>
        <p className="text-[10px] leading-relaxed text-muted">
          {book.author_name || "Autor"} · Última alteração {formatLastEdited(book.updated_at)}
        </p>
        <LinkButton href={`/books/view?bookId=${encodeURIComponent(book.id)}`}
          className="mt-[18px] !min-h-[39px] !px-3 !text-[11px]"
        >
          Retomar meu livro<ArrowUpRight className="h-3.5 w-3.5" />
        </LinkButton>
      </div>
      <ContinueCover book={book} />
    </section>
  );
}

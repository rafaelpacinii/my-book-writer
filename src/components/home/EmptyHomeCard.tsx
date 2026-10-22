import { ArrowUpRight } from "lucide-react";
import { BookObject } from "@/components/shared/BookObject";
import { LinkButton } from "@/components/ui/LinkButton";

export function EmptyHomeCard() {
  return (
    <section className="resume-card">
      <div className="relative z-10 min-w-0">
        <p className="editorial-eyebrow">Uma página em branco</p>
        <h2 className="mt-3 font-display text-[32px] leading-tight">Sua primeira página ainda está por escrever.</h2>
        <p className="mt-3 text-xs leading-relaxed text-muted">Comece com um título. O resto vem com as palavras.</p>
        <LinkButton href="/books/new" className="mt-5 !text-[11px]">
          Criar primeiro livro<ArrowUpRight className="h-3.5 w-3.5" />
        </LinkButton>
      </div>
      <div className="resume-visual" aria-hidden="true">
        <BookObject book={{ id: "blank", title: "Sua próxima história", author_name: "", card_image_asset_id: null }} />
      </div>
    </section>
  );
}

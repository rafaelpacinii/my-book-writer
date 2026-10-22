import { BookObject } from "@/components/shared/BookObject";
import { LinkButton } from "@/components/ui/LinkButton";

export function LibraryEmpty() {
  return (
    <section className="flex flex-col items-center rounded-xl border border-border bg-surface px-7 py-10 text-center">
      <div className="mb-7" aria-hidden="true">
        <BookObject book={{ id: "blank", title: "Sua próxima história", author_name: "", card_image_asset_id: null }} />
      </div>
      <h2 className="font-display text-[32px] leading-tight">Sua biblioteca começa aqui.</h2>
      <p className="mt-2 text-xs text-muted">Dê um nome à sua próxima história.</p>
      <LinkButton href="/books/new" className="mt-6 !text-xs">Criar meu primeiro livro</LinkButton>
    </section>
  );
}

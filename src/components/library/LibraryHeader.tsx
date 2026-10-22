import { Plus } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { PageHeader } from "@/components/shared/PageHeader";

export function LibraryHeader() {
  return (
    <PageHeader title="Biblioteca" eyebrow="Suas histórias, seu tempo"
      description="Um espaço para tudo o que você ainda vai escrever."
      actions={<LinkButton href="/books/new" className="!min-h-10 !text-[11px]"><Plus className="h-3.5 w-3.5" />Novo livro</LinkButton>}
    />
  );
}

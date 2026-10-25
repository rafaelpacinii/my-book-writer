import { BookOpen, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { CodexCard } from "@/components/codex/CodexCard";
import { codexLabels } from "@/utils/codexHub";
import type { CodexHub } from "@/hooks/useCodexHub";

export function CodexContent({ hub }: { hub: CodexHub }) {
  if (!hub.context) return (
    <section className="rounded-xl border border-border bg-surface p-10 text-center">
      <BookOpen aria-hidden="true" className="mx-auto mb-4 text-primary" size={36} />
      <h2 className="text-xl font-bold text-foreground">Seu mundo começa com uma história</h2>
      <p className="my-4 text-sm text-muted">Crie um Livro ou Universo na Biblioteca para organizar suas fichas.</p>
      <LinkButton href="/library">Ir para a Biblioteca</LinkButton>
    </section>
  );
  if (hub.visible.length === 0) return (
    <section className="rounded-xl border border-border bg-surface p-10 text-center">
      {hub.search.trim() ? <Search aria-hidden="true" className="mx-auto mb-4 text-muted" size={36} />
        : <Sparkles aria-hidden="true" className="mx-auto mb-4 text-primary" size={36} />}
      <h2 className="text-xl font-bold text-foreground">
        {hub.search.trim() ? "Nenhuma ficha encontrada" : `Ainda não há ${codexLabels[hub.kind].plural.toLocaleLowerCase("pt-BR")}`}
      </h2>
      <p className="my-4 text-sm text-muted">
        {hub.search.trim() ? "Tente outro nome, papel ou tag." : "Dê forma às suas ideias com um modelo de ficha pronto para começar."}
      </p>
      {hub.search.trim() ? <Button variant="outline" onClick={() => hub.setSearch("")}>Limpar busca</Button>
        : hub.canCreate && <Button onClick={() => hub.setCreating(true)}>Criar primeira ficha</Button>}
    </section>
  );
  return (
    <section aria-label={`Fichas de ${codexLabels[hub.kind].plural.toLocaleLowerCase("pt-BR")}`}>
      <p className="mb-4 text-xs text-muted" role="status">{hub.visible.length} {hub.visible.length === 1 ? "ficha" : "fichas"}</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {hub.visible.map((entity) => <CodexCard key={entity.id} entity={entity} onOpen={() => hub.setSelected(entity.id)} />)}
      </div>
    </section>
  );
}

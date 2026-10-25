import { BookOpen, Search, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { CodexEmpty } from "@/components/codex/CodexEmpty";
import { codexLabels } from "@/utils/codexHub";
import type { CodexHub } from "@/hooks/useCodexHub";

export function CodexContent({ hub }: { hub: CodexHub }) {
  const scope = hub.scope;
  if (!hub.context || !scope) return (
    <CodexEmpty icon={BookOpen} title="Seu mundo começa com uma história"
      description="Crie um Livro ou Universo na Biblioteca para organizar suas fichas.">
      <LinkButton href="/library">Ir para a Biblioteca</LinkButton>
    </CodexEmpty>
  );
  if (hub.visible.length === 0) return (
    <CodexEmpty icon={hub.search.trim() ? Search : Sparkles}
      title={hub.search.trim() ? "Nenhuma ficha encontrada" : `Ainda não há ${codexLabels[hub.kind].plural.toLocaleLowerCase("pt-BR")}`}
      description={hub.search.trim() ? "Tente outro nome, papel ou tag." : "Dê forma às suas ideias com um modelo de ficha pronto para começar."}>
      {hub.search.trim() ? <Button variant="outline" onClick={() => hub.setSearch("")}>Limpar busca</Button>
        : hub.canCreate && <Button onClick={() => hub.setCreating(true)}>Criar primeira ficha</Button>}
    </CodexEmpty>
  );
  return (
    <CodexEmpty icon={UserRound} title="Escolha uma ficha"
      description="Selecione um nome na lista para consultar e desenvolver sua ficha aqui, sem perder o lugar no seu mundo." />
  );
}

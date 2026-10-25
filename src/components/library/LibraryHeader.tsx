import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import type { useLibrary } from "@/hooks/useLibrary";
import { LibraryCreateMenu } from "@/components/library/LibraryCreateMenu";

export function LibraryHeader({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  const scope = lib.scope;
  const scoped = scope.kind === "series" || scope.kind === "universe";
  const title = scoped ? scope.collection.name : "Biblioteca";
  const parentId = scope.kind === "series" ? scope.collection.universe_id : null;
  return (
    <header className={`flex justify-between gap-5 ${scoped ? "flex-col lg:flex-row lg:items-start" : "items-start"}`}>
      <div className="min-w-0">
        <p className="editorial-eyebrow">{scoped ? scope.kind === "series" ? "Série" : "Universo" : "Suas histórias, seu tempo"}</p>
        <h1 className="editorial-heading mt-1 mb-2.5">{title}</h1>
        <p className="text-xs leading-relaxed text-muted">{scoped ? scope.collection.description || "Explore os livros desta coleção." : "Um espaço para tudo o que você ainda vai escrever."}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {scope.kind !== "root" && (
          <LinkButton href={parentId ? `/library?universeId=${encodeURIComponent(parentId)}` : "/library"}
            variant="ghost" onClick={lib.handleClearFilters} aria-label="Voltar para a pasta anterior">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />Voltar
          </LinkButton>
        )}
        {scoped && <Button variant="outline" disabled={lib.busy} onClick={() => lib.editCollection(scope)}>Editar</Button>}
        <LibraryCreateMenu lib={lib} />
      </div>
    </header>
  );
}

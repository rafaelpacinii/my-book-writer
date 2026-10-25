import Link from "next/link";
import { BookOpen, Layers, Orbit, Plus } from "lucide-react";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { useLibraryCreateMenu } from "@/hooks/useLibraryCreateMenu";
import type { useLibrary } from "@/hooks/useLibrary";

export function LibraryCreateMenu({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  const menu = useLibraryCreateMenu();
  const scope = lib.scope;
  const params = new URLSearchParams();
  if (scope.kind === "series") params.set("seriesId", scope.collection.id);
  if (scope.kind === "universe") params.set("universeId", scope.collection.id);
  const bookHref = `/books/new${params.size ? `?${params}` : ""}`;
  const canCreateSeries = scope.kind !== "series";
  const canCreateUniverse = scope.kind === "root";

  const create = (kind: "series" | "universe") => {
    menu.close();
    if (kind === "universe") {
      if (!canCreateUniverse) return;
      lib.universeManager.open({ kind: "create" });
    } else {
      if (!canCreateSeries) return;
      lib.seriesManager.open({
        kind: "create",
        universeId: scope.kind === "universe" ? scope.collection.id : undefined,
      });
    }
  };

  return (
    <>
      <button ref={menu.triggerRef} type="button" aria-label="Criar na biblioteca" aria-expanded={menu.isOpen}
        popoverTarget={menu.id} disabled={lib.isLoading || lib.busy}
        className={`${buttonStyles("primary")} library-create-trigger`}>
        <Plus aria-hidden="true" size={21} />
      </button>
      <div id={menu.id} ref={menu.popoverRef} popover="auto" onToggle={menu.onToggle}
        className="library-create-menu" role="group" aria-label="Opções de criação">
        <Link href={bookHref} onClick={menu.close} className="library-create-book" aria-label="Criar livro">
          <BookOpen aria-hidden="true" size={20} />
          <span><strong>Livro</strong><small>Comece uma nova história</small></span>
        </Link>
        {canCreateSeries && (
          <button type="button" aria-label="Criar série" onClick={() => create("series")}>
            <Layers aria-hidden="true" size={18} />
            <span><strong>Série</strong><small>{scope.kind === "universe" ? "Neste universo" : "Na Biblioteca"}</small></span>
          </button>
        )}
        {canCreateUniverse && (
          <button type="button" aria-label="Criar universo" onClick={() => create("universe")}>
            <Orbit aria-hidden="true" size={18} />
            <span><strong>Universo</strong><small>Um mundo compartilhado na Biblioteca</small></span>
          </button>
        )}
      </div>
    </>
  );
}

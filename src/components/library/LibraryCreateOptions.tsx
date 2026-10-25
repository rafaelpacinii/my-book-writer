import Link from "next/link";
import { BookOpen, Layers, Orbit } from "lucide-react";
import type { useLibrary } from "@/hooks/useLibrary";
import { libraryBookCreationHref } from "@/utils/libraryCreation";

export function LibraryCreateOptions({ lib, onClose }: { lib: ReturnType<typeof useLibrary>; onClose: () => void }) {
  const scope = lib.scope;
  return (
    <>
      <Link href={libraryBookCreationHref(scope)} onClick={onClose} className="library-create-book" aria-label="Criar livro">
        <BookOpen aria-hidden="true" size={20} />
        <span><strong>Livro</strong><small>Comece uma nova história</small></span>
      </Link>
      {scope.kind !== "series" && <button type="button" aria-label="Criar série" onClick={() => {
        onClose();
        lib.seriesManager.open({ kind: "create", universeId: scope.kind === "universe" ? scope.collection.id : undefined });
      }}>
        <Layers aria-hidden="true" size={18} />
        <span><strong>Série</strong><small>{scope.kind === "universe" ? "Neste universo" : "Na Biblioteca"}</small></span>
      </button>}
      {scope.kind === "root" && <button type="button" aria-label="Criar universo" onClick={() => {
        onClose(); lib.universeManager.open({ kind: "create" });
      }}>
        <Orbit aria-hidden="true" size={18} />
        <span><strong>Universo</strong><small>Um mundo compartilhado na Biblioteca</small></span>
      </button>}
    </>
  );
}

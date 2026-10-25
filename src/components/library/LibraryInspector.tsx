import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { LibraryBookDetails } from "@/components/library/LibraryBookDetails";
import { collectionHref } from "@/utils/libraryExplorer";
import type { useLibrary } from "@/hooks/useLibrary";
import styles from "@/components/library/libraryWorkspace.module.css";

export function LibraryInspector({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  if (!lib.inspector.isOpen) return null;
  const entry = lib.inspector.entry;
  return (
    <aside id="library-inspector" aria-label="Detalhes da biblioteca" className={styles.inspector}>
      <header><p className="text-xs font-semibold text-muted">Detalhes</p>
        <Button variant="ghost" onClick={lib.inspector.close} aria-label="Fechar detalhes" className="!min-h-8 !px-2 !py-1">
          <X size={16} aria-hidden="true" />
        </Button>
      </header>
      {!entry ? <div className="flex flex-col gap-3 text-sm text-muted"><Info size={24} aria-hidden="true" />
        <h2 className="font-display text-2xl text-foreground">Conheça seu acervo</h2>
        <p>Selecione a capa de um livro para consultar seus detalhes. Use “Abrir livro” para começar a trabalhar.</p>
      </div> : entry.kind === "book" ? <LibraryBookDetails book={entry.book} lib={lib} /> : (
        <div className="flex flex-col gap-5">
          <div><p className="editorial-eyebrow">{entry.kind === "universe" ? "Universo" : "Série"}</p>
            <h2 className="mt-2 font-display text-2xl">{entry.collection.name}</h2></div>
          <p className="break-words text-sm text-muted">{entry.collection.description || "Uma coleção para suas histórias."}</p>
          <p className="text-xs text-muted">{entry.books.length} {entry.books.length === 1 ? "livro" : "livros"}</p>
          <LinkButton href={collectionHref(entry)} variant="outline">Explorar coleção</LinkButton>
          <Button variant="outline" disabled={lib.busy} onClick={() => lib.editCollection(entry)}>Editar coleção</Button>
        </div>
      )}
    </aside>
  );
}

import { Plus } from "lucide-react";
import { LibraryCreateOptions } from "@/components/library/LibraryCreateOptions";
import { useLibraryCreateMenu } from "@/hooks/useLibraryCreateMenu";
import type { useLibrary } from "@/hooks/useLibrary";
import styles from "@/components/library/libraryWorkspace.module.css";

export function LibraryCreateMenu({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  const menu = useLibraryCreateMenu();

  return (
    <div className={styles.createItem} data-library-create-card>
      <button ref={menu.triggerRef} type="button" aria-label="Criar na biblioteca" aria-expanded={menu.isOpen}
        popoverTarget={menu.id} disabled={lib.isLoading || lib.busy}
        className={styles.createCard}>
        <Plus aria-hidden="true" size={30} />
        <span className="font-display text-2xl">Adicionar ao acervo</span>
        <span className="text-xs text-muted">{lib.scope.kind === "series" ? "Um novo livro para esta série"
          : lib.scope.kind === "universe" ? "Livro ou série neste universo" : "Livro, série ou universo"}</span>
      </button>
      <div id={menu.id} ref={menu.popoverRef} popover="auto" onToggle={menu.onToggle}
        className="library-create-menu" role="group" aria-label="Opções de criação">
        <LibraryCreateOptions lib={lib} onClose={menu.close} />
      </div>
    </div>
  );
}

import { ChevronDown, Library } from "lucide-react";
import { LibraryTypeFilter } from "@/components/library/LibraryTypeFilter";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { LibraryRecentBooks } from "@/components/library/LibraryRecentBooks";
import type { useLibrary } from "@/hooks/useLibrary";
import panels from "@/components/shared/panelWorkspace.module.css";
import styles from "@/components/library/libraryWorkspace.module.css";

export function LibraryCollections({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  return (
    <nav aria-label="Navegação da biblioteca" className={`${panels.navigation} ${styles.navigation}`}
      data-open={lib.navigation.isOpen}>
      <button type="button" className={styles.navigationToggle} onClick={lib.navigation.toggle}
        aria-expanded={lib.navigation.isOpen} aria-controls="library-navigation">
        <Library size={16} aria-hidden="true" />Navegação e filtros<ChevronDown size={14} aria-hidden="true" />
      </button>
      <div id="library-navigation" className={styles.navigationContent}>
        <div className={styles.typeNavigation}>
          <LibraryTypeFilter value={lib.typeFilter} onChange={lib.setTypeFilter} scopeKind={lib.scope.kind} />
        </div>
        <LibraryFilters lib={lib} />
        <LibraryRecentBooks lib={lib} />
      </div>
    </nav>
  );
}

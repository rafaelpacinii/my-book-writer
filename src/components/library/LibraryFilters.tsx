import { ArrowDownAZ, Ruler, Search } from "lucide-react";
import type { useLibrary } from "@/hooks/useLibrary";
import { Select } from "@/components/ui/Select";
import styles from "@/components/library/libraryWorkspace.module.css";

export function LibraryFilters({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  return (
    <section aria-label="Filtros da biblioteca" className={styles.filters}>
      <div className="library-filters">
        <div className="library-filter-controls">
          <label className="library-search">
            <Search aria-hidden="true" size={15} />
            <input type="search" aria-label="Buscar por título ou autor" placeholder="Buscar livros, séries, universos…"
              value={lib.searchQuery} onChange={(event) => lib.setSearchQuery(event.target.value)} />
          </label>
          <Select compact icon={Ruler} aria-label="Filtrar por formato" value={lib.formatFilter}
            containerClassName="library-filter-select" onChange={(event) => lib.setFormatFilter(event.target.value)}>
            <option value="">Todos os formatos</option>
            {lib.formats.map((format) => <option key={format.id} value={format.id}>{format.name}</option>)}
          </Select>
          <Select compact icon={ArrowDownAZ} aria-label="Ordenar livros" value={lib.sortOrder}
            containerClassName="library-filter-select"
            onChange={(event) => lib.setSortOrder(event.target.value as typeof lib.sortOrder)}>
            <option value="recent">Mais recentes</option>
            <option value="title">Título A–Z</option>
            <option value="author">Autor A–Z</option>
          </Select>
        </div>
      </div>
      <button type="button" onClick={lib.handleClearFilters} disabled={!lib.isFiltered}
        className="mt-3 text-xs text-primary enabled:hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:opacity-50">
        Limpar filtros
      </button>
    </section>
  );
}

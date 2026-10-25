import { ArrowDownAZ, Layers, Ruler, Search } from "lucide-react";
import type { useLibrary } from "@/hooks/useLibrary";
import { Select } from "@/components/ui/Select";
import { LibraryViewToggle } from "@/components/library/LibraryViewToggle";
import { LibraryTypeFilter } from "@/components/library/LibraryTypeFilter";

export function LibraryFilters({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  return (
    <div className="library-filters">
      {lib.scope.kind !== "series" && <LibraryTypeFilter value={lib.typeFilter} onChange={lib.setTypeFilter}
        inUniverse={lib.scope.kind === "universe"} />}
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
        {lib.scope.kind !== "series" && (
          <Select compact icon={Layers} aria-label="Agrupar biblioteca" value={lib.grouping}
            containerClassName="library-filter-select"
            onChange={(event) => lib.setGrouping(event.target.value === "type" ? "type" : "mixed")}>
            <option value="mixed">Todos juntos</option>
            <option value="type">Separar por tipo</option>
          </Select>
        )}
        <LibraryViewToggle view={lib.view} onChange={lib.setView} />
      </div>
    </div>
  );
}

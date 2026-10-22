import { Search } from "lucide-react";
import type { useLibrary } from "@/hooks/useLibrary";
import { LibraryViewToggle } from "@/components/library/LibraryViewToggle";

export function LibraryFilters({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
      <label className="relative min-w-40 flex-1 lg:max-w-64">
        <Search className="pointer-events-none absolute top-3.5 left-3 h-3.5 w-3.5 text-muted" />
        <input type="search" aria-label="Buscar por título ou autor" placeholder="Buscar título ou autor…"
          value={lib.searchQuery} onChange={(event) => lib.setSearchQuery(event.target.value)}
          className="h-[42px] w-full rounded-md border border-border bg-transparent pr-3 pl-9 text-[11px] placeholder:text-muted"
        />
      </label>
      <div className="flex max-w-full flex-wrap items-center gap-2">
        <select aria-label="Filtrar por formato" value={lib.formatFilter}
          onChange={(event) => lib.setFormatFilter(event.target.value)}
          className="h-10 max-w-40 rounded bg-transparent px-1 text-[10px] text-muted"
        >
          <option value="">Todos os formatos</option>
          {lib.formats.map((format) => <option key={format.id} value={format.id}>{format.name}</option>)}
        </select>
        <select aria-label="Ordenar livros" value={lib.sortOrder}
          onChange={(event) => lib.setSortOrder(event.target.value as typeof lib.sortOrder)}
          className="h-10 max-w-36 rounded bg-transparent px-1 text-[10px] text-muted"
        >
          <option value="recent">Mais recentes</option>
          <option value="title">Título A–Z</option>
          <option value="author">Autor A–Z</option>
        </select>
        <LibraryViewToggle view={lib.view} onChange={lib.setView} />
      </div>
    </div>
  );
}

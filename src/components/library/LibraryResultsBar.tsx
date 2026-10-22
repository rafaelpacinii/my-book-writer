interface Props {
  isFiltered: boolean;
  totalResults: number;
  totalBooks: number;
  onClearFilters: () => void;
}

export function LibraryResultsBar({ isFiltered, totalResults, totalBooks, onClearFilters }: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-[25px]">Seu acervo</h2>
      <div className="flex items-center gap-3 text-[10px] text-muted">
        <p role="status" aria-live="polite">
          {isFiltered ? `${totalResults} ${totalResults === 1 ? "resultado" : "resultados"}` : `${totalBooks} ${totalBooks === 1 ? "livro" : "livros"} na sua biblioteca`}
        </p>
        {isFiltered && (
          <button type="button" onClick={onClearFilters} className="text-primary hover:underline">
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
